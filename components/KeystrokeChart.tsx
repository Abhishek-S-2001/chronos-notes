"use client";
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface BiometricChartProps {
  title: string;
  data: {
    recent: Record<string, number>;
    average: Record<string, number>;
    historical: Record<string, number>[];
  } | null;
  color: string;
}

export const KeystrokeChart = ({ title, data, color }: BiometricChartProps) => {
  
  // Transform data for Recharts (Memoized for performance)
  const chartData = useMemo(() => {
    if (!data) return [];

    const allKeysSet = new Set<string>([
      ...Object.keys(data.average),
      ...Object.keys(data.recent),
      ...data.historical.flatMap((s) => Object.keys(s))
    ]);
    
    const sortedKeys = Array.from(allKeysSet)
      .filter(k => k.length === 1 && /[a-z]/.test(k))
      .sort();

    const generatedSessionKeys: string[] = [];

    const transformed = sortedKeys.map(keyLetter => {
      const point: any = { key: keyLetter };
      point['avg'] = data.average[keyLetter] || null;
      point['recent'] = data.recent[keyLetter] || null;

      data.historical.forEach((session, index) => {
          const sKey = `session_${index}`;
          point[sKey] = session[keyLetter] || null;
          if (keyLetter === sortedKeys[0]) generatedSessionKeys.push(sKey);
      });
      return point;
    });

    return { transformed, generatedSessionKeys };
  }, [data]);

  if (!data || chartData.transformed.length === 0) {
    return (
      <div className="w-full h-80 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Waiting for data...
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
        {title}
      </h4>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData.transformed} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="key" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
          <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
          />
          
          {/* Faint History Lines */}
          {chartData.generatedSessionKeys.map(sKey => (
              <Line 
                key={sKey}
                type="monotone" 
                dataKey={sKey} 
                stroke={color === 'blue' ? '#3b82f6' : '#10b981'} 
                strokeWidth={1}
                strokeOpacity={0.1} 
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
          ))}

          {/* Average Profile */}
          <Line 
            type="monotone" 
            dataKey="avg" 
            stroke={color === 'blue' ? '#3b82f6' : '#10b981'} 
            strokeWidth={2.5}
            dot={{ r: 0 }}
            name="Avg Baseline"
          />

          {/* Recent Session (Always Red) */}
          <Line 
            type="monotone" 
            dataKey="recent" 
            stroke="#ef4444" 
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ef4444", strokeWidth: 1, stroke: "#fff" }}
            name="Current Session"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};