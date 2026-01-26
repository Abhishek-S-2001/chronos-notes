"use client";
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';


interface BiometricChartProps {
  title: string;
  data: any[]; 
  isAnomaly?: boolean;
  score?: number;
}

export const KeystrokeChart = ({ title, data, isAnomaly, score }: BiometricChartProps) => {
  
  // 1. Dynamically find all "history_X" keys to plot the faint lines
  const historyKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Looks for keys like "history_0", "history_1" in the first data point
    return Object.keys(data[0]).filter(k => k.startsWith('history_'));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-sm p-6 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <Activity size={20} className="text-gray-300" />
        </div>
        <p>No biometric data recorded yet.</p>
        <p className="text-xs text-gray-300 mt-1">Create a note to generate your signature.</p>
      </div>
    );
  }

  // 2. Dynamic Styling based on Anomaly Status
  const activeColor = isAnomaly ? '#ef4444' : '#10b981'; // Red vs Green
  const statusText = isAnomaly ? 'Anomaly Detected' : 'Verified Normal';
  const StatusIcon = isAnomaly ? AlertTriangle : CheckCircle;
  const statusBg = isAnomaly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600';

  return (
    <div className={`w-full h-96 bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-colors duration-500 ${isAnomaly ? 'border-red-100' : 'border-gray-100'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
            <h4 className="text-sm font-bold text-gray-700">{title}</h4>
            <p className="text-xs text-gray-400 mt-1">Frequency Distribution (Rhythm)</p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusBg} transition-colors duration-500`}>
            <StatusIcon size={14} />
            <span className="text-xs font-bold">{statusText}</span>
            {score !== undefined && (
              <span className="text-[10px] opacity-70 border-l border-current pl-2 ml-1">
                Score: {score}
              </span>
            )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          
          <XAxis 
            dataKey="range" 
            tick={{fontSize: 10, fill: '#9ca3af'}} 
            axisLine={false} 
            tickLine={false}
            label={{ value: 'Duration (ms)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
          />
          <YAxis hide domain={[0, 'auto']} />
          
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)', fontSize: '12px' }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#374151' }}
          />

          {/* 1. Faint History Lines (The "Spaghetti" Background) */}
          {historyKeys.map((key) => (
            <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke="#9ca3af" 
                strokeWidth={1.5} 
                strokeOpacity={0.1} // Very faint to show the "cloud" of behavior
                dot={false}
                activeDot={false}
                isAnimationActive={false}
            />
          ))}

          {/* 2. Bold Average Line (Baseline) */}
          <Line 
            type="monotone" 
            dataKey="Average" 
            stroke="#3b82f6" // Blue
            strokeWidth={2.5} 
            dot={false}
            name="Avg Profile"
            strokeDasharray="4 4" // Dashed line for Average
          />

          {/* 3. The Active Session Line (Color Changes!) */}
          <Line 
            type="monotone" 
            dataKey="Recent" 
            stroke={activeColor} 
            strokeWidth={3} 
            dot={{ r: 4, fill: activeColor, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Current Session"
            animationDuration={1000}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};