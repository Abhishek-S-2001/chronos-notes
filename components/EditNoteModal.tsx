"use client";
import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Activity } from 'lucide-react';
import { useKeystrokeLogger } from '../hooks/useKeystrokeLogger';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: any;
  onUpdateSuccess: () => void;
}

export const EditNoteModal = ({ isOpen, onClose, note, onUpdateSuccess }: EditNoteModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 1. Connect the Logger Hook
  // We capture *new* keystrokes during this edit session
  const { biometrics, handleKeyDown, handleKeyUp, clearLog } = useKeystrokeLogger();

  // 2. Pre-fill data
  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title);
      setContent(note.content);
      clearLog(); // Reset logger for this new session
    }
  }, [note, isOpen]);

  if (!isOpen || !note) return null;

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            content,
            // 3. Send the NEW biometrics to be appended
            biometrics: biometrics 
        }),
      });

      if (response.ok) {
        console.log(`✅ Note updated with ${biometrics.length} new events`);
        onUpdateSuccess();
        clearLog();
        onClose();
      } else {
        alert("Failed to update note");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Edit Session</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Editing Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <input
            type="text"
            className="w-full text-xl font-bold text-gray-800 outline-none placeholder:text-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
          />
          
          <div className="w-full h-px bg-gray-100"></div>

          <textarea
            className="w-full h-64 resize-none text-gray-600 outline-none text-lg leading-relaxed placeholder:text-gray-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your note here..."
            // 4. Attach Event Listeners
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
        </div>

        {/* Footer with Physics Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <Clock size={14} />
                <span>New Events: {biometrics.length}</span>
            </div>
            {biometrics.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-md animate-pulse">
                    <Activity size={12} />
                    <span>Analyzing</span>
                </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleUpdate} 
                className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black shadow-lg transition-all flex items-center gap-2"
            >
                <Save size={16} />
                Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};