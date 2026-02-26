import React, { useState, useContext, useEffect, useMemo } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import axiosInstance, { axiosRag } from "../Utils/axiosInstance";

const Flipcards = ({
  qaList = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 2 + 2?", answer: "4" },
  ],
}) => {
  const { user } = useContext(UserContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [qaListState, setQaListState] = useState(qaList);

  // generation controls
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % qaListState.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev === 0 ? qaListState.length - 1 : prev - 1));
  };

  const toggleCard = () => setShowAnswer(!showAnswer);
  const closeModal = () => setSelectedCard(null);

  useEffect(() => {
    // fetch available subjects from backend
    async function fetchSubjects() {
      try {
        const res = await axiosInstance.get("subject/get-all-subject");
        const data = res.data;
        if (data?.subjects && data.subjects.length) {
          setSubjects(data.subjects);
          
          // If we have a selected subject, find it in the new data to update with latest units/topics
          if (selectedSubject) {
            const updated = data.subjects.find(s => s._id === selectedSubject._id);
            if (updated) setSelectedSubject(updated);
          } else {
            // Auto-select first subject if none selected
            setSelectedSubject(data.subjects[0]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch subjects:", e.message || e);
      }
    }
    fetchSubjects();
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
    // Remove topics associated with unselected units if user unselects
    // But for simplicity, we'll let the user manage topics or reset
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => {
      const isSelected = prev.some((t) => t.topicName === topic.topicName);
      if (isSelected) {
        return prev.filter((t) => t.topicName !== topic.topicName);
      } else {
        return [...prev, topic];
      }
    });
  };

  const syncSyllabus = async () => {
    if (!selectedSubject) return;
    setIsSyncing(true);
    try {
      const res = await axiosInstance.post(`subject/refresh-syllabus/${selectedSubject._id}`);
      if (res.data && res.data.units) {
        // Update both the subject list and the current selection
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

  const generateFlashcards = async (numCards = 10) => {
    if (!selectedSubject) return;
    setIsGenerating(true);
    setElapsed(0);
    try {
      // If topics are selected, use them. Otherwise use unit names.
      const queryItems = selectedTopics.length > 0 
        ? selectedTopics.map(t => t.topicName)
        : selectedUnits.map(u => u.unitName);
      
      const q = queryItems.join(", ") || "";
      const subjectCode = selectedSubject.subject_code;
      const res = await axiosRag.post(
        `/generate/flashcards/${encodeURIComponent(subjectCode)}?query=${encodeURIComponent(
          q
        )}&num_cards=${numCards}`
      );
      console.debug("Flashcard generation response:", res?.data);
      const data = res.data;
      const cards = data.flashcards || data.cards || [];
      // Map to {question, answer}
      const mapped = cards.map((c, idx) => {
        if (typeof c === "string") return { question: c, answer: "" };
        return {
          question:
            c.question || c.front || c.prompt || c.q || c.question_text || `Card ${idx + 1}`,
          answer: c.answer || c.back || c.a || c.answer_text || "",
        };
      });
      setQaListState(mapped);
      setSelectedCard(null);
      setCurrentIndex(0);
    } catch (e) {
      console.error("Generate flashcards failed:", e?.response?.data || e.message || e);
      setQaListState([]);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isGenerating) {
      setElapsed(0);
      return;
    }
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [isGenerating]);

  return (
    <BaseLayout user={user} active={"flipcards"}>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Flipcards Section - Left Aligned */}
        <div className="w-full p-8 overflow-y-auto text-left">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
              Flipcard Session
            </h1>
            <div className="mt-2 w-20 h-1 bg-[#730FFF] rounded-full"></div>
          </div>

          {/* Controls - Tabs */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Subject Tabs */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center pr-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subjects</span>
                {selectedSubject && (
                  <button 
                    onClick={syncSyllabus}
                    disabled={isSyncing}
                    className="text-[10px] font-bold text-[#730FFF] hover:underline flex items-center gap-1 group"
                  >
                    <span className={isSyncing ? "animate-spin" : "group-hover:rotate-12 transition-transform"}>🔄</span>
                    {isSyncing ? "Syncing..." : "Sync Syllabus with AI"}
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {subjects.length === 0 && <span className="text-sm text-gray-400 italic">No subjects available.</span>}
                {subjects.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSubject(s)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                      selectedSubject?._id === s._id
                        ? "bg-[#730FFF] text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Tabs */}
            {selectedSubject && (
              <div className="flex flex-col gap-2 animate-fadeIn transition-all duration-300">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Units (Multi-select)</span>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {selectedSubject.units?.length > 0 ? (
                    selectedSubject.units.map((u, idx) => {
                      const isSelected = selectedUnits.some(su => su.unitName === u.unitName);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleUnit(u)}
                          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-md"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {u.unitName}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400 italic">No units extracted for this subject.</span>
                  )}
                </div>
              </div>
            )}

            {/* Topic Tabs */}
            {selectedUnits.length > 0 && (
              <div className="flex flex-col gap-2 animate-fadeIn transition-all duration-300">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Topics (Multi-select)</span>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {availableTopics.length > 0 ? (
                    availableTopics.map((t, idx) => {
                      const isSelected = selectedTopics.some(st => st.topicName === t.topicName);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleTopic(t)}
                          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-purple-500 text-white shadow-md"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {t.topicName}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400 italic">No topics found for the selected units.</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Row */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => generateFlashcards(10)}
                className="px-6 py-2.5 bg-[#730FFF] text-white rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:bg-gray-400 shadow-lg shadow-purple-200"
                disabled={isGenerating || !selectedSubject}
              >
                {isGenerating ? "Magic in progress..." : "✨ Generate Flashcards"}
              </button>
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium animate-pulse">
                   <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                   Crunching notes... ({elapsed}s)
                </div>
              )}
            </div>
          </div>

          {/* Empty state when no cards */}
          {qaListState.length === 0 && !isGenerating && (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-4">No flashcard content available yet.</p>
              <p className="mb-4">Use the controls above to generate dynamic flashcards from your subject materials.</p>
            </div>
          )}

          {/* Loading state while generating */}
          {isGenerating && (
            <div className="p-6 text-center text-gray-600">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#730FFF] mx-auto mb-4"></div>
              <p className="font-medium">Generating flashcards — this can take 30–60 seconds.</p>
              <p className="text-sm">Response will appear automatically when ready.</p>
            </div>
          )}

          {/* Flashcards Grid - only show when we have cards and not generating */}
          {qaListState.length > 0 && !isGenerating && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {qaListState.map((qa, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-xl p-5 border border-[#B38CFF] cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  setSelectedCard(index);
                  setCurrentIndex(index);
                  setShowAnswer(false);
                }}
              >
                <div className="text-left">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-[#730FFF] rounded-full mb-3 shadow-md">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2 font-semibold">
                    Question
                  </div>
                  <p className="text-sm text-gray-800 font-medium line-clamp-3">
                    {qa.question && qa.question.length > 50
                      ? qa.question.substring(0, 50) + "..."
                      : qa.question}
                  </p>
                </div>
               </div>
             ))}
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedCard !== null && qaListState[currentIndex] && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 bg-opacity-60 p-6">
            <div className="absolute inset-0" onClick={closeModal} />

            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-gray-300 bg-gray-700 rounded-full p-2 hover:bg-gray-600 transition"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Card Counter */}
            <div className="mb-3 text-gray-200 text-sm z-10">
              Card {currentIndex + 1} of {qaListState.length}
            </div>

            {/* Flipcard Body - forced white background */}
            <div className="relative !bg-white rounded-2xl drop-shadow-2xl w-[400px] h-[250px] flex flex-col items-center justify-center text-center p-6 border border-[#B38CFF] transition-all duration-500 z-10">
              <div className="text-purple-600 font-semibold text-xl mb-2">
                {showAnswer ? "A" : "Q"}
              </div>

              <h2 className="text-gray-900 font-medium text-lg mb-4">
                {showAnswer ? "Answer" : "Question"}
              </h2>

              <p className="text-gray-800 mb-6 text-base leading-relaxed">
                {showAnswer ? qaListState[currentIndex].answer : qaListState[currentIndex].question}
              </p>

              <button
                onClick={toggleCard}
                className="text-sm text-purple-600 font-medium hover:underline focus:outline-none"
              >
                {showAnswer ? "Click to see question" : "Click to see answer"}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex mt-6 space-x-4 z-10">
              <button
                onClick={prevCard}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
              >
                ◀ Previous
              </button>
              <button
                onClick={nextCard}
                className="px-4 py-2 bg-[#730FFF] text-white rounded-lg hover:bg-purple-800 flex items-center"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default Flipcards;
