import React, { useState } from "react";

const Flipcards = ({
  qaList = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 2 + 2?", answer: "4" },
    { question: "What is the largest planet?", answer: "Jupiter" },
    { question: "Who wrote Romeo and Juliet?", answer: "William Shakespeare" },
    { question: "What is H2O?", answer: "Water" },
    { question: "What year was the moon landing?", answer: "1969" },
  ],
}) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = (index) => {
    setSelectedCard(index);
    setFlipped(true); // Show answer directly when card is clicked
  };

  const closeModal = () => {
    setSelectedCard(null);
    setFlipped(false);
  };

  const selectedQA = selectedCard !== null ? qaList[selectedCard] : null;

  return (
    <div className="relative">
      {/* Grid Layout - Blurred when modal is open */}
      <div className={`transition-all duration-300 ${selectedCard !== null ? 'blur-sm' : ''}`}>
        <div className="w-full p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Flipcards Study Session</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {qaList.map((qa, index) => (
              <div
                key={index}
                className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200 cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => handleCardClick(index)}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full mb-3">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Question</div>
                  <p className="text-sm text-gray-700 font-medium line-clamp-3">
                    {qa.question.length > 50 ? qa.question.substring(0, 50) + "..." : qa.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoomed Card Modal */}
      {selectedCard !== null && (
        <div className="fixed inset-0 z-50 flex bg-transparent items-center justify-center bg-black bg-opacity-60">
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="relative z-10">
            {/* Close Button */}
            <button
              className="absolute -top-4 -right-4 z-20 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Card Progress */}
            <div className="text-center mb-4">
              <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Card {selectedCard + 1} of {qaList.length}
              </span>
            </div>

            {/* Flipcard */}
            <div
              className={`relative w-96 h-64 cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`}
              onClick={() => setFlipped((f) => !f)}
              tabIndex={0}
              role="button"
              aria-pressed={flipped}
            >
              {/* Front */}
              <div className="absolute w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 flex flex-col justify-center p-8 [backface-visibility:hidden]">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4">
                    <span className="text-white font-bold">Q</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Question</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{selectedQA?.question}</p>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <span className="text-sm text-blue-500 bg-white px-3 py-1 rounded-full shadow">
                    Click to reveal answer
                  </span>
                </div>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl border border-green-200 flex flex-col justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Answer</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{selectedQA?.answer}</p>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <span className="text-sm text-green-500 bg-white px-3 py-1 rounded-full shadow">
                    Click to see question
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  if (selectedCard > 0) {
                    setSelectedCard(selectedCard - 1);
                    setFlipped(false); // Show answer for previous card
                  }
                }}
                disabled={selectedCard === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <button
                onClick={() => {
                  if (selectedCard < qaList.length - 1) {
                    setSelectedCard(selectedCard + 1);
                    setFlipped(false); // Show answer for next card
                  }
                }}
                disabled={selectedCard === qaList.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flipcards;