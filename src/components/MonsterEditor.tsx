import { useState, ChangeEvent, useEffect } from 'react';
import { Monster, Size, CreatureType, Alignment, AbilityScore, Folder } from '../types';
import { CREATURE_TYPES, SIZES, ALIGNMENTS } from '../constants';
import { Save, RefreshCw, X, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateMonster } from '../lib/generate';

interface MonsterEditorProps {
  monster: Monster;
  onUpdate?: (monster: Monster) => void;
  onSave: (monster: Monster) => void;
  onCancel: () => void;
  onGenerate: (params: { cr: number; type: CreatureType; size: Size; alignment: Alignment }) => void;
}

export default function MonsterEditor({ monster: initialMonster, onUpdate, onSave, onCancel, onGenerate, folders }: MonsterEditorProps & { folders: Folder[] }) {
  const [monster, setMonster] = useState<Monster>(initialMonster);
  const [showGenParams, setShowGenParams] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [forgeStatus, setForgeStatus] = useState('');

  const [genParams, setGenParams] = useState({
    cr: initialMonster.cr,
    type: initialMonster.type,
    size: initialMonster.size,
    alignment: initialMonster.alignment
  });

  // Keep editor in sync if external changes occur (like regeneration)
  useEffect(() => {
    setMonster(initialMonster);
  }, [initialMonster.id]); // Only sync when switching monsters, or let onUpdate handle it

  const forgeArt = async () => {
    if (!monster.description.trim()) return alert("Please enter a description first.");

    setIsForging(true);
    setForgeStatus("Attempting Pollinations Engine...");
    
    let isFinished = false;

    const finish = (imageUrl: string) => {
      if (isFinished) return;
      isFinished = true;
      const newMonster = { ...monster, imageUrl };
      setMonster(newMonster);
      onUpdate?.(newMonster);
      setIsForging(false);
      setForgeStatus('');
    };

    // POLLINATIONS: Try this first
    const tryPollinations = async () => {
      try {
        const seed = Math.floor(Math.random() * 999999);
        const prompt = `D&D style monster illustration, ${monster.name}, ${monster.description}, cinematic digital art, white background`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=512&nologo=true&seed=${seed}`;
        
        // Timeout for pollinations check
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (response.ok) {
          finish(url);
          return true;
        }
      } catch (e) {
        console.log("Pollinations failed or timed out.");
      }
      return false;
    };

    // AI HORDE: The robust backup
    const runHorde = async () => {
      setForgeStatus("Pollinations failed. Engaging AI Horde...");
      try {
        const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' },
            body: JSON.stringify({
                prompt: `### D&D style monster illustration, ${monster.name}, ${monster.description}, cinematic digital art, white background, highly detailed ### ((((monochrome, grayscale, drawing, sketch, charcoal, blood, text))))`,
                params: { 
                  n: 1, 
                  steps: 25, 
                  width: 768, 
                  height: 512,
                  sampler_name: "k_euler",
                  cfg_scale: 7
                }
            })
        });
        const data = await response.json();
        const id = data.id;

        while (!isFinished) {
            const check = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`);
            const statusData = await check.json();
            
            if (statusData.done) {
                const result = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`);
                const finalData = await result.json();
                finish(finalData.generations[0].img);
                break;
            } else {
                setForgeStatus(`Horde Queue: ${statusData.queue_position ?? 'Waiting...'}`);
                await new Promise(r => setTimeout(r, 2500));
            }
        }
      } catch (e) {
        setForgeStatus("Both engines failed.");
        setIsForging(false);
      }
    };

    const pollinationsSuccess = await tryPollinations();
    if (!pollinationsSuccess && !isFinished) {
      await runHorde();
    }
  };

  const handleRegenerate = () => {
    const newMonster = generateMonster(genParams);
    const updated = { ...newMonster, id: monster.id, folderId: monster.folderId };
    setMonster(updated);
    onUpdate?.(updated);
    onGenerate(genParams);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...monster, [name]: value };
    setMonster(updated);
    onUpdate?.(updated);
  };

  const handleAbilityChange = (stat: keyof Monster['abilities'], value: number) => {
    const modifier = Math.floor((value - 10) / 2);
    const updated = {
      ...monster,
      abilities: {
        ...monster.abilities,
        [stat]: { score: value, modifier }
      }
    };
    setMonster(updated);
    onUpdate?.(updated);
  };

  const handleNumericChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...monster, [name]: parseInt(value) || 0 };
    setMonster(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="bg-[var(--mm-bg)] border border-[var(--mm-border)] rounded shadow-2xl flex flex-col h-full max-w-4xl mx-auto w-full text-[var(--mm-text)] transition-colors duration-300">
      <div className="p-4 border-b border-[var(--mm-border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--mm-header)]">Monster Editor</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onSave(monster)}
            className="flex items-center gap-2 bg-[var(--mm-accent)] text-white px-6 py-2 rounded font-black text-xs tracking-widest hover:bg-[#a6422d] transition-all shadow-md active:scale-95"
          >
            <Save size={14} /> SAVE DATA
          </button>
          <button 
            onClick={onCancel}
            className="p-1.5 text-[var(--mm-muted)] hover:bg-black/5 rounded transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Generation Panel */}
        <div className="bg-black/5 dark:bg-white/5 border border-[var(--mm-border)] rounded p-6">
          <button 
            onClick={() => setShowGenParams(!showGenParams)}
            className="w-full flex justify-between items-center text-[var(--mm-accent)] font-black text-xs uppercase tracking-widest"
          >
            <span className="flex items-center gap-2 px-2"><RefreshCw size={14} /> Random Generation Parameters</span>
            {showGenParams ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {showGenParams && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 space-y-4"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase opacity-60">CR</label>
                    <input 
                      type="number" 
                      value={genParams.cr}
                      onChange={e => setGenParams(p => ({ ...p, cr: parseFloat(e.target.value) }))}
                      className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-xs outline-none text-[var(--mm-text)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase opacity-60">Type</label>
                    <select 
                      value={genParams.type}
                      onChange={e => setGenParams(p => ({ ...p, type: e.target.value as CreatureType }))}
                      className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-xs outline-none text-[var(--mm-text)]"
                    >
                      {CREATURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase opacity-60">Size</label>
                    <select 
                      value={genParams.size}
                      onChange={e => setGenParams(p => ({ ...p, size: e.target.value as Size }))}
                      className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-xs outline-none text-[var(--mm-text)]"
                    >
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase opacity-60">Align</label>
                    <select 
                      value={genParams.alignment}
                      onChange={e => setGenParams(p => ({ ...p, alignment: e.target.value as Alignment }))}
                      className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-xs outline-none text-[var(--mm-text)]"
                    >
                      {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleRegenerate}
                  className="w-full bg-[var(--mm-accent)] text-white py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#a6422d] transition-all shadow-md"
                >
                  Regenerate Monster
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Basic Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">Monster Name</label>
             <input 
               name="name"
               value={monster.name}
               onChange={handleChange}
               className="text-2xl font-bold bg-transparent border-b-2 border-[var(--mm-border)] outline-none focus:border-[var(--mm-accent)] transition-all font-display text-[var(--mm-text)] p-2"
             />
           </div>
           <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">Assign to Vault</label>
             <select
               name="folderId"
               value={monster.folderId || ''}
               onChange={handleChange}
               className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-sm outline-none text-[var(--mm-text)] font-sans font-bold"
             >
               <option value="">None (General Bestiary)</option>
               {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
             </select>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">Hit Point Formula</label>
             <input 
               name="hpFormula"
               value={monster.hpFormula}
               onChange={handleChange}
               className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-sm outline-none text-[var(--mm-text)] font-sans font-bold"
             />
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">Armor Class</label>
             <input 
               type="number"
               name="ac"
               value={monster.ac}
               onChange={handleNumericChange}
               className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-sm outline-none text-[var(--mm-text)] font-sans font-bold"
             />
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">XP Reward</label>
             <input 
               type="number"
               name="xp"
               value={monster.xp}
               onChange={handleNumericChange}
               className="bg-[var(--mm-input)] border border-[var(--mm-border)] rounded p-2 text-sm outline-none text-[var(--mm-text)] font-sans font-bold"
             />
          </div>
        </section>

        {/* Ability Scores */}
        <section>
           <h3 className="text-[10px] uppercase font-black text-[var(--mm-header)] mb-4 tracking-widest">Ability Scores</h3>
           <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
             {Object.entries(monster.abilities).map(([key, value]) => {
               const val = value as AbilityScore;
               return (
                <div key={key} className="flex flex-col items-center bg-black/5 dark:bg-white/5 p-4 rounded border border-[var(--mm-border)]">
                  <label className="text-[10px] font-black text-[var(--mm-header)] uppercase">{key}</label>
                  <input 
                    type="number"
                    value={val.score}
                    onChange={e => handleAbilityChange(key as keyof Monster['abilities'], parseInt(e.target.value))}
                    className="w-full text-center text-xl font-black bg-transparent outline-none text-[var(--mm-text)]"
                  />
                  <span className="text-[11px] opacity-40 font-bold text-[var(--mm-text)]">({val.modifier >= 0 ? `+${val.modifier}` : val.modifier})</span>
                </div>
               );
             })}
           </div>
        </section>

        {/* Descriptions */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">Physical Description</label>
            <textarea 
              name="description"
              value={monster.description}
              onChange={handleChange}
              rows={3}
              className="p-4 bg-[var(--mm-input)] border border-[var(--mm-border)] rounded outline-none focus:border-[var(--mm-accent)] transition-all text-sm leading-relaxed text-[var(--mm-text)]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[var(--mm-header)] uppercase tracking-widest">History & Lore</label>
            <textarea 
              name="lore"
              value={monster.lore}
              onChange={handleChange}
              rows={4}
              className="p-4 bg-[var(--mm-input)] border border-[var(--mm-border)] rounded outline-none focus:border-[var(--mm-accent)] transition-all text-sm leading-relaxed text-[var(--mm-text)]"
            />
          </div>
        </section>

        {/* Image Display */}
        <section className="flex justify-center pb-8">
           <div className="relative group rounded-lg overflow-hidden shadow-2xl aspect-video w-full max-w-lg bg-black border border-[var(--mm-border)]">
             <img 
               src={monster.imageUrl} 
               alt={monster.name} 
               className={`w-full h-full object-cover transition-opacity duration-500 ${isForging ? 'opacity-20' : 'opacity-80'}`}
               referrerPolicy="no-referrer"
             />
             
             {isForging && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 backdrop-blur-sm p-4 text-center">
                 <Wand2 className="animate-spin mb-4" size={40} />
                 <p className="font-display font-black text-xs uppercase tracking-widest mb-2">{forgeStatus}</p>
                 <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[var(--mm-accent)]"
                      animate={{ x: [-200, 200] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                 </div>
               </div>
             )}

             {!isForging && (
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button 
                   onClick={forgeArt}
                   className="bg-[var(--mm-accent)] text-white px-8 py-3 rounded font-black text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                 >
                   <Wand2 size={16} /> FORGE ADAPTIVE ART
                 </button>
               </div>
             )}
           </div>
        </section>
      </div>
    </div>
  );
}
