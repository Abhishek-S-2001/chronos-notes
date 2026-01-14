"use client"; // Required for interactivity later

import React, { useState } from "react";
import { 
  Search, Archive, Settings, HelpCircle, 
  Plus, ChevronDown, ChevronRight, Folder, 
  MoreHorizontal, FileText, ChevronLeft, Moon
} from "lucide-react";

import { CreateNoteModal } from "@/components/CreateNoteModal";

// --- Components for Reusability ---

const SidebarItem = ({ icon: Icon, label, shortcut, active = false }: any) => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {shortcut && <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">{shortcut}</span>}
  </div>
);

const FolderItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-black cursor-pointer">
    <Folder size={16} />
    <span className="text-sm">{label}</span>
  </div>
);

const NoteCard = ({ color, title, time, content, type }: any) => {
  // Map simple color names to Tailwind classes
  const colorMap: any = {
    purple: "bg-purple-100 border-purple-200",
    orange: "bg-orange-100 border-orange-200",
    yellow: "bg-yellow-100 border-yellow-200",
    white: "bg-white border-gray-200"
  };

  return (
    <div className={`p-1 rounded-2xl border ${type === 'white' ? 'bg-white' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
      {/* Header Section of the Card */}
      <div className={`${colorMap[color]} px-4 py-3 rounded-t-xl flex justify-between items-center mb-2`}>
        <span className="font-bold text-gray-800 text-sm">{title}</span>
        <span className="text-xs text-gray-500 font-medium">{time}</span>
      </div>
      
      {/* Content Section */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
           {content.map((line: string, i: number) => (
             <p key={i} className="text-xs text-gray-600 line-clamp-2">{line}</p>
           ))}
        </div>
        
        {/* Footer Action */}
        <div className="mt-4 flex justify-end">
          <div className="p-1.5 rounded-full bg-lime-400 text-white shadow-sm cursor-pointer hover:bg-lime-500">
             <FileText size={12} fill="white" /> 
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentFolder = ({ label, code }: { label: string, code: string }) => (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
        <div className="w-16 h-12 bg-amber-400 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-amber-500 transition-colors relative">
            <div className="absolute top-0 left-0 w-6 h-2 bg-amber-500 rounded-tl-lg rounded-tr-lg -mt-1 ml-0 opacity-50"></div>
            <span className="text-white font-bold text-xs">{code}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
)

// --- Main Layout ---

export default function Home() {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-900">
      
      {/* --- Sidebar (Left Panel) --- */}
      <aside className="w-64 flex-shrink-0 bg-[#F9FAFB] border-r border-gray-100 p-6 flex flex-col justify-between h-full">
        <div>
          {/* Logo / Profile */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center">
                <Moon size={16} className="text-white fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">Syncscribe</h1>
              <span className="text-xs text-gray-400">Meet Desai</span>
            </div>
            <ChevronDown size={14} className="ml-auto text-gray-400" />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gray-900 text-white flex items-center justify-between px-4 py-3 rounded-xl mb-6 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-0.5 border border-white rounded-full"><Plus size={12} /></div>
              <span className="text-sm font-semibold">Create Note</span>
            </div>
            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">N</span>
          </button>

          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            <SidebarItem icon={Search} label="Search" shortcut="S" />
            <SidebarItem icon={Archive} label="Archives" shortcut="R" />
          </nav>

          {/* Folders Section */}
          <div>
            <div 
              className="flex items-center justify-between px-4 py-2 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setFoldersOpen(!foldersOpen)}
            >
              <span className="text-xs font-bold uppercase tracking-wider">Folders</span>
              {foldersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            
            {foldersOpen && (
              <div className="mt-2 space-y-1 pl-2">
                {['Bucket List', 'Finances', 'Travel Plans', 'Shopping', 'Personal', 'Work', 'Projects'].map((f) => (
                  <FolderItem key={f} label={f} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-1">
          <SidebarItem icon={HelpCircle} label="Help" />
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>


      {/* --- Main Content (Right Panel) --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
          
          {/* Time Filters */}
          <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100 flex text-xs font-medium text-gray-500">
            <button className="px-4 py-1.5 bg-gray-100 text-black rounded-full shadow-sm">Today</button>
            <button className="px-4 py-1.5 hover:bg-gray-50 rounded-full">This Week</button>
            <button className="px-4 py-1.5 hover:bg-gray-50 rounded-full">This Month</button>
          </div>
        </header>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <NoteCard 
            color="purple" 
            title="Reminders" 
            time="8:00 PM"
            content={["Dentist appointment on Tuesday", "Submit report by end of the day", "Send email to boss"]}
          />
          <NoteCard 
            color="orange" 
            title="Reminders" 
            time="8:00 PM"
            content={["Dentist appointment on Tuesday", "Submit report by end of the day", "Send email to boss"]}
          />
           <NoteCard 
            color="yellow" 
            title="Random Thoughts" 
            time="9:45 PM"
            content={['"Success is a journey, not a des..."', '"Try a new recipe this weekend!"', '"Don\'t forget to water the plants."']}
          />
           <NoteCard 
            color="white" 
            title="Books to Read" 
            time=""
            content={['The Power of Habit by...', 'Atomic Habits by Jam...', 'The Alchemist by Pa...']}
            type="white"
          />
        </div>

        {/* Recent Folders Section */}
        <div className="mb-8">
             <header className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Recent Folders</h2>
                <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100 flex text-xs font-medium text-gray-500">
                    <button className="px-4 py-1.5 bg-gray-100 text-black rounded-full shadow-sm">All</button>
                    <button className="px-4 py-1.5 hover:bg-gray-50 rounded-full">Recent</button>
                    <button className="px-4 py-1.5 hover:bg-gray-50 rounded-full">Last modified</button>
                </div>
            </header>
            
            <div className="flex gap-8 items-center">
                <RecentFolder label="Bucket List" code="BL" />
                <RecentFolder label="Finances" code="Fi" />
                <RecentFolder label="Travel Plans" code="TP" />
                <RecentFolder label="Shopping" code="Sh" />
                <RecentFolder label="Personal" code="Pe" />
                <button className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50">
                    <ChevronRight size={16} className="text-gray-400"/>
                </button>
            </div>
        </div>
      </main>
      <CreateNoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}