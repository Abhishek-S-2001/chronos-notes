"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { X, Save, Clock, Activity } from 'lucide-react'; 
import { useKeystrokeLogger } from '../hooks/useKeystrokeLogger';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onSaveSuccess: () => void;
}

export const CreateNoteModal = ({ isOpen, onClose, username, onSaveSuccess }: CreateNoteModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // FIX 1: Destructure 'biometrics' (New Name), not 'keystrokeLog'
  const { biometrics, handleKeyDown, handleKeyUp, clearLog } = useKeystrokeLogger();

  if (!isOpen) return null;

  const handleSave = async () => {
    // 1. Basic Validation
    if (!title.trim() || !content.trim()) {
      alert("Please enter both a title and some content.");
      return;
    }

    // 2. Prepare Payload
    // This MUST match the new 'NoteCreate' Pydantic model in app/schemas.py
    const payload = {
      sessionID: uuidv4(),
      username: username,
      title: title, 
      content: content,
      platform: 'Web',
      
      // FIX 2: Send 'biometrics' field (The hook already formats it correctly)
      biometrics: biometrics 
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/notes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Encrypted Note Saved");
        onSaveSuccess(); // Trigger refresh on parent
        
        // Clear forms and close
        setTitle('');
        setContent('');
        clearLog();
        onClose();
      } else {
        const errorData = await response.json();
        console.error("❌ Save Error:", errorData);
        alert(`Save failed: ${JSON.stringify(errorData.detail)}`);
      }

    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error. Is the backend running?");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-lime-400 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Secure Session</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Typing Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <input
            type="text"
            placeholder="Title (e.g., 'Confidential Report')"
            className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="w-full h-px bg-gray-100"></div>

          <textarea
            placeholder="Type here. Your keystroke timings are being analyzed for anomaly detection..."
            className="w-full h-64 resize-none text-gray-600 placeholder:text-gray-300 outline-none leading-relaxed text-lg"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            // Attach the Privacy-First Loggers
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
        </div>

        {/* Footer with Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <Clock size={14} />
                {/* FIX 3: Use 'biometrics.length' */}
                <span>Events: {biometrics.length}</span>
            </div>
            {biometrics.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-lime-600 font-bold bg-lime-100 px-2 py-0.5 rounded-md animate-pulse">
                    <Activity size={12} />
                    <span>Recording Physics</span>
                </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Save size={16} />
              Save Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};