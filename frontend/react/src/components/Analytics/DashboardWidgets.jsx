import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DASHBOARD_STATS, MOCK_MASTERY_DATA } from '../../Utils/mockMasteryData';

export const SnapshotCards = () => {
    const navigate = useNavigate();
    const stats = MOCK_DASHBOARD_STATS;

    const cards = [
        { label: "Overall Mastery", value: `${stats.overallMastery}%`, color: "bg-blue-50 text-blue-600 border-blue-200" },
        { label: "Subjects Enrolled", value: stats.subjectsEnrolled, color: "bg-purple-50 text-purple-600 border-purple-200" },
        { label: "Weakest Topic", value: stats.weakestTopic, color: "bg-red-50 text-red-600 border-red-200", clickable: true },
        { label: "Questions Attempted (Last 7 Days)", value: stats.questionsAttempted, color: "bg-green-50 text-green-600 border-green-200" }
    ];

    const handleClick = (label) => {
        if (label === "Weakest Topic") {
            // In a real app we'd navigate to the exact subject page. 
            // For now, let's just go to the first subject available.
            navigate('/subject');
            window.scrollTo(0, 500); // Scroll down to charts 
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {cards.map((card, i) => (
                <div 
                    key={i} 
                    onClick={() => card.clickable && handleClick(card.label)}
                    className={`card p-4 rounded-xl border-2 flex flex-col justify-between h-32 transition-all duration-200 ${card.color} ${card.clickable ? 'cursor-pointer hover:shadow-lg active:scale-95' : ''}`}
                >
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.label}</span>
                    <span className="text-2xl font-black">{card.value}</span>
                </div>
            ))}
        </div>
    );
};

export const SubjectProgressOverview = () => {
    const navigate = useNavigate();
    const data = Object.values(MOCK_MASTERY_DATA);

    return (
        <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Subject Progress Overview</h2>
            <div className="space-y-4">
                {data.map((sub, i) => (
                    <div 
                        key={i}
                        onClick={() => navigate('/subject')}
                        className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-[#730FFF]/30 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold group-hover:text-[#730FFF] transition-colors">{sub.subjectName}</h3>
                                <p className="text-xs text-gray-400 font-semibold">{sub.subjectCode}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-[#730FFF]">{sub.overallMastery}%</span>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Mastery</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-[#730FFF] to-[#A77BFF] h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${sub.overallMastery}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-3 text-[11px] font-bold text-gray-500 uppercase">
                            <span>Last Practiced: {sub.lastPracticed}</span>
                            <span className="group-hover:translate-x-1 transition-transform">Click to evaluate →</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
