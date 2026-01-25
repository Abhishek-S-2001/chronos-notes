"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { calculateRisk, WEIGHTS } from '@/utils/riskMath';
import { RefreshCw, ShieldAlert, Activity, Globe, Lock } from 'lucide-react';

// Color Palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const RiskDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Simulate "Real-time" updates
  const refreshAnalysis = () => {
    const data = calculateRisk();
    setMetrics(data);
    
    // Add to history (keep last 10 points)
    setHistory(prev => {
      const newPoint = { time: new Date().toLocaleTimeString(), risk: data.totalScore };
      const newHistory = [...prev, newPoint];
      return newHistory.slice(-10); // Keep only last 10
    });
  };

  // Initial load
  useEffect(() => {
    refreshAnalysis();
    // Optional: Auto-refresh every 5 seconds to show "Live" nature
    // const interval = setInterval(refreshAnalysis, 5000);
    // return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  // Prepare Data for Charts
  const contributionData = [
    { name: "Auth (A)", value: WEIGHTS.w_a * metrics.scores.A, fill: '#3b82f6' },     // Blue
    { name: "Context (CP)", value: WEIGHTS.w_cp * metrics.scores.CP, fill: '#10b981' }, // Green
    { name: "Behavior (B)", value: WEIGHTS.w_b * metrics.scores.B, fill: '#f59e0b' },   // Orange
    { name: "System (S)", value: WEIGHTS.w_s * metrics.scores.S, fill: '#6366f1' },     // Indigo
  ];

  const contextualData = [
    { name: "IP Risk", value: WEIGHTS.mu_ip * metrics.scores.IP },
    { name: "Geo Risk", value: WEIGHTS.mu_geo * metrics.scores.GEO },
    { name: "Trust", value: WEIGHTS.mu_bt * metrics.scores.BT },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden mb-8">
      
      {/* --- HEADER: The "Executive Summary" --- */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-gray-600" /> 
            Risk Engine Analysis
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time evaluation using Formula: <span className="font-mono bg-gray-200 px-1 rounded">R(t) = wₐA + wcpCP + wbB + wsS</span>
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
             <div className="text-xs font-bold text-gray-400 uppercase">Trust Level</div>
             <div className={`text-2xl font-black ${metrics.color}`}>
               {metrics.label} ({(metrics.totalScore * 100).toFixed(1)}%)
             </div>
          </div>
          <button 
            onClick={refreshAnalysis}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* --- BODY: The Visual Proof --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        
        {/* 1. Factor Contribution (Bar Chart) */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Lock size={14} /> Total Risk Breakdown
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionData} layout="vertical">
                <XAxis type="number" domain={[0, 0.4]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Shows weight * normalized_score for each factor
          </p>
        </div>

        {/* 2. Contextual Deep Dive (Pie Chart) */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Globe size={14} /> Contextual Risk (CP)
          </h4>
          <div className="h-48 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contextualData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contextualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-gray-400">CP(t)</span>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-[10px] text-gray-500">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> IP</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div> Geo</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div> Trust</span>
          </div>
        </div>

        {/* 3. Continuous Auth (Line Chart) */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Activity size={14} /> Risk Over Time
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 1]} tick={{fontSize: 10}} width={20} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{r: 2}}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
           <p className="text-[10px] text-gray-400 mt-2 text-center">
            Simulates continuous re-evaluation (R(t))
          </p>
        </div>

      </div>
    </div>
  );
};