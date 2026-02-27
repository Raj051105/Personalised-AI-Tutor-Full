import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const TopicBarChart = ({ unit }) => {
  if (!unit || !unit.topics) return <div className="p-4 text-center">Select a unit on the radar chart to see details.</div>;

  const data = unit.topics.map(topic => ({
    name: topic.topicName,
    mastery: topic.mastery,
    difficulty: topic.difficulty,
  }));

  const getBarColor = (mastery) => {
    if (mastery < 50) return "#ef4444"; // Red
    if (mastery < 80) return "#facc15"; // Yellow
    return "#22c55e"; // Green
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            angle={-15} 
            textAnchor="end" 
            interval={0} 
            height={60} 
            fontSize={10}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontWeight: 'bold' }}
          />
          <YAxis 
            domain={[0, 100]} 
            fontSize={10}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            formatter={(value) => [`${value}%`, 'Mastery']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="mastery" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.mastery)} />
            ))}
            <LabelList dataKey="mastery" position="top" formatter={(v) => `${v}%`} fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicBarChart;
