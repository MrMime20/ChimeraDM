import { Monster, AbilityScores } from '../types';

interface StatBlockProps {
  monster: Monster;
}

export default function StatBlock({ monster }: StatBlockProps) {
  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div className="w-[450px] bg-[var(--mm-stat-bg)] p-8 shadow-2xl relative font-serif text-[var(--mm-text)] leading-tight border-t-[6px] border-[var(--mm-header)] border-b-[6px] transition-colors duration-300">
      <div className="space-y-3">
        <header>
          <h2 className="text-3xl font-display font-black text-[var(--mm-header)] uppercase tracking-tight leading-none mb-1">
            {monster.name}
          </h2>
          <p className="text-sm italic font-medium opacity-80">
            {monster.size} {monster.type}, {monster.alignment}
          </p>
        </header>

        <div className="mm-divider" />

        <div className="space-y-1 text-sm font-bold text-[var(--mm-header)]">
          <div className="flex gap-2">
            <span className="font-black">Armor Class</span>
            <span className="text-[var(--mm-text)] font-normal">{monster.ac} ({monster.acType})</span>
          </div>
          <div className="flex gap-2">
            <span className="font-black">Hit Points</span>
            <span className="text-[var(--mm-text)] font-normal">{monster.hp} ({monster.hpFormula})</span>
          </div>
          <div className="flex gap-2">
            <span className="font-black">Speed</span>
            <span className="text-[var(--mm-text)] font-normal">{monster.speed}</span>
          </div>
        </div>

        <div className="mm-divider" />

        <div className="grid grid-cols-6 gap-0 py-1 text-center text-[var(--mm-header)]">
          {abilities.map(stat => (
            <div key={stat}>
              <div className="text-xs font-black uppercase tracking-widest mb-1">{stat}</div>
              <div className="text-sm text-[var(--mm-text)]">{monster.abilities[stat].score} ({monster.abilities[stat].modifier >= 0 ? '+' : ''}{monster.abilities[stat].modifier})</div>
            </div>
          ))}
        </div>

        <div className="mm-divider" />

        <div className="space-y-1 text-sm text-[var(--mm-header)]">
          {monster.savingThrows && monster.savingThrows.length > 0 && (
            <div>
               <span className="font-black">Saving Throws</span>
               <span className="text-[var(--mm-text)] ml-1">{monster.savingThrows.join(', ')}</span>
            </div>
          )}
          {monster.skills && monster.skills.length > 0 && (
            <div>
               <span className="font-black">Skills</span>
               <span className="text-[var(--mm-text)] ml-1">{monster.skills.join(', ')}</span>
            </div>
          )}
          <div>
             <span className="font-black">Senses</span>
             <span className="text-[var(--mm-text)] ml-1">{monster.senses.join(', ')}</span>
          </div>
          <div>
             <span className="font-black">Languages</span>
             <span className="text-[var(--mm-text)] ml-1">{monster.languages.join(', ')}</span>
          </div>
          <div>
             <span className="font-black">Challenge</span>
             <span className="text-[var(--mm-text)] ml-1">{monster.cr} ({monster.xp.toLocaleString()} XP)</span>
          </div>
        </div>

        <div className="mm-divider" />

        {/* Traits */}
        <div className="space-y-2">
          {monster.traits.map(trait => (
            <div key={trait.id} className="text-sm">
              <span className="font-black italic pr-1">{trait.name}.</span>
              <span className="opacity-95">{trait.description}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <h3 className="text-2xl font-display font-black text-[var(--mm-header)] border-b border-[var(--mm-header)]/40 mb-2">Actions</h3>
          <div className="space-y-3">
            {monster.actions.map(action => (
              <div key={action.id} className="text-sm">
                <span className="font-black italic pr-1">{action.name}.</span>
                <span className="opacity-95">{action.description}</span>
              </div>
            ))}
          </div>
        </div>

        {monster.reactions && monster.reactions.length > 0 && (
          <div className="pt-4">
            <h3 className="text-2xl font-display font-black text-[var(--mm-header)] border-b border-[var(--mm-header)]/40 mb-2">Reactions</h3>
            <div className="space-y-3">
              {monster.reactions.map(action => (
                <div key={action.id} className="text-sm">
                  <span className="font-black italic pr-1">{action.name}.</span>
                  <span className="opacity-95">{action.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
          <div className="pt-4">
            <h3 className="text-2xl font-display font-black text-[var(--mm-header)] border-b border-[var(--mm-header)]/40 mb-2">Legendary Actions</h3>
            <p className="text-[11px] mb-2">The monster can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The monster regains spent legendary actions at the start of its turn.</p>
            <div className="space-y-3">
              {monster.legendaryActions.map(action => (
                <div key={action.id} className="text-sm">
                  <span className="font-black italic pr-1">{action.name}.</span>
                  <span className="opacity-95">{action.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
