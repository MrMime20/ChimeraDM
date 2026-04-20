/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent } from 'react';
import { Monster, Folder, AppData } from './types';
import { generateMonster } from './lib/generate';
import Sidebar from './components/Sidebar';
import StatBlock from './components/StatBlock';
import MonsterEditor from './components/MonsterEditor';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Share2, Skull, BookOpen, Download, Sun, Moon } from 'lucide-react';

export default function App() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeMonsterId, setActiveMonsterId] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'statblock' | 'lore'>('statblock');
  const [darkMode, setDarkMode] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('chimera_data');
    if (saved) {
      try {
        const data: AppData = JSON.parse(saved);
        setMonsters(data.monsters || []);
        setFolders(data.folders || []);
        if (data.monsters?.length > 0) setActiveMonsterId(data.monsters[0].id);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    const data: AppData = { monsters, folders };
    localStorage.setItem('chimera_data', JSON.stringify(data));
  }, [monsters, folders]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddMonster = () => {
    const newMonster = generateMonster({});
    setMonsters([newMonster, ...monsters]);
    setActiveMonsterId(newMonster.id);
    setIsEditing(true);
  };

  const handleUpdateMonster = (updated: Monster) => {
    setMonsters(monsters.map(m => m.id === updated.id ? updated : m));
    setIsEditing(false);
  };

  const handlePartialUpdate = (updated: Monster) => {
    setMonsters(monsters.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMonster = (id: string) => {
    setMonsters(monsters.filter(m => m.id !== id));
    if (activeMonsterId === id) setActiveMonsterId(monsters[0]?.id);
  };

  const handleAddFolder = (name: string) => {
    const folder: Folder = { id: Math.random().toString(36), name };
    setFolders([...folders, folder]);
  };

  const handleExport = () => {
    const data: AppData = { monsters, folders };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chimera_bestiary_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data: AppData = JSON.parse(event.target?.result as string);
        setMonsters(data.monsters || []);
        setFolders(data.folders || []);
        if (data.monsters?.length > 0) setActiveMonsterId(data.monsters[0].id);
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const activeMonster = monsters.find(m => m.id === activeMonsterId);

  return (
    <div className="flex h-screen bg-[var(--mm-bg)] text-[var(--mm-text)] font-serif overflow-hidden relative transition-colors duration-300">
      <Sidebar 
        monsters={monsters} 
        folders={folders} 
        activeMonsterId={activeMonsterId}
        onSelectMonster={id => {
          setActiveMonsterId(id);
          setIsEditing(false);
        }}
        onAddMonster={handleAddMonster}
        onAddFolder={handleAddFolder}
        onDeleteMonster={handleDeleteMonster}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative pb-12">
        <AnimatePresence mode="wait">
          {activeMonster ? (
            <motion.div 
              key={activeMonster.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 p-8 flex flex-col items-center"
            >
              {/* Toolbar */}
              <div className="w-full max-w-5xl flex justify-between items-center mb-10 bg-[var(--mm-sidebar)] backdrop-blur-md p-4 rounded-lg border border-[var(--mm-border)] shadow-md">
                 <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-md">
                    <button 
                      onClick={() => setViewMode('statblock')}
                      className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                        viewMode === 'statblock' ? 'bg-[var(--mm-accent)] text-white shadow-md' : 'text-[var(--mm-muted)] hover:text-[var(--mm-text)]'
                      }`}
                    >
                      <Skull size={14} /> Stat Block
                    </button>
                    <button 
                      onClick={() => setViewMode('lore')}
                       className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                        viewMode === 'lore' ? 'bg-[var(--mm-accent)] text-white shadow-md' : 'text-[var(--mm-muted)] hover:text-[var(--mm-text)]'
                      }`}
                    >
                      <BookOpen size={14} /> Lore & Background
                    </button>
                 </div>

                 <div className="flex gap-4 items-center">
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className="p-2 rounded-full border border-[var(--mm-border)] hover:bg-black/10 transition-all text-[var(--mm-text)] bg-[var(--mm-bg)]"
                    >
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-3 px-8 py-2 rounded-md text-sm font-black uppercase tracking-widest transition-all border ${
                        isEditing 
                          ? 'bg-[var(--mm-accent)] text-white border-[var(--mm-accent)] shadow-lg' 
                          : 'bg-[var(--mm-bg)] border-[var(--mm-border)] text-[var(--mm-text)] hover:border-[var(--mm-accent)] shadow-sm'
                      }`}
                    >
                      <Edit3 size={14} /> {isEditing ? 'Confirm Changes' : 'Edit Monster'}
                    </button>
                 </div>
              </div>

              <div className="w-full flex gap-12 justify-center items-start">
                <div className="flex-1 max-w-2xl">
                  {isEditing ? (
                    <MonsterEditor 
                      monster={activeMonster} 
                      folders={folders}
                      onUpdate={handlePartialUpdate}
                      onSave={handleUpdateMonster} 
                      onCancel={() => setIsEditing(false)}
                      onGenerate={(params) => {
                        const newM = generateMonster(params);
                        handlePartialUpdate({ ...newM, id: activeMonster.id });
                      }}
                    />
                  ) : (
                    viewMode === 'statblock' ? (
                      <div className="mm-stat-block">
                        <StatBlock monster={activeMonster} />
                      </div>
                    ) : (
                      <div className="space-y-10 max-w-2xl w-full">
                        <section className="bg-white/50 dark:bg-black/20 p-10 rounded border border-[var(--mm-border)] shadow-sm leading-relaxed">
                          <h3 className="mm-sub-header mb-6">Physical Description</h3>
                          <p className="text-xl italic opacity-95">{activeMonster.description}</p>
                        </section>
                        <section className="bg-white/50 dark:bg-black/20 p-10 rounded border border-[var(--mm-border)] shadow-sm leading-relaxed">
                           <h3 className="mm-sub-header mb-6">Lore & History</h3>
                           <p className="text-lg opacity-95 first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-[var(--mm-accent)] first-letter:font-display">{activeMonster.lore}</p>
                        </section>
                      </div>
                    )
                  )}
                </div>

                 {/* Right Panel Art */}
                 {!isEditing && (
                   <div className="hidden xl:flex flex-col gap-8 w-[450px] sticky top-8">
                      <div className="aspect-video bg-black rounded-lg border-4 border-[var(--mm-border)] shadow-2xl relative overflow-hidden group">
                         <img 
                           src={activeMonster.imageUrl} 
                           alt={activeMonster.name} 
                           className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-[5000ms] opacity-90"
                           referrerPolicy="no-referrer"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                         <div className="absolute bottom-6 left-6">
                            <span className="bg-[var(--mm-accent)] text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest shadow-2xl">Visual Archive</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <button className="bg-[var(--mm-bg)] border border-[var(--mm-border)] p-4 rounded shadow hover:bg-[var(--mm-sidebar)] transition-all font-bold text-xs uppercase tracking-widest text-[var(--mm-text)] flex items-center justify-center gap-2">
                           <Share2 size={14} /> Share
                         </button>
                         <button className="bg-[var(--mm-bg)] border border-[var(--mm-border)] p-4 rounded shadow hover:bg-[var(--mm-sidebar)] transition-all font-bold text-xs uppercase tracking-widest text-[var(--mm-text)] flex items-center justify-center gap-2" onClick={handleExport}>
                           <Download size={14} /> Export JSON
                         </button>
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 opacity-20">
               <Skull size={180} />
               <div className="space-y-2">
                 <h3 className="text-4xl font-black uppercase tracking-widest">Bestiary Empty</h3>
                 <p className="max-w-md mx-auto text-sm uppercase tracking-widest font-sans font-black">Generate your first creature to begin the architect.</p>
               </div>
               <button 
                onClick={handleAddMonster}
                className="mt-8 bg-[var(--mm-accent)] text-white px-16 py-4 rounded font-bold tracking-widest shadow-2xl hover:scale-105 active:translate-y-1 transition-all text-sm uppercase"
               >
                 Create New Monster
               </button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="absolute bottom-0 left-80 right-0 bg-[var(--mm-sidebar)] border-t border-[var(--mm-border)] px-10 py-3 flex justify-between items-center text-[10px] uppercase font-sans font-black text-black/30 z-30 tracking-widest">
        <div className="flex gap-8">
          <span>Browser Storage: Active</span>
          <span>● System Status: Optimal</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-[var(--mm-accent)] cursor-pointer">Archive v3.0</span>
        </div>
      </footer>
    </div>
  );
}
