import React, { useState, useContext, useEffect } from "react";
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
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
  const res = await axiosRag.get("/subjects");
        const data = res.data;
        if (data?.subjects && data.subjects.length) {
          setSubjects(data.subjects);
          setSelectedSubject((prev) => prev || data.subjects[0]);
        }
      } catch (e) {
        console.error("Failed to fetch subjects:", e.message || e);
      }
    }
    fetchSubjects();
  }, []);

  const generateFlashcards = async (numCards = 8) => {
    if (!selectedSubject) return;
    setIsGenerating(true);
    setElapsed(0);
    try {
      const q = topic || "";
      const res = await axiosRag.post(
        `/generate/flashcards/${encodeURIComponent(selectedSubject)}?query=${encodeURIComponent(
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

          {/* Controls */}
          <div className="flex items-center gap-3 mb-6">
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

            <button
              onClick={() => generateFlashcards(8)}
              className="px-4 py-2 bg-[#730FFF] text-white rounded-lg"
              disabled={isGenerating || !selectedSubject}
            >
              {isGenerating ? "Generating…" : "Generate Flashcards"}
            </button>
            {/* elapsed timer and hint */}
            {isGenerating && (
              <div className="text-sm text-gray-600 ml-3">
                Generating — this can take up to a minute. Elapsed: {elapsed}s
              </div>
            )}
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
              Card {currentIndex + 1} of {qaList.length}
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
