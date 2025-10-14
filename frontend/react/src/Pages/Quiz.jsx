import React, { useState, useEffect } from 'react';

const Quiz = () => {
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuestions([
        {
          id: 1,
          question: 'What is the capital of France?',
          type: 'radio',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correctAnswer: 'Paris',
        },
        {
          id: 2,
          question: 'Select the prime numbers:',
          type: 'checkbox',
          options: ['2', '3', '4', '6'],
          correctAnswer: ['2', '3'],
        },
        {
          id: 3,
          question: 'What is 5 + 7?',
          type: 'radio',
          options: ['10', '11', '12', '13'],
          correctAnswer: '12',
        },
        {
          id: 4,
          question: 'Describe your learning experience with this platform:',
          type: 'paragraph',
        },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (submitted) {
      setSubmitted(false);
      setFeedback('');
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalGradable = 0;
    questions.forEach(q => {
      if (q.correctAnswer) {
        totalGradable++;
        if (q.type === 'radio' && answers[q.id] === q.correctAnswer) {
          correctCount++;
        } else if (q.type === 'checkbox') {
          const userAnswers = answers[q.id] || [];
          const correctAnswers = q.correctAnswer;
          const isCorrect =
            userAnswers.length === correctAnswers.length &&
            correctAnswers.every(item => userAnswers.includes(item));
          if (isCorrect) correctCount++;
        }
      }
    });
    return {
      score: correctCount,
      total: totalGradable,
      percentage: Math.round((correctCount / totalGradable) * 100)
    };
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions
      .filter(q => q.type !== 'paragraph')
      .filter(q => !answers[q.id])
      .map(q => q.id);

    if (unansweredQuestions.length > 0) {
      setFeedback(`Please answer question${unansweredQuestions.length > 1 ? 's' : ''} ${unansweredQuestions.join(', ')} before submitting.`);
      return;
    }

    const result = calculateScore();
    setScore(result);
    setSubmitted(true);

    if (result.percentage >= 80) {
      setFeedback("Great job! You've mastered this content!");
    } else if (result.percentage >= 60) {
      setFeedback("Good work! Keep practicing to improve your score.");
    } else {
      setFeedback("You might need to review this material. Don't give up!");
    }
  };

  return (
    <div className="min-h-screen w-full mt-5 mx-auto md:w-[90%]">
      <div className="bg-white shadow-md rounded-lg border border-[#730FFF] overflow-hidden">
        {/* Header */}
        <div className="bg-[#730FFF] p-6">
          <h1 className="text-2xl font-bold text-white text-center">Adaptive Learning Quiz</h1>
          <p className="text-center text-white font-semibold mt-1">Test your curiosity & passion</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#730FFF] mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading quiz questions...</p>
          </div>
        ) : (
          <div className="p-6">
            {feedback && !submitted && (
              <div className="mb-6 p-4 rounded-lg bg-yellow-100 text-yellow-800 font-semibold">
                {feedback}
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-5 rounded-lg border border-[#730FFF] bg-white shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-[#730FFF] text-white font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{q.question}</h3>
                  </div>

                  {q.type === 'radio' && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((option, index) => (
                        <label key={index} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            className="mr-2 accent-[#730FFF]"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="ml-10 space-y-2">
                      {q.options.map((option, index) => (
                        <label key={index} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value={option}
                            checked={answers[q.id] && answers[q.id].includes(option)}
                            onChange={(e) => {
                              const currentAnswers = answers[q.id] || [];
                              if (e.target.checked) {
                                handleChange(q.id, [...currentAnswers, option]);
                              } else {
                                handleChange(q.id, currentAnswers.filter((ans) => ans !== option));
                              }
                            }}
                            className="mr-2 accent-[#730FFF]"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'paragraph' && (
                    <div className="ml-10">
                      <textarea
                        className="w-full border border-[#730FFF] rounded-lg p-3 focus:ring-[#730FFF] focus:border-[#730FFF]"
                        rows="4"
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      ></textarea>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Results */}
            {submitted && score && (
              <div className={`mt-8 mb-6 p-4 rounded-lg font-semibold ${
                score.percentage >= 80 ? 'bg-green-100 text-green-800' : 
                score.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                <h3 className="font-bold text-lg mb-2">Quiz Results</h3>
                <p className="mb-2">{feedback}</p>
                <p className="font-semibold">Score: {score.score}/{score.total} ({score.percentage}%)</p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex justify-center">
              {submitted ? (
                <button
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                    setFeedback('');
                    setScore(null);
                  }}
                >
                  Try Again
                </button>
              ) : (
                <button
                  className="bg-[#730FFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800"
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
  );
};

export default Quiz;
