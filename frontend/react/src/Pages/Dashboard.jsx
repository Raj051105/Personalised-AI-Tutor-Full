import React, { useContext } from 'react'
import { UserContext } from '../Context/userContext'
import BaseLayout from '../components/Layouts/BaseLayout';
import { userData } from '../Utils/data';
import StudentPerformanceChart from '../components/Charts/StudentPerformanceChart';
import RecentTable from '../components/Tables/RecentTable';
const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <BaseLayout user={user} active={'dashboard'}>
      <div className="mt-5 mx-auto w-[90%]">
        <h1 className='font-bold text-3xl'>Welcome, {user.username}</h1>
        <p className='font-semibold text-lg'>You're curiosity and passion Leads to <span className='text-[#730FFF]'>Success</span></p>

        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
          <div className='bg-white p-5 rounded-lg shadow-md border border-[#730FFF]'>
            <h3 className='font-semibold text-lg'>Total Subjects:</h3>
            <h1 className='font-bold text-2xl w-full text-center'>
              {userData.TotalSubjects} Subjects
            </h1>
          </div>
          <div className='bg-white p-5 rounded-lg shadow-md border border-[#730FFF]'>
            <h3 className='font-semibold text-lg'>Total Streaks:</h3>
            <h1 className='font-bold text-2xl w-full text-center'>
              {userData.TotalStreaks} days
            </h1>
          </div>
          <div className='bg-white p-5 rounded-lg shadow-md border border-[#730FFF]'>
            <h3 className='font-semibold text-lg'>Avg. Quiz Performance:</h3>
            <h1 className='font-bold text-2xl w-full text-center'>
              {userData.Performance} %
            </h1>
          </div>
        </div>

        <div className='mt-5'>
          <div className='bg-white p-5 rounded-[8px] w-full '>
            <p className='font-semibold text-lg'>Performance Chart</p>
            <StudentPerformanceChart />
          </div>
        </div>

        <div className='mt-5 bg-white p-5 rounded-[8px]'>
          <p className='font-semibold text-lg'>Recent Activity</p>
          <div className='mt-3'>
            <RecentTable />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default Dashboard