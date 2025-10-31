import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import axiosInstance, { axiosRag } from "../Utils/axiosInstance";

const Quiz = () => {
  const { user } = useContext(UserContext);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuestions([
        {
          id: 1,
          question: "What is the capital of France?",
          type: "radio",
          options: ["Paris", "London", "Berlin", "Madrid"],
          correctAnswer: "Paris",
        },
      ]);
      setLoading(false);
    }, 600);

    // fetch subjects
    async function fetchSubjects() {
      try {
  const res = await axiosRag.get("/subjects");
        const data = res.data;
        if (data?.subjects && data.subjects.length) {
          setSubjects(data.subjects);
          setSelectedSubject((prev) => prev || data.subjects[0]);
        }
      } catch (e) {
        console.error("Failed to fetch subjects:", e?.message || e);
      }
    }
    fetchSubjects();

    return () => clearTimeout(timer);
  }, []);

  // elapsed timer while generating
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

  const calculateScore = () => {
    let correctCount = 0;
    let totalGradable = 0;
    questions.forEach((q) => {
      if (q.correctAnswer) {
        totalGradable++;
        if (q.type === "radio" && answers[q.id] === q.correctAnswer) correctCount++;
        else if (q.type === "checkbox") {
          const userAnswers = answers[q.id] || [];
          const correctAnswers = q.correctAnswer;
          const isCorrect =
            userAnswers.length === correctAnswers.length &&
            correctAnswers.every((item) => userAnswers.includes(item));
          if (isCorrect) correctCount++;
        }
      }
    });
    return {
      score: correctCount,
      total: totalGradable,
      percentage: Math.round((correctCount / totalGradable) * 100),
    };
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => q.type !== "paragraph" && !answers[q.id]
    );
    if (unanswered.length > 0) {
      setFeedback("⚠️ Please answer all questions before submitting.");
      return;
    }

    const result = calculateScore();
    setScore(result);
    setSubmitted(true);

    if (result.percentage >= 80)
      setFeedback("🎉 Excellent! You’ve mastered this content!");
    else if (result.percentage >= 60)
      setFeedback("💪 Good job! Keep practicing to improve.");
    else
      setFeedback("📚 Review the material and try again — you’ve got this!");
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <BaseLayout user={user} active={"quiz"}>
      <div className="mt-5 mx-auto w-[90%] transition-all duration-300 ease-in-out">
        <h1 className="font-bold text-4xl mb-2 text-[#1a1a1a]">
  Adaptive <span className="text-black">Learning Quiz</span>
</h1>
<p className="font-medium text-lg mb-5 text-gray-600">
  Challenge yourself and track your progress 
</p>


        {/* Progress Bar */}
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
              <div className="flex items-center gap-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="border rounded p-2"
                >
                  {subjects.length === 0 && <option value="">No subjects</option>}
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Enter topic (optional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border rounded p-2 w-64"
                />

                <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!selectedSubject) return;
                    setIsGenerating(true);
                    setElapsed(0);
                    try {
                      const res = await axiosRag.post(
                        `/generate/mcqs/${encodeURIComponent(selectedSubject)}?query=${encodeURIComponent(
                          topic || ""
                        )}`
                      );
                      console.debug("MCQ generation response:", res?.data);
                      const data = res.data;
                      const mcqs = data.mcqs || data.mcq || data.mcqs_list || data.mcq_list || [];
                      // Map to internal format used in this page
                      const mapped = (mcqs || []).map((m, idx) => {
                        // try multiple possible shapes
                        const questionText =
                          m.question || m.prompt || m.q || m.question_text || m.title || `Question ${idx + 1}`;
                        const options = m.options || m.choices || m.opts || (m.answers ? Object.values(m.answers) : []) || [];
                        const correctAnswer = m.correctAnswer || m.answer || m.correct || m.correct_answer || (m.correct_options ? m.correct_options : undefined);
                        return {
                          id: idx + 1,
                          question: questionText,
                          type: options && options.length > 1 ? "radio" : "paragraph",
                          options: options,
                          correctAnswer: correctAnswer,
                        };
                      });
                      setQuestions(mapped);
                      setAnswers({});
                      setFeedback("");
                    } catch (e) {
                      console.error("Generate MCQs failed:", e?.response?.data || e.message || e);
                      setQuestions([]);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#730FFF] text-white rounded-lg"
                  disabled={!selectedSubject || isGenerating}
                >
                  {isGenerating ? "Generating…" : "Generate Quiz"}
                </button>

                {/* elapsed timer and hint */}
                {isGenerating && (
                  <div className="text-sm text-gray-600 ml-3">
                    Generating — this can take up to a minute. Elapsed: {elapsed}s
                  </div>
                )}
                </div>
              </div>

              {/* Empty lander when no questions */}
              {questions.length === 0 && !isGenerating && (
                <div className="p-8 text-center text-gray-600">
                  <p className="mb-4">No quiz content available yet.</p>
                  <p className="mb-4">Use the controls above to generate a dynamic quiz from your subject materials.</p>
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

              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-[#730FFF]/30 bg-gray-50 hover:bg-white transition duration-500 shadow-sm hover:shadow-md transform hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="bg-[#730FFF] text-white font-bold rounded-full w-7 h-7 flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {q.question}
                    </h3>
                  </div>

                  {/* Radio Type */}
                  {q.type === "radio" && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center p-2 rounded cursor-pointer hover:bg-[#f3e8ff] transition"
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            className="mr-2 accent-[#730FFF]"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox Type */}
                  {q.type === "checkbox" && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center p-2 rounded cursor-pointer hover:bg-[#f3e8ff] transition"
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            checked={answers[q.id] && answers[q.id].includes(opt)}
                            onChange={(e) => {
                              const current = answers[q.id] || [];
                              handleChange(
                                q.id,
                                e.target.checked
                                  ? [...current, opt]
                                  : current.filter((a) => a !== opt)
                              );
                            }}
                            className="mr-2 accent-[#730FFF]"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Paragraph Type */}
                  {q.type === "paragraph" && (
                    <textarea
                      className="w-full mt-2 border border-[#730FFF]/30 rounded-lg p-3 focus:ring-[#730FFF] focus:border-[#730FFF] bg-white"
                      rows="4"
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    ></textarea>
                  )}
                </div>
              ))}

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

