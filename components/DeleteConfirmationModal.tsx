"use client";
import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Note?</h3>
        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Are you sure you want to permanently delete this note?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
};