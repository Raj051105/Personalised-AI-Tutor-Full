import React, { useState } from 'react';
import { MOCK_PAST_QUIZZES } from '../../Utils/mockMasteryData';
import Modal from '../Modal/modal'; // Reuse existing modal component

export const PastQuizList = () => {
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const quizzes = MOCK_PAST_QUIZZES;

    const handleQuizClick = (quiz) => {
        setSelectedQuiz(quiz);
    }

    return (
        <div className="mt-12 bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-xl overflow-hidden">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#730FFF]/10 text-[#730FFF] flex items-center justify-center text-sm font-black">📅</span>
                Past Quiz History (Mocked)
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-50 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                            <th className="py-4 px-2">Date</th>
                            <th className="py-4 px-2">Topic</th>
                            <th className="py-4 px-2">Score</th>
                            <th className="py-4 px-2">Difficulty</th>
                            <th className="py-4 px-2">Time Spent</th>
                            <th className="py-4 px-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {quizzes.map((quiz) => (
                            <tr key={quiz.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-2 text-sm font-bold text-gray-600">{quiz.date}</td>
                                <td className="py-4 px-2 text-sm font-black text-gray-800">{quiz.topic}</td>
                                <td className="py-4 px-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                        quiz.score >= 70 ? 'bg-green-100 text-green-700' : 
                                        quiz.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {quiz.score}%
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-xs font-bold uppercase text-gray-400">{quiz.difficulty}</td>
                                <td className="py-4 px-2 text-sm font-bold text-gray-400">{quiz.timeSpent}</td>
                                <td className="py-4 px-2 text-right">
                                    <button 
                                        onClick={() => handleQuizClick(quiz)}
                                        className="text-[#730FFF] text-xs font-black hover:underline group-hover:translate-x-1 transition-transform inline-block"
                                    >
                                        RE-EVALUATE →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedQuiz && (
                <Modal isOpen={!!selectedQuiz} onClose={() => setSelectedQuiz(null)}>
                    <div className="p-6">
                        <h2 className="text-2xl font-black mb-1 leading-tight">{selectedQuiz.topic} Review</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-6 tracking-widest">Mastery Evaluation System</p>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedQuiz.answers.map((ans, i) => (
                                <div key={i} className={`p-5 rounded-2xl border-2 transition-all ${ans.isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-sm font-black leading-snug max-w-[80%] text-gray-800 italic">"{ans.question}"</h4>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 ${ans.isCorrect ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                                            {ans.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Your Answer</span>
                                            <p className={`text-xs font-bold leading-relaxed ${ans.isCorrect ? 'text-green-800' : 'text-red-800'}`}>{ans.userAnswer}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Correct Answer</span>
                                            <p className="text-xs font-bold leading-relaxed text-blue-800">{ans.correctAnswer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedQuiz(null)}
                                className="bg-[#1a1a1a] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase hover:shadow-xl active:scale-95 transition-all outline-none"
                            >
                                CLOSE REVIEW
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
