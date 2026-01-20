"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { X, Save, Clock } from 'lucide-react'; // Ensure lucide-react is installed
import { useKeystrokeLogger } from '../hooks/useKeystrokeLogger';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const CreateNoteModal = ({ isOpen, onClose, username }: CreateNoteModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Connect our custom logger hook
  const { keystrokeLog, handleKeyDown, handleKeyUp, clearLog } = useKeystrokeLogger();

  if (!isOpen) return null;

  const handleSave = async () => {
    // This is where we will eventually send data to the backend
    const payload = {
      sessionID: uuidv4(), // Generates a unique ID for this session
      username: username,
      noteTitle: title,
      keystrokeLog: keystrokeLog
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/save-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Data saved to dataset.json");
      } else {
        console.error("❌ Failed to save data");
      }

    } catch (error) {
      console.error("Error submitting data:", error);
    }

    console.log("📝 Note Content:", { title, content });
    console.log("🧠 Biometric Data Captured:", keystrokeLog);
    
    // Clear forms and close
    setTitle('');
    setContent('');
    clearLog();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-lime-400 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">New Session</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Typing Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <input
            type="text"
            placeholder="Title (e.g., 'Morning Reflection')"
            className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="w-full h-px bg-gray-100"></div>

          <textarea
            placeholder="Start typing freely here. The system is learning your pattern..."
            className="w-full h-64 resize-none text-gray-600 placeholder:text-gray-300 outline-none leading-relaxed text-lg"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            // Attach the event listeners here
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
        </div>

        {/* Footer with Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <Clock size={14} />
            <span>Keystrokes: {keystrokeLog.length}</span>
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
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
