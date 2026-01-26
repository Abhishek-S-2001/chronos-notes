"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Archive, Settings, HelpCircle, 
  Plus, ChevronDown, ChevronRight, Folder, 
  MoreHorizontal, FileText, ChevronLeft, Moon,
  Trash2, Edit, Calendar
} from "lucide-react";

import { CreateNoteModal } from "@/components/CreateNoteModal";
import { EditNoteModal } from "@/components/EditNoteModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { UserSelector } from "@/components/UserSelector";
import { ServerStatus } from "@/components/ServerStatus";
import { KeystrokeChart } from "@/components/KeystrokeChart";
import { RiskDashboard } from "@/components/RiskDashboard";

// --- REUSABLE COMPONENTS ---

const NoteCard = ({ note, color, onEdit, onDelete }: any) => {
  const colorMap: any = {
    purple: "bg-purple-100 border-purple-200",
    orange: "bg-orange-100 border-orange-200",
    yellow: "bg-yellow-100 border-yellow-200",
    blue: "bg-blue-100 border-blue-200",
    green: "bg-emerald-100 border-emerald-200",
    white: "bg-white border-gray-200"
  };
  const headerClass = colorMap[color] || colorMap['white'];
  const createdDate = new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const updatedDate = note.updated_at ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="group relative p-1 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col cursor-default">
      {/* Header */}
      <div className={`${headerClass} px-4 py-3 rounded-t-xl flex justify-between items-start mb-2`}>
        <div className="flex-1 pr-2">
            <h4 className="font-bold text-gray-800 text-sm truncate">{note.title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                    {createdDate}
                </span>
                {updatedDate && (
                    <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1 bg-white/50 px-1 rounded">
                        Edited: {updatedDate}
                    </span>
                )}
            </div>
        </div>
        
        {/* Action Menu (Visible on Hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="p-1.5 hover:bg-white/80 rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                title="Edit Note"
            >
                <Edit size={14} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(note); }}
                className="p-1.5 hover:bg-white/80 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                title="Delete Note"
            >
                <Trash2 size={14} />
            </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
           <p className="text-xs text-gray-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        </div>
        <div className="flex justify-end">
          <div className="p-1.5 rounded-full bg-lime-400 text-white shadow-sm">
             <FileText size={12} fill="white" /> 
          </div>
        </div>
      </div>
    </div>
  );
};

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

const RecentFolder = ({ label, code }: { label: string, code: string }) => (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
        <div className="w-16 h-12 bg-amber-400 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-amber-500 transition-colors relative">
            <div className="absolute top-0 left-0 w-6 h-2 bg-amber-500 rounded-tl-lg rounded-tr-lg -mt-1 ml-0 opacity-50"></div>
            <span className="text-white font-bold text-xs">{code}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
)


// --- MAIN LAYOUT ---

export default function Home() {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  
  // Data State
  const [biometricData, setBiometricData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // CRUD State
  const [editingNote, setEditingNote] = useState<any>(null);
  const [deletingNote, setDeletingNote] = useState<any>(null);

  // --- SMART FETCH FUNCTION ---
  // Accepts a 'scope' to determine what to refresh
  const fetchData = async (scope: 'all' | 'notes' | 'stats' = 'all') => {
    if (!currentUser) return;
    if (scope === 'all') setLoading(true); // Only show global loading for full refresh

    try {
      const promises = [];

      // 1. Fetch Biometrics (From 'biometric_history')
      if (scope === 'all' || scope === 'stats') {
        promises.push(
          fetch(`http://127.0.0.1:8000/api/stats/${currentUser}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => setBiometricData(data))
            .catch(e => console.error("Bio Fetch Error:", e))
        );
      }

      // 2. Fetch Notes (From 'user_notes')
      if (scope === 'all' || scope === 'notes') {
        promises.push(
          fetch(`http://127.0.0.1:8000/api/notes/list/${currentUser}`)
            .then(res => res.ok ? res.json() : { notes: [] })
            .then(data => setNotes(data.notes || []))
            .catch(e => console.error("Notes Fetch Error:", e))
        );
      }

      await Promise.all(promises);

    } catch (e) {
      console.error("Critical Fetch Error", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => { 
    fetchData('all'); 
  }, [currentUser]);


  // --- HANDLERS ---

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/notes/${deletingNote.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeletingNote(null);
            // OPTIMIZATION: Only fetch notes! 
            // We know deleting a note doesn't affect biometric history anymore.
            fetchData('notes'); 
        } else {
            alert("Failed to delete note");
        }
    } catch (e) { console.error(e); }
  };

  const noteColors = ['purple', 'orange', 'yellow', 'blue', 'green', 'white'];

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-900">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-[#F9FAFB] border-r border-gray-100 p-6 flex flex-col justify-between h-full">
         <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center">
                    <Moon size={16} className="text-white fill-current" />
                </div>
                <div>
                    <h1 className="font-bold text-sm tracking-wide">Syncscribe</h1>
                    <span className="text-xs text-gray-400">BIOMETRIC VAULT</span>
                </div>
            </div>

            <UserSelector currentUser={currentUser} onUserSelect={setCurrentUser} />

            <button
                onClick={() => {
                if (!currentUser) { alert("Select user first!"); return; }
                setIsModalOpen(true)}}
                className="w-full bg-gray-900 text-white flex items-center justify-between px-4 py-3 rounded-xl mb-6 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 group">
                <div className="flex items-center gap-2">
                    <div className="p-0.5 border border-white rounded-full group-active:scale-90 transition-transform"><Plus size={12} /></div>
                    <span className="text-sm font-semibold">Create Note</span>
                </div>
                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">N</span>
            </button>

            <nav className="space-y-1 mb-6">
                <SidebarItem icon={Search} label="Search" shortcut="S" />
                <SidebarItem icon={Archive} label="Archives" shortcut="R" />
            </nav>

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
         
         <div className="space-y-1">
            <SidebarItem icon={HelpCircle} label="Help" />
            <SidebarItem icon={Settings} label="Settings" />
            <ServerStatus />
         </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentUser ? "My Notes" : "Dashboard"}</h2>
                <p className="text-gray-400 mt-1 text-sm font-medium">
                    {currentUser ? `Analyzing behavior for ${currentUser}` : "Select a user to begin analysis."}
                </p>
            </div>
        </header>

        {currentUser && <div className="mb-8"><RiskDashboard /></div>}
        
        {currentUser && (
             <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Biometric Signature</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <KeystrokeChart 
                        title="Dwell Rhythm (Hold Time)" 
                        data={biometricData?.dwell_data} 
                        isAnomaly={biometricData?.is_anomaly}
                        score={biometricData?.anomaly_score}
                    />
                    <KeystrokeChart 
                        title="Flight Rhythm (Typing Speed)" 
                        data={biometricData?.flight_data} 
                        isAnomaly={biometricData?.is_anomaly}
                        score={biometricData?.anomaly_score}
                    />
                </div>
            </div>
        )}

        {/* --- Notes Grid --- */}
        {loading ? (
             <div className="h-48 flex items-center justify-center text-gray-400 animate-pulse text-sm">
                Fetching secure notes...
             </div>
        ) : notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {notes.map((note, index) => (
                <NoteCard 
                  key={note.id}
                  note={note}
                  color={noteColors[index % noteColors.length]} 
                  onEdit={(n: any) => setEditingNote(n)}
                  onDelete={(n: any) => setDeletingNote(n)}
                />
              ))}
            </div>
        ) : (
            <div className="mb-12 p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm">
                {currentUser ? "No notes found. Create one!" : "Select a user to view notes."}
            </div>
        )}

        {/* Recent Folders */}
        <div className="mb-8">
             <header className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Recent Folders</h2>
             </header>
             <div className="flex gap-8 items-center overflow-x-auto pb-4">
                <RecentFolder label="Bucket List" code="BL" />
                <RecentFolder label="Finances" code="Fi" />
                <RecentFolder label="Travel Plans" code="TP" />
                <RecentFolder label="Shopping" code="Sh" />
                <RecentFolder label="Personal" code="Pe" />
                <button className="w-12 h-12 flex-shrink-0 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <ChevronRight size={16} className="text-gray-400"/>
                </button>
            </div>
        </div>
      </main>

      {/* --- Modals --- */}
      <CreateNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        username={currentUser} 
        // Fetch ALL because creating adds to both history and notes list
        onSaveSuccess={() => setTimeout(() => fetchData('all'), 200)}
      />

      <EditNoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        note={editingNote}
        // Fetch ALL because editing appends to history
        onUpdateSuccess={() => {
            setEditingNote(null);
            setTimeout(() => fetchData('all'), 200);
        }}
      />

      <DeleteConfirmationModal 
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteConfirm} // Uses 'notes' scope internally
      />
    </div>
  );
}