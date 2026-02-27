import React, { useContext } from 'react'
import { UserContext } from '../Context/userContext'
import BaseLayout from '../components/Layouts/BaseLayout';
import { userData } from '../Utils/data';
import StudentPerformanceChart from '../components/Charts/StudentPerformanceChart';
import RecentTable from '../components/Tables/RecentTable';
import { SnapshotCards, SubjectProgressOverview } from '../components/Analytics/DashboardWidgets';
import { RecommendedPracticeWidget } from '../components/Analytics/RecommendedPracticeWidget';
import { PastQuizList } from '../components/Analytics/PastQuizList';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <BaseLayout user={user} active={'dashboard'}>
      <div className="p-10 space-y-12 bg-[#F8FAFC]">
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-4xl font-black text-[#1a1a1a] leading-tight tracking-tight uppercase">Welcome, {user.username}</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Student Mastery Analysis Engine Ready
          </p>
        </div>

        {/* NEW: Performance Snapshot Section */}
        <SnapshotCards />

        {/* Performance Overview & Recommended Practice */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-10">
            <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-xl overflow-hidden group">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tighter">Activity Analytics</h2>
                <span className="text-[10px] font-black uppercase text-gray-400 border-2 border-gray-50 px-3 py-1 rounded-full group-hover:border-[#730FFF]/20 transition-all">Last 12 Months</span>
              </div>
              <StudentPerformanceChart />
            </div>
            
            {/* NEW: Subject-wise Breakdown List */}
            <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50/50 rounded-full -mr-24 -mt-12 -z-0"></div>
              <SubjectProgressOverview />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-10 relative">
            {/* Recommended Practice with Highlight */}
            <RecommendedPracticeWidget />

            {/* Quick Stats or Additional Small Widget */}
            <div className="bg-[#1a1a1a] text-white p-10 rounded-[40px] shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-all">
                <span className="text-8xl font-black italic">!</span>
              </div>
              <h3 className="text-2xl font-black mb-1 italic leading-tight">Mastery Goal</h3>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">Target: End of Semester</p>
              
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="42" fill="none" stroke="#333" strokeWidth="8" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke="#730FFF" strokeWidth="8" strokeDasharray="264" strokeDashoffset="52.8" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xl font-black leading-none">80%</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black leading-none uppercase">Academic Standing</p>
                  <p className="text-xs font-bold text-green-400 flex items-center gap-1 uppercase tracking-tighter italic">↑ 12.5% vs Last Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Detailed Quiz History (Mocked) */}
        <div className="pt-4">
          <PastQuizList />
        </div>

        {/* Updated Recent Activity table */}
        <div className="mt-16 bg-white p-10 rounded-[40px] border-2 border-black/5 shadow-md group">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-gray-800 uppercase italic">Recent API Activity</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction logs for user feedback loops</p>
          </div>
          <RecentTable />
        </div>
      </div>
    </BaseLayout>
  )
}

export default Dashboard