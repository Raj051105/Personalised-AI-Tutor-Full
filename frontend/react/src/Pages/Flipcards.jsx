import React, { useState, useContext } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";

const Flipcards = ({
  qaList = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 2 + 2?", answer: "4" },
    { question: "What is the largest planet?", answer: "Jupiter" },
    { question: "Who wrote Romeo and Juliet?", answer: "William Shakespeare" },
    { question: "What is H2O commonly known as?", answer: "Water" },
    { question: "What is the speed of light?", answer: "299,792,458 m/s" },
  ],
}) => {
  const { user } = useContext(UserContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % qaList.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) =>
      prev === 0 ? qaList.length - 1 : prev - 1
    );
  };

  const toggleCard = () => setShowAnswer(!showAnswer);
  const closeModal = () => setSelectedCard(null);

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

          {/* Flipcards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {qaList.map((qa, index) => (
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
                    {qa.question.length > 50
                      ? qa.question.substring(0, 50) + "..."
                      : qa.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {selectedCard !== null && (
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
                {showAnswer
                  ? qaList[currentIndex].answer
                  : qaList[currentIndex].question}
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
