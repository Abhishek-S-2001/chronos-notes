"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Activity, Settings2, Lock } from 'lucide-react';

interface RiskDashboardProps {
  stats: any; // The full object from /api/stats/{user}
  username: string;
  onRefresh: () => void;
}

export const RiskDashboard = ({ stats, username, onRefresh }: RiskDashboardProps) => {
  const [sensitivity, setSensitivity] = useState(5);
  const [localRisk, setLocalRisk] = useState(0);

  // Sync state when props change
  useEffect(() => {
    if (stats) {
        setSensitivity(stats.sensitivity || 5);
        setLocalRisk(stats.risk_score || 0);
    }
  }, [stats]);

  const handleSliderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    setSensitivity(newVal);
    
    // 1. Optimistic UI Update: Recalculate Risk R(t) locally
    // Formula: Risk = Anomaly * (Sensitivity / 5)
    if (stats) {
        const multiplier = newVal / 5.0;
        const newRisk = Math.min(100, (stats.raw_anomaly || 0) * multiplier);
        setLocalRisk(Math.round(newRisk));
    }

    // 2. Debounced API Call
    try {
        await fetch(`http://127.0.0.1:8000/api/users/${username}/sensitivity`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ sensitivity: newVal })
        });
        // We don't need to force refresh immediately, visual feedback is enough
    } catch (e) { console.error(e); }
  };

  if (!stats) return null;

  // Visual Logic for Risk
  const isCritical = localRisk > 70;
  const isModerate = localRisk > 40;
  const riskColor = isCritical ? 'bg-red-500' : isModerate ? 'bg-orange-400' : 'bg-emerald-500';
  const riskLabel = isCritical ? 'CRITICAL' : isModerate ? 'MODERATE' : 'SECURE';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* 1. Risk Score Card R(t) */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
        
        <div>
            <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Shield size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">Risk Score R(t)</span>
            </div>
            <div className="text-5xl font-bold tracking-tighter mb-1">
                {localRisk}%
            </div>
            <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold ${riskColor} text-white transition-colors duration-500`}>
                STATUS: {riskLabel}
            </div>
        </div>
        
        <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Anomaly Detection</span>
                <span>{stats.raw_anomaly}% Deviation</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${riskColor} transition-all duration-500 ease-out`} 
                    style={{ width: `${localRisk}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* 2. Sensitivity Controller S(t) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Settings2 size={18} className="text-gray-400"/>
                    Sensitivity S(t)
                </h4>
                <p className="text-xs text-gray-400 mt-1">Adjusts the math multiplier</p>
            </div>
            <div className="text-2xl font-bold text-indigo-600 bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-xl">
                {sensitivity}
            </div>
        </div>

        <input 
            type="range" 
            min="1" 
            max="9" 
            step="1"
            value={sensitivity}
            onChange={handleSliderChange}
            onMouseUp={onRefresh} // Refresh full data when user releases slider
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
        />
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
            <span>Lenient (x0.2)</span>
            <span>Strict (x1.8)</span>
        </div>
      </div>

      {/* 3. Trust Score B(t) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative">
        <div className="absolute top-4 right-4 text-emerald-500 animate-pulse">
            <Activity size={20} />
        </div>
        
        <h4 className="font-bold text-gray-800 mb-1">Trust Score B(t)</h4>
        <div className="text-xs text-gray-400 mb-4">Biometric Confidence Level</div>
        
        <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-600">{stats.trust_score}</span>
            <span className="text-sm text-emerald-600 font-medium mb-1.5">/ 100</span>
        </div>
        
        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            Inverse of anomaly deviation. A high score means your current rhythm matches your history perfectly.
        </p>
      </div>

    </div>
  );
};