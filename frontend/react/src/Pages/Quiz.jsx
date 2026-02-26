import React, { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import axiosInstance, { axiosRag } from "../Utils/axiosInstance";
import { API_PATH } from "../Utils/api_path";

const Quiz = () => {
  const { user } = useContext(UserContext);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  // New states for quiz history and management
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [expandedQuizDetails, setExpandedQuizDetails] = useState({});

  // Fetch subjects and quiz history on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch subjects
        const subjectsRes = await axiosInstance.get("subject/get-all-subject");
        const data = subjectsRes.data;
        if (data?.subjects && data.subjects.length) {
          setSubjects(data.subjects);
          setSelectedSubject((prev) => prev || data.subjects[0]);
        }
        
        // Fetch quiz history
        const historyRes = await axiosInstance.get(API_PATH.QUIZ.GET_ATTEMPTS);
        setQuizHistory(historyRes.data);
      } catch (e) {
        console.error("Failed to fetch initial data:", e?.message || e);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Sync units/topics when subject changes
  useEffect(() => {
    setSelectedUnits([]);
    setSelectedTopics([]);
  }, [selectedSubject]);

  const toggleUnit = (unit) => {
    setSelectedUnits((prev) => {
      const isSelected = prev.some((u) => u.unitName === unit.unitName);
      if (isSelected) {
        return prev.filter((u) => u.unitName !== unit.unitName);
      } else {
        return [...prev, unit];
      }
    });
  };

  const toggleTopic = (topicItem) => {
    setSelectedTopics((prev) => {
      const isSelected = prev.some((t) => t.topicName === topicItem.topicName);
      if (isSelected) {
        return prev.filter((t) => t.topicName !== topicItem.topicName);
      } else {
        return [...prev, topicItem];
      }
    });
  };

  const syncSyllabus = async () => {
    if (!selectedSubject) return;
    setIsSyncing(true);
    try {
      const res = await axiosInstance.post(`subject/refresh-syllabus/${selectedSubject._id}`);
      if (res.data && res.data.units) {
        const updatedUnits = res.data.units;
        const updatedSubject = { ...selectedSubject, units: updatedUnits };
        setSelectedSubject(updatedSubject);
        setSubjects(prev => prev.map(s => s._id === selectedSubject._id ? updatedSubject : s));
        setSelectedUnits([]);
        setSelectedTopics([]);
        alert(`Syllabus for ${selectedSubject.subject_code} synchronized successfully!`);
      }
    } catch (e) {
      console.error("Sync failed:", e.response?.data || e.message);
      alert("AI Extraction failed. Please ensure the local RAG engine (Ollama) is running.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Get topics from all selected units
  const availableTopics = useMemo(() => {
    if (!selectedUnits.length) return [];
    const allTopics = [];
    selectedUnits.forEach((u) => {
      if (u.topics) allTopics.push(...u.topics);
    });
    return allTopics;
  }, [selectedUnits]);

  // Fetch saved quizzes when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    
    async function fetchSavedQuizzes() {
      setLoadingQuizzes(true);
      try {
        const res = await axiosInstance.get(API_PATH.QUIZ.GET_BY_SUBJECT(selectedSubject.subject_code));
        setSavedQuizzes(res.data);
      } catch (e) {
        console.error("Failed to fetch quizzes:", e?.message || e);
        setSavedQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    }
    
    fetchSavedQuizzes();
  }, [selectedSubject]);  // elapsed timer while generating
  useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return;
    }
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [isGenerating]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (submitted) {
      setSubmitted(false);
      setFeedback("");
    }
  };

  // Helper to normalize correct answer(s) into value(s) for comparison
  const normalizeCorrect = (q) => {
    // LLM sample uses 'correct_option' like 'A' and question.options array
    if (q.correct_option) {
      const raw = q.correct_option;
      // allow comma separated letters for multi-answer
      const letters = String(raw).split(/\s*,\s*/).map((s) => s.trim().toUpperCase());
      const values = letters.map((L) => {
        const idx = L.charCodeAt(0) - 65; // A=>0
        return Array.isArray(q.options) && q.options[idx] !== undefined
          ? q.options[idx]
          : L;
      });
      return values.length === 1 ? values[0] : values;
    }

    // existing field names
    if (q.correctAnswer) return q.correctAnswer;
    if (q.correct_answer) return q.correct_answer;
    return null;
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalGradable = 0;

    questions.forEach((q, idx) => {
      const qKey = q._id || q.id || idx + 1;
      const correct = normalizeCorrect(q);
      if (correct !== null && correct !== undefined) {
        totalGradable++;

        const userAnswer = answers[qKey];

        // radio/single choice - compare value equality
        if (!Array.isArray(correct)) {
          if (q.type === 'radio' || q.type === 'paragraph') {
            if (typeof userAnswer !== 'undefined' && userAnswer !== null && userAnswer !== '') {
              // user may have selected the option text or a letter (A/B)
              const userVal = typeof userAnswer === 'string' ? userAnswer.trim() : userAnswer;
              const correctVal = correct;
              if (String(userVal) === String(correctVal)) correctCount++;
              else {
                // also compare by letter index if applicable
                if (Array.isArray(q.options)) {
                  const correctIdx = q.options.findIndex((o) => String(o) === String(correctVal));
                  if (correctIdx >= 0) {
                    const letter = String.fromCharCode(65 + correctIdx);
                    if (String(userVal).toUpperCase() === letter) correctCount++;
                  }
                }
              }
            }
          }

          // checkbox with single correct value means userAnswer should be array containing that value
          if (q.type === 'checkbox') {
            const ua = userAnswer || [];
            if (Array.isArray(ua) && ua.includes(correct)) correctCount++;
          }
        } else {
          // multiple correct answers
          const correctArr = correct;
          if (q.type === 'checkbox') {
            const ua = answers[qKey] || [];
            if (Array.isArray(ua)) {
              const sortedUa = [...ua].map(String).sort();
              const sortedCorrect = [...correctArr].map(String).sort();
              if (JSON.stringify(sortedUa) === JSON.stringify(sortedCorrect)) correctCount++;
            }
          } else {
            // for non-checkbox, if user answered with comma separated letters/values
            const ua = answers[qKey];
            if (ua) {
              const uaParts = String(ua).split(/\s*,\s*/).map((s) => s.trim());
              const sortedUa = uaParts.map(String).sort();
              const sortedCorrect = correctArr.map(String).sort();
              if (JSON.stringify(sortedUa) === JSON.stringify(sortedCorrect)) correctCount++;
            }
          }
        }
      }
    });

    const percentage = totalGradable > 0 ? Math.round((correctCount / totalGradable) * 100) : 0;
    return {
      score: correctCount,
      total: totalGradable,
      percentage,
    };
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q, idx) => {
      const qKey = q._id || q.id || idx + 1;
      return q.type !== "paragraph" && !answers[qKey];
    });
    if (unanswered.length > 0) {
      setFeedback("⚠️ Please answer all questions before submitting.");
      return;
    }

    const result = calculateScore();
    setScore(result);
    setSubmitted(true);

    // Save the quiz and attempt if it's not already saved
    if (!activeQuizId) {
      try {
        const payload = {
          subject_code: selectedSubject?.subject_code,
          topic: topic || (questions[0]?.question || 'Generated Quiz'),
          questions: questions,
        };
        const saveRes = await axiosInstance.post(API_PATH.QUIZ.SAVE_QUIZ, payload);
        const savedQuiz = saveRes.data;
        setActiveQuizId(savedQuiz._id);
        setStartTime(Date.now());
        // Update questions with saved versions (for subdoc IDs)
        if (savedQuiz.questions && savedQuiz.questions.length) {
          setQuestions(savedQuiz.questions);
        }
        // Add to saved quizzes list
        setSavedQuizzes((prev) => [savedQuiz, ...(prev || [])]);
      } catch (e) {
        console.error('Failed to save quiz:', e?.response?.data || e.message || e);
        return; // Don't try to save attempt if quiz save failed
      }
    }

    // Prepare feedback based on score
    if (result.percentage >= 80)
      setFeedback("🎉 Excellent! You've mastered this content!");
    else if (result.percentage >= 60)
      setFeedback("💪 Good job! Keep practicing to improve.");
    else
      setFeedback("📚 Review the material and try again — you've got this!");

    // Save quiz attempt
    if (activeQuizId) {
      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000); // convert to seconds
        
        // Format answers for submission
        const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
          questionId,
          userAnswer
        }));

        await axiosInstance.post(API_PATH.QUIZ.SUBMIT_ATTEMPT(activeQuizId), {
          answers: formattedAnswers,
          timeSpent
        });

        // Update quiz history
        const historyRes = await axiosInstance.get(API_PATH.QUIZ.GET_ATTEMPTS);
        setQuizHistory(historyRes.data);
      } catch (e) {
        console.error("Failed to save quiz attempt:", e?.response?.data || e.message || e);
      }
    }
  };

  const progress = questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  return (
    <BaseLayout user={user} active={"quiz"}>
      <div className="mt-5 mx-auto w-[90%] transition-all duration-300 ease-in-out">
        <h1 className="font-bold text-4xl mb-2 text-[#1a1a1a]">
  Adaptive <span className="text-black">Learning Quiz</span>
</h1>
<p className="font-medium text-lg mb-5 text-gray-600">
  Challenge yourself and track your progress 
</p>


        {/* Progress Bar (show only when a quiz is loaded) */}
        {questions.length > 0 && (
          <div className="relative mb-10">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#730FFF] to-[#A77BFF] h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="absolute top-[-25px] right-0 text-sm font-semibold text-[#730FFF]">
              {progress}% Completed
            </p>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl border border-[#730FFF]/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-[#730FFF] to-[#A77BFF] p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Quiz Section</h2>
            <p className="text-white font-medium mt-1 opacity-90">
              Answer carefully — your journey to mastery begins here!
            </p>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#730FFF] mb-4"></div>
              <p className="text-gray-600 font-semibold">
                Loading quiz questions...
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Controls */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Subject</label>
                    <select
                      value={selectedSubject?._id || ""}
                      onChange={(e) => {
                        const sub = subjects.find(s => s._id === e.target.value);
                        setSelectedSubject(sub);
                      }}
                      className="border-2 border-gray-200 rounded-xl p-2.5 min-w-[200px] focus:border-[#730FFF] outline-none transition-all font-medium"
                    >
                      {subjects.length === 0 && <option value="">No subjects found</option>}
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.subject_name} ({s.subject_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syllabus Sync</label>
                    <button
                      onClick={syncSyllabus}
                      disabled={isSyncing || !selectedSubject}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                        isSyncing 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-[#730FFF]/10 text-[#730FFF] hover:bg-[#730FFF] hover:text-white border-2 border-[#730FFF]/20"
                      }`}
                    >
                      {isSyncing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                          Syncing Units...
                        </>
                      ) : (
                        "Sync AI Plan"
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 ml-auto">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generate</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          if (!selectedSubject) return;
                          setIsGenerating(true);
                          setElapsed(0);
                          try {
                            const queryItems = selectedTopics.length > 0 
                              ? selectedTopics.map(t => t.topicName)
                              : selectedUnits.map(u => u.unitName);
                            
                            const q = queryItems.join(", ") || "";
                            const subjectCode = selectedSubject.subject_code;

                            const res = await axiosRag.post(
                              `/generate/mcqs/${encodeURIComponent(subjectCode)}?query=${encodeURIComponent(
                                q
                              )}`
                            );
                            console.debug("MCQ generation response:", res?.data);
                            const data = res.data;
                            const mcqs = data.mcqs || data.mcq || data.mcqs_list || data.mcq_list || [];
                            // Map to internal format used in this page
                            const mapped = (mcqs || []).map((m, idx) => {
                              const questionText =
                                m.question || m.prompt || m.q || m.question_text || m.title || `Question ${idx + 1}`;
                              const options = m.options || m.choices || m.opts || (m.answers ? Object.values(m.answers) : []) || [];
                              const correctAnswer = m.correctAnswer || m.answer || m.correct || m.correct_answer || (m.correct_options ? m.correct_options : undefined);
                              const correct_option = m.correct_option || m.correctOption || (typeof correctAnswer === 'string' && /^[A-D,a-d]$/.test(correctAnswer.trim()) ? correctAnswer.trim().toUpperCase() : undefined);

                              let mappedCorrectAnswer = correctAnswer;
                              if (correct_option && options.length > 0) {
                                const idx_opt = correct_option.charCodeAt(0) - 65;
                                if (idx_opt >= 0 && idx_opt < options.length) {
                                  mappedCorrectAnswer = options[idx_opt];
                                }
                              }

                              return {
                                id: idx + 1,
                                question: questionText,
                                type: options && options.length > 1 ? "radio" : "paragraph",
                                options: options,
                                correctAnswer: mappedCorrectAnswer,
                                correct_option: correct_option,
                              };
                            });
                            setQuestions(mapped);
                            setAnswers({});
                            setFeedback("");
                            setTopic(q); // Store current query as topic for saving
                            setActiveQuizId(null);
                            setStartTime(Date.now());
                          } catch (e) {
                            console.error("Generate MCQs failed:", e?.response?.data || e.message || e);
                            setQuestions([]);
                          } finally {
                            setIsGenerating(false);
                          }
                        }}
                        className="px-6 py-2.5 bg-[#730FFF] text-white rounded-xl font-bold hover:bg-[#6000FF] shadow-lg shadow-[#730FFF]/30 transition-all disabled:opacity-50"
                        disabled={!selectedSubject || isGenerating || (selectedUnits.length === 0 && selectedTopics.length === 0)}
                      >
                        {isGenerating ? "Generating Quiz..." : "Start AI Quiz"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* New Unit/Topic selection UI */}
                {selectedSubject?.units?.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#730FFF]/10 text-[#730FFF] flex items-center justify-center text-xs">1</span>
                        Select Units for Quiz
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubject.units.map((unit) => {
                          const isSelected = selectedUnits.some(u => u.unitName === unit.unitName);
                          return (
                            <button
                              key={unit.unitName}
                              onClick={() => toggleUnit(unit)}
                              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                                isSelected 
                                  ? "bg-[#730FFF] text-white border-[#730FFF]" 
                                  : "bg-white text-gray-600 border-gray-200 hover:border-[#730FFF]/50"
                              }`}
                            >
                              {unit.unitName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {availableTopics.length > 0 && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#730FFF]/10 text-[#730FFF] flex items-center justify-center text-xs">2</span>
                          Narrow down by Topics (Optional)
                        </h4>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {availableTopics.map((topicItem) => {
                            const isSelected = selectedTopics.some(t => t.topicName === topicItem.topicName);
                            return (
                              <button
                                key={topicItem.topicName}
                                onClick={() => toggleTopic(topicItem)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                  isSelected 
                                    ? "bg-[#A77BFF] text-white border-[#A77BFF]" 
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {topicItem.topicName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isGenerating && (
                  <div className="flex items-center gap-3 p-4 bg-[#730FFF]/5 rounded-xl border border-[#730FFF]/20 animate-pulse">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#730FFF] border-t-transparent"></div>
                    <p className="text-[#730FFF] font-medium text-sm">
                      Crafting your personalized quiz... Elapsed: {elapsed}s
                    </p>
                  </div>
                )}
              </div>

              {/* Empty lander and Quiz History (only) */}
              {questions.length === 0 && !isGenerating && (
                <div className="space-y-8">
                  <div className="p-8 text-center text-gray-600">
                    <p className="mb-4">No quiz content available yet.</p>
                    <p className="mb-4">Use the controls above to generate a dynamic quiz from your subject materials.</p>
                  </div>

                  {/* Quiz History Section (only) */}
                  {quizHistory.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Quiz History</h3>
                      <div className="space-y-2">
                        {quizHistory.map((attempt) => {
                          // compute percentage if backend uses different field
                          const pct =
                            typeof attempt.percentageScore !== 'undefined'
                              ? Math.round(attempt.percentageScore)
                              : typeof attempt.percentage === 'number'
                              ? Math.round(attempt.percentage)
                              : attempt.maxScore
                              ? Math.round((attempt.score / attempt.maxScore) * 100)
                              : attempt.score || 0;

                          const isExpanded = expandedAttemptId === attempt._id;

                          return (
                            <div key={attempt._id} className="border rounded-lg overflow-hidden bg-white">
                              <div className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                  <div className="font-medium text-lg">{attempt.quiz?.topic || 'Untitled Quiz'}</div>
                                  <div className="text-sm text-gray-600">{attempt.quiz?.subject || ''} • {new Date(attempt.createdAt || attempt.completedAt || attempt.updatedAt || Date.now()).toLocaleString()}</div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                  }`}> {pct}% </div>
                                  <div className="text-sm text-gray-500">{Math.floor((attempt.timeSpent || 0) / 60)}m {(attempt.timeSpent || 0) % 60}s</div>
                                  <button
                                    className="ml-4 px-4 py-2 bg-[#730FFF] text-white rounded-lg hover:bg-[#6000FF] transition-colors"
                                    onClick={async () => {
                                      // Retake: load the quiz questions for this quiz
                                      try {
                                        const res = await axiosInstance.get(API_PATH.QUIZ.GET_QUIZ(attempt.quiz._id));
                                        if (res.data && res.data.quiz && res.data.quiz.questions) {
                                          setQuestions(res.data.quiz.questions);
                                          setAnswers({});
                                          setFeedback("");
                                          setStartTime(Date.now());
                                          setActiveQuizId(attempt.quiz._id);
                                        }
                                      } catch (e) {
                                        console.error('Failed to load quiz for retake:', e?.message || e);
                                      }
                                    }}
                                  >
                                    Retake
                                  </button>
                                  <button
                                    className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    onClick={async () => {
                                      if (isExpanded) {
                                        setExpandedAttemptId(null);
                                        return;
                                      }
                                      setExpandedAttemptId(attempt._id);
                                      if (!expandedQuizDetails[attempt.quiz._id]) {
                                        try {
                                          const res = await axiosInstance.get(API_PATH.QUIZ.GET_QUIZ(attempt.quiz._id));
                                          setExpandedQuizDetails((prev) => ({
                                            ...prev,
                                            [attempt.quiz._id]: res.data,
                                          }));
                                        } catch (e) {
                                          console.error('Failed to fetch quiz details:', e?.message || e);
                                        }
                                      }
                                    }}
                                  >
                                    {isExpanded ? 'Hide' : 'View'}
                                  </button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-4 border-t">
                                  {/* show quiz questions and attempt answers when available */}
                                  {expandedQuizDetails[attempt.quiz._id] ? (
                                    (() => {
                                      const { quiz, attempts } = expandedQuizDetails[attempt.quiz._id];
                                      const thisAttempt = attempts?.find((a) => a._id === attempt._id) || attempt;
                                      return (
                                        <div className="space-y-3">
                                          <div className="text-sm text-gray-700">Detailed Results</div>
                                          <div className="space-y-2">
                                            {quiz.questions.map((qq, qi) => {
                                              // find user's answer for this question in attempt.answers
                                              const ansObj = (thisAttempt.answers || []).find((a) => String(a.questionId) === String(qq._id) || a.questionId == qq.id || a.questionId == qi + 1);
                                              const userAns = ansObj ? ansObj.userAnswer : null;
                                              const isCorrect = ansObj ? ansObj.isCorrect : null;
                                              // normalize correct for display
                                              const correct = (() => {
                                                if (qq.correct_option) {
                                                  const letters = String(qq.correct_option).split(/\s*,\s*/).map((s) => s.trim().toUpperCase());
                                                  return letters.map((L) => {
                                                    const idx = L.charCodeAt(0) - 65;
                                                    return Array.isArray(qq.options) && qq.options[idx] ? qq.options[idx] : L;
                                                  }).join(', ');
                                                }
                                                if (qq.correctAnswer) return Array.isArray(qq.correctAnswer) ? qq.correctAnswer.join(', ') : qq.correctAnswer;
                                                if (qq.correct_answer) return qq.correct_answer;
                                                return '-';
                                              })();

                                              return (
                                                <div key={qi} className="p-3 rounded-md border">
                                                  <div className="font-medium">{qi + 1}. {qq.question || qq.question_text || qq.q}</div>
                                                  
                                                  {/* Show options with color coding if multiple choice */}
                                                  {qq.options && qq.options.length > 0 ? (
                                                    <div className="mt-2 space-y-1">
                                                      {qq.options.map((opt, optIdx) => {
                                                        const isUserChoice = Array.isArray(userAns) 
                                                          ? userAns.includes(opt)
                                                          : userAns === opt;
                                                        
                                                        const isCorrectOption = Array.isArray(correct) 
                                                          ? correct.includes(opt)
                                                          : correct === opt;

                                                        return (
                                                          <div 
                                                            key={optIdx}
                                                            className={`text-sm p-2 rounded-md ${
                                                              isUserChoice
                                                                ? isCorrectOption
                                                                  ? 'bg-green-100 text-green-800'
                                                                  : 'bg-red-100 text-red-800'
                                                                : isCorrectOption
                                                                  ? 'bg-green-100/50 text-green-800'
                                                                  : ''
                                                            }`}
                                                          >
                                                            {String.fromCharCode(65 + optIdx)}. {opt}
                                                            {isUserChoice && (
                                                              <span className="ml-2 font-medium">
                                                                {isCorrectOption ? '✓' : '✗'}
                                                              </span>
                                                            )}
                                                            {!isUserChoice && isCorrectOption && (
                                                              <span className="ml-2 font-medium text-green-600">
                                                                (Correct Answer)
                                                              </span>
                                                            )}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  ) : (
                                                    // For paragraph/text answers
                                                    <div className="mt-2">
                                                      <div className={`text-sm p-2 rounded-md ${
                                                        isCorrect === true
                                                          ? 'bg-green-100 text-green-800'
                                                          : 'bg-red-100 text-red-800'
                                                      }`}>
                                                        Your answer: {Array.isArray(userAns) ? userAns.join(', ') : userAns ?? '-'}
                                                        <span className="ml-2 font-medium">
                                                          {isCorrect ? '✓' : '✗'}
                                                        </span>
                                                      </div>
                                                      <div className="text-sm p-2 mt-1 rounded-md bg-green-100/50 text-green-800">
                                                        Correct answer: {correct}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div className="text-sm text-gray-600">Loading details…</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isGenerating && (
                <div className="p-6 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#730FFF] mx-auto mb-4"></div>
                  <p className="font-medium">Generating quiz — this can take 30–60 seconds.</p>
                  <p className="text-sm">Response will appear automatically when ready.</p>
                </div>
              )}

              {feedback && !submitted && (
                <div className="p-4 rounded-lg bg-yellow-100 text-yellow-800 font-semibold shadow-sm">
                  {feedback}
                </div>
              )}

              {questions.map((q, i) => {
                const qKey = q._id || q.id || i + 1;
                const correct = normalizeCorrect(q);
                const userAnswer = answers[qKey];
                let isCorrect = null;
                
                if (submitted) {
                  if (!Array.isArray(correct)) {
                    if (q.type === 'radio' || q.type === 'paragraph') {
                      const userVal = typeof userAnswer === 'string' ? userAnswer.trim() : userAnswer;
                      const correctVal = correct;
                      isCorrect = String(userVal) === String(correctVal);
                      if (!isCorrect && Array.isArray(q.options)) {
                        const correctIdx = q.options.findIndex((o) => String(o) === String(correctVal));
                        if (correctIdx >= 0) {
                          const letter = String.fromCharCode(65 + correctIdx);
                          isCorrect = String(userVal).toUpperCase() === letter;
                        }
                      }
                    } else if (q.type === 'checkbox') {
                      const ua = userAnswer || [];
                      isCorrect = Array.isArray(ua) && ua.includes(correct);
                    }
                  } else {
                    const correctArr = correct;
                    if (q.type === 'checkbox') {
                      const ua = userAnswer || [];
                      if (Array.isArray(ua)) {
                        const sortedUa = [...ua].map(String).sort();
                        const sortedCorrect = [...correctArr].map(String).sort();
                        isCorrect = JSON.stringify(sortedUa) === JSON.stringify(sortedCorrect);
                      }
                    } else {
                      const ua = userAnswer;
                      if (ua) {
                        const uaParts = String(ua).split(/\s*,\s*/).map((s) => s.trim());
                        const sortedUa = uaParts.map(String).sort();
                        const sortedCorrect = correctArr.map(String).sort();
                        isCorrect = JSON.stringify(sortedUa) === JSON.stringify(sortedCorrect);
                      }
                    }
                  }
                }

                return (
                <div
                  key={qKey}
                  className="p-5 rounded-xl border border-[#730FFF]/30 bg-gray-50 hover:bg-white transition duration-500 shadow-sm hover:shadow-md transform hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`${
                      submitted 
                        ? isCorrect 
                          ? "bg-green-600" 
                          : "bg-red-600" 
                        : "bg-[#730FFF]"
                    } text-white font-bold rounded-full w-7 h-7 flex items-center justify-center`}>
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {q.question}
                    </h3>
                  </div>

                  {/* Radio Type */}
                  {q.type === "radio" && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((opt, idx) => {
                        const optIsCorrect = submitted && String(opt) === String(correct);
                        const optIsSelected = answers[qKey] === opt;
                        return (
                          <label
                            key={idx}
                            className={`flex items-center p-2 rounded cursor-pointer transition ${
                              submitted
                                ? optIsCorrect
                                  ? "bg-green-100 text-green-800"
                                  : optIsSelected
                                    ? "bg-red-100 text-red-800"
                                    : "hover:bg-[#f3e8ff]"
                                : "hover:bg-[#f3e8ff]"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qKey}`}
                              value={opt}
                              checked={optIsSelected}
                              onChange={(e) => handleChange(qKey, e.target.value)}
                              className={`mr-2 ${
                                submitted
                                  ? optIsCorrect
                                    ? "accent-green-600"
                                    : "accent-red-600"
                                  : "accent-[#730FFF]"
                              }`}
                              disabled={submitted}
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Checkbox Type */}
                  {q.type === "checkbox" && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((opt, idx) => {
                        const optIsCorrect = submitted && (Array.isArray(correct) ? correct.includes(opt) : correct === opt);
                        const optIsSelected = answers[qKey] && answers[qKey].includes(opt);
                        return (
                          <label
                            key={idx}
                            className={`flex items-center p-2 rounded cursor-pointer transition ${
                              submitted
                                ? optIsCorrect
                                  ? "bg-green-100 text-green-800"
                                  : optIsSelected
                                    ? "bg-red-100 text-red-800"
                                    : "hover:bg-[#f3e8ff]"
                                : "hover:bg-[#f3e8ff]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={opt}
                              checked={optIsSelected}
                              onChange={(e) => {
                                const current = answers[qKey] || [];
                                handleChange(
                                  qKey,
                                  e.target.checked
                                    ? [...current, opt]
                                    : current.filter((a) => a !== opt)
                                );
                              }}
                              className={`mr-2 ${
                                submitted
                                  ? optIsCorrect
                                    ? "accent-green-600"
                                    : "accent-red-600"
                                  : "accent-[#730FFF]"
                              }`}
                              disabled={submitted}
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Paragraph Type */}
                  {q.type === "paragraph" && (
                    <div className="space-y-2">
                      <textarea
                        className={`w-full mt-2 border rounded-lg p-3 focus:ring-[#730FFF] focus:border-[#730FFF] bg-white ${
                          submitted
                            ? isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-[#730FFF]/30"
                        }`}
                        rows="4"
                        placeholder="Type your answer here..."
                        value={answers[qKey] || ""}
                        onChange={(e) => handleChange(qKey, e.target.value)}
                        disabled={submitted}
                      ></textarea>
                      {submitted && (
                        <div className="text-sm font-medium mt-2">
                          <div className="text-green-700">Correct answer: {String(correct)}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show correct answer for radio/checkbox after submission */}
                  {submitted && (q.type === "radio" || q.type === "checkbox") && (
                    <div className="ml-10 mt-3 text-sm font-medium text-green-700">
                      Correct answer: {Array.isArray(correct) ? correct.join(", ") : String(correct)}
                    </div>
                  )}
                </div>
                )
              })}

              {/* Results */}
              {submitted && score && (
                <div
                  className={`mt-8 mb-6 p-5 rounded-xl font-semibold text-center shadow-md ${
                    score.percentage >= 80
                      ? "bg-green-100 text-green-800"
                      : score.percentage >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">Quiz Results</h3>
                  <p className="mb-2 text-lg">{feedback}</p>
                  <p>
                    Score: {score.score}/{score.total} ({score.percentage}%)
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-center mt-8">
                {submitted ? (
                  <button
                    className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-transform hover:scale-105"
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                      setFeedback("");
                      setScore(null);
                    }}
                  >
                    Try Again
                  </button>
                ) : (
                  <button
                    className="bg-gradient-to-r from-[#730FFF] to-[#A77BFF] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-transform hover:scale-105"
                    onClick={handleSubmit}
                  >
                    Submit Answers
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Quiz;

