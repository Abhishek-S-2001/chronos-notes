"use client";
import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';

export const ServerStatus = () => {
  const { isOnline, latency, checkStatus } = useServerStatus();

  return (
    <div className="mt-auto pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity size={16} className={isOnline ? "text-emerald-500" : "text-red-400"} />
            {isOnline && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-700">
              {isOnline ? "System Online" : "System Offline"}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {isOnline ? `Latency: ${latency}ms` : "Backend Unreachable"}
            </span>
          </div>
        </div>
        
        <button 
          onClick={checkStatus} 
          className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-400"
          title="Refresh Status"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
};