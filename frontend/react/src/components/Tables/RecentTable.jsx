import React from 'react'
import { RecentTableData } from '../../Utils/data';

const RecentTable = () => {
  return (
    <div className='w-full mx-auto rounded-[7px] border border-[#E5E5EF] overflow-hidden'>
      <table className='w-full border-separate border-spacing-0'>
        <thead className='border-b border-[#E5E5EF] bg-gray-50'>
          <tr className='h-10'>
            <th className='py-4 text-center font-semibold'>S.no</th>
            <th className='py-4 text-center font-semibold'>Subject</th>
            <th className='py-4 text-center font-semibold'>Score</th>
            <th className='py-4 text-center font-semibold'>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {RecentTableData.map((item, index) => (
            <tr key={item.id} className= "border-b border-[#E5E5EF] hover:bg-gray-50 transition-colors">
              <td className='py-4 text-center'>0{item.id}.</td>
              <td className='py-4 text-center'>{item.subject}</td>
              <td className='py-4 text-center'>{item.score} / 100</td>
              <td className='py-4 text-center'>{item.percentage || item.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecentTable