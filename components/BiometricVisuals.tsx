"use client";
import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- 1. Fingerprint Radar Component ---
export const FingerprintRadar = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-300 text-xs">No Data</div>;

  return (
    <div className="w-full h-80 bg-white p-4 rounded-2xl border border-gray-100 relative">
      <h4 className="absolute top-6 left-6 text-sm font-bold text-gray-700 z-10">Finger Agility Map</h4>
      <div className="absolute top-10 left-6 text-[10px] text-gray-400 z-10">Neuro-motor reflex speed</div>
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="55%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="finger" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Agility"
            dataKey="agility"
            stroke="#8b5cf6" // Violet
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}/100`, 'Agility Score']}
            contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- 2. Rhythm Cloud Component ---
export const RhythmScatter = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-300 text-xs">No Data</div>;

  return (
    <div className="w-full h-80 bg-white p-4 rounded-2xl border border-gray-100 relative">
      <h4 className="absolute top-6 left-6 text-sm font-bold text-gray-700 z-10">Rhythm Cloud</h4>
      <div className="absolute top-10 left-6 text-[10px] text-gray-400 z-10">Keystroke consistency cluster</div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Flight Time" 
            unit="ms" 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Dwell Time" 
            unit="ms" 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-100 text-xs">
                      <p className="font-bold mb-1">{d.finger || "History"}</p>
                      <p>Dwell: {d.y}ms</p>
                      <p>Flight: {d.x}ms</p>
                    </div>
                  );
                }
                return null;
            }}
          />
          
          {/* Scatter Points */}
          <Scatter name="Rhythm" data={data}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'current' ? '#10b981' : '#e5e7eb'} 
                r={entry.type === 'current' ? 4 : 2} // Current session dots are bigger
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};