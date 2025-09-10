import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '../../Utils/data';

const data = chartData

export default function StudentPerformanceChart() {
  return (
    <div className="w-full bg-white">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                color: 'black',
                fontSize: '14px',
                fontWeight: '500'
              }}
              formatter={(value, name, props) => [
                `${value}%`, 
                'Student Performance'
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="performance" 
              stroke="#730FFF" 
              strokeWidth={2}
              fill="#730FFF" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}