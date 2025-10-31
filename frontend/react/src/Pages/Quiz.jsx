import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";

const Quiz = () => {
  const { user } = useContext(UserContext);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);

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
        {
          id: 2,
          question: "Select the prime numbers:",
          type: "checkbox",
          options: ["2", "3", "4", "6"],
          correctAnswer: ["2", "3"],
        },
        {
          id: 3,
          question: "What is 5 + 7?",
          type: "radio",
          options: ["10", "11", "12", "13"],
          correctAnswer: "12",
        },
        {
          id: 4,
          question: "Describe your learning experience with this platform:",
          type: "paragraph",
        },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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

