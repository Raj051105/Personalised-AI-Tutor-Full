import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const MasteryRadarChart = ({ data, onUnitClick }) => {
  const radarData = data.units.map(unit => ({
    unit: unit.unitName.split(':')[0], // Extract "Unit I" part
    fullUnit: unit.unitName,
    mastery: unit.mastery,
    fullData: unit
  }));

  const handleAxisClick = (data) => {
    if (onUnitClick && data && data.value) {
      const selected = radarData.find(d => d.unit === data.value);
      if (selected) {
        onUnitClick(selected.fullData);
      }
    }
  };

  const handlePointClick = (point) => {
    if (onUnitClick && point && point.payload) {
        onUnitClick(point.payload.fullData);
    }
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="unit" 
            onClick={handleAxisClick}
            style={{ 
                cursor: 'pointer', 
                fontSize: '11px', 
                fontWeight: '900', 
                fill: '#1f2937', 
                textTransform: 'uppercase' 
            }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fontSize: 9, fill: '#9ca3af' }} 
          />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#730FFF"
            strokeWidth={3}
            fill="#730FFF"
            fillOpacity={0.6}
            onClick={handlePointClick}
            style={{ cursor: 'pointer' }}
          />
          <Tooltip 
            contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasteryRadarChart;
