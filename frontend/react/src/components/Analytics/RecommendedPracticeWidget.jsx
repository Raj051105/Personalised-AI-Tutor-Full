import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RecommendedPracticeWidget = ({ subjectData }) => {
  const navigate = useNavigate();
  
  // Choose the weakest topic from subject data if available, or just mock
  const recommendation = subjectData 
    ? {
        subject: subjectData.subjectName,
        topic: subjectData.units.flatMap(u => u.topics).sort((a,b) => a.mastery - b.mastery)[0].topicName,
        difficulty: "Medium",
        message: "Your Bayesian networks mastery is at 45%. A quick 10-minute session will boost your score!"
      }
    : {
        subject: "Artificial Intelligence and Machine Learning",
        topic: "Bayesian networks",
        difficulty: "Medium",
        message: "Focus on your weakest areas to maximize study efficiency."
      };

  return (
    <div className="mt-12 bg-gradient-to-br from-[#730FFF] to-[#A77BFF] p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl group-hover:-translate-x-10 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-white max-w-xl">
          <div className="flex items-center gap-2 mb-3">
             <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">Hot Topic</span>
             <h3 className="text-xl font-black uppercase tracking-tight">Recommended Practice</h3>
          </div>
          <h2 className="text-3xl font-black mb-2 leading-tight">Master {recommendation.topic}</h2>
          <p className="text-sm font-bold opacity-90 leading-relaxed drop-shadow-sm mb-4">
            {recommendation.message}
          </p>
          <div className="flex gap-4">
               <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 flex flex-col items-center min-w-[80px]">
                   <span className="text-[10px] font-bold uppercase opacity-80">Subject</span>
                   <span className="text-xs font-black truncate max-w-[120px]">{recommendation.subject}</span>
               </div>
               <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 flex flex-col items-center">
                   <span className="text-[10px] font-bold uppercase opacity-80">Difficulty</span>
                   <span className="text-xs font-black">{recommendation.difficulty}</span>
               </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/practice')}
          className="bg-white text-[#730FFF] px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Start Adaptive Practice
        </button>
      </div>
    </div>
  );
};
