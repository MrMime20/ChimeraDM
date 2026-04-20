import { useState, ChangeEvent } from 'react';
import { Monster, Folder } from '../types';
import { Search, FolderPlus, Plus, Folder as FolderIcon, Trash2, Download, Upload, Skull, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  monsters: Monster[];
  folders: Folder[];
  activeMonsterId?: string;
  onSelectMonster: (id: string) => void;
  onAddMonster: () => void;
  onAddFolder: (name: string) => void;
  onDeleteMonster: (id: string) => void;
  onExport: () => void;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Sidebar({ 
  monsters, 
  folders, 
  activeMonsterId, 
  onSelectMonster, 
  onAddMonster, 
  onAddFolder,
  onDeleteMonster,
  onExport,
  onImport
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');

  const filteredItems = monsters.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                         m.type.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolderId === 'all' || m.folderId === selectedFolderId;
    return matchesSearch && matchesFolder;
  });

  return (
    <aside className="w-80 bg-[var(--mm-sidebar)] border-r border-[var(--mm-border)] flex flex-col h-full z-40 transition-colors duration-300">
      <div className="p-8 border-b border-[var(--mm-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[var(--mm-accent)] text-white rounded shadow-lg">
            <Sword size={24} />
          </div>
          <div>
             <h1 className="text-xl font-display font-black leading-none tracking-tight text-[var(--mm-header)]">Chimera.DM</h1>
             <p className="text-[10px] uppercase font-sans font-black opacity-40 tracking-widest">Monster Architect</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-muted)]" size={14} />
          <input 
            type="text" 
            placeholder="Search monsters..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--mm-bg)] border border-[var(--mm-border)] rounded py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[var(--mm-accent)] outline-none transition-all shadow-sm text-[var(--mm-text)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Navigation / Folders */}
        <div>
          <div className="flex justify-between items-center px-2 mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--mm-muted)]">Vaults</h3>
            <button onClick={() => setShowNewFolder(true)} className="p-1 hover:text-[var(--mm-accent)] text-[var(--mm-muted)]">
              <FolderPlus size={14} />
            </button>
          </div>
          
          <AnimatePresence>
            {showNewFolder && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-2 mb-2"
              >
                <input 
                  autoFocus
                  className="w-full bg-[var(--mm-bg)] border border-[var(--mm-border)] rounded p-2 text-xs outline-none text-[var(--mm-text)]"
                  placeholder="Enter name..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newFolderName) {
                      onAddFolder(newFolderName);
                      setNewFolderName('');
                      setShowNewFolder(false);
                    }
                  }}
                  onBlur={() => !newFolderName && setShowNewFolder(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <div 
              onClick={() => setSelectedFolderId('all')}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${selectedFolderId === 'all' ? 'bg-[var(--mm-accent)] text-white' : 'hover:bg-white/20'}`}
            >
              <Skull size={14} className={selectedFolderId === 'all' ? 'text-white' : 'text-[var(--mm-muted)]'} />
              <span className="flex-1 text-sm">All Creatures</span>
              <span className="text-[10px] opacity-60">{monsters.length}</span>
            </div>
            {folders.map(f => (
              <div 
                key={f.id} 
                onClick={() => setSelectedFolderId(f.id)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded cursor-pointer transition-colors group ${selectedFolderId === f.id ? 'bg-[var(--mm-accent)] text-white shadow-md' : 'hover:bg-white/20'}`}
              >
                <FolderIcon size={14} className={selectedFolderId === f.id ? 'text-white' : 'text-[var(--mm-muted)] group-hover:text-[var(--mm-accent)]'} />
                <span className="flex-1 text-sm">{f.name}</span>
                <span className="text-[10px] opacity-60">
                  {monsters.filter(m => m.folderId === f.id).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monster List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--mm-muted)] px-2">Entries</h3>
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center border-2 border-dashed border-[var(--mm-border)] rounded-lg opacity-40">
                <p className="text-[10px] font-bold uppercase">No entries found</p>
              </div>
            ) : (
              filteredItems.map(monster => (
                <div 
                  key={monster.id}
                  onClick={() => onSelectMonster(monster.id)}
                  className={`group flex items-center justify-between p-3 rounded border transition-all cursor-pointer ${
                    activeMonsterId === monster.id 
                      ? 'bg-[var(--mm-bg)] border-[var(--mm-accent)] shadow-md translate-x-1' 
                      : 'bg-transparent border-transparent hover:bg-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeMonsterId === monster.id ? 'bg-[var(--mm-accent)] scale-125' : 'bg-[var(--mm-muted)] opacity-30'}`} />
                    <div className="truncate">
                      <div className={`text-xs font-black uppercase tracking-tight truncate ${activeMonsterId === monster.id ? 'text-[var(--mm-header)]' : ''}`}>{monster.name}</div>
                      <div className="text-[9px] opacity-50 font-bold">CR {monster.cr} • {monster.type}</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMonster(monster.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--mm-muted)] hover:text-red-500 transition-all font-sans"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--mm-border)] bg-black/5 dark:bg-white/5">
        <div className="grid grid-cols-2 gap-3 mb-4">
           <button 
            onClick={onExport}
            className="flex items-center justify-center gap-2 py-2 bg-[var(--mm-bg)] border border-[var(--mm-border)] rounded text-[10px] font-bold uppercase tracking-widest hover:border-[var(--mm-accent)] transition-all text-[var(--mm-text)]"
           >
             <Download size={12} /> Export
           </button>
           <label className="flex items-center justify-center gap-2 py-2 bg-[var(--mm-bg)] border border-[var(--mm-border)] rounded text-[10px] font-bold uppercase tracking-widest hover:border-[var(--mm-accent)] transition-all cursor-pointer text-[var(--mm-text)]">
             <Upload size={12} /> Import
             <input type="file" className="hidden" onChange={onImport} accept=".json" />
           </label>
        </div>
        <button 
          onClick={onAddMonster}
          className="w-full bg-[var(--mm-accent)] text-white py-3 rounded flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={16} strokeWidth={3} /> New Monster
        </button>
      </div>
    </aside>
  );
}
