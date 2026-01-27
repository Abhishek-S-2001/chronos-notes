"use client";
import React, { useState, useEffect } from 'react';
import { User, Check } from 'lucide-react';

interface UserSelectorProps {
  currentUser: string;
  onUserSelect: (user: string) => void;
}

export const UserSelector = ({ currentUser, onUserSelect }: UserSelectorProps) => {
  const [users, setUsers] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState("");

  // 1. Only fetch the LIST of users here
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

const handleAddUser = async () => {
    if (newUser.trim()) {
      try {
          // CALL THE NEW ONBOARD ENDPOINT
          await fetch('http://127.0.0.1:8000/api/users/onboard', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ username: newUser.trim() })
          });
          
          // Select and Refresh
          onUserSelect(newUser.trim());
          setUsers(prev => [...prev, newUser.trim()]);
          setNewUser("");
          setIsAdding(false);
          
      } catch (e) {
          console.error("Onboard failed", e);
      }
    }
  };

  return (
    <div className="mb-6 px-4">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
        Active User
      </label>
      
      {!isAdding ? (
        <div className="relative">
          <select 
            value={currentUser}
            onChange={(e) => {
              if (e.target.value === "__NEW__") {
                setIsAdding(true);
              } else {
                onUserSelect(e.target.value);
              }
            }}
            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
          >
            <option value="" disabled>Select User...</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
            <option value="__NEW__">+ Add New User</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <User size={16} />
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input 
            autoFocus
            type="text"
            placeholder="Enter Name"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
          />
          <button 
            onClick={handleAddUser}
            className="bg-gray-900 text-white p-2 rounded-xl hover:bg-black"
          >
            <Check size={16} />
          </button>
        </div>
      )}
    </div>
  );
};