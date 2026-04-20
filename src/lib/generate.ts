import { Monster, AbilityScores, Action, Trait, Size, CreatureType, Alignment } from '../types';
import { 
  CR_TABLE, 
  NAME_PARTS, 
  TRAITS, 
  ARCHETYPES, 
  HP_DICE, 
  CREATURE_TYPES, 
  SIZES, 
  ALIGNMENTS,
  LORE_COMPONENTS,
  DESCRIPTION_COMPONENTS
} from '../constants';

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getModifier = (score: number) => Math.floor((score - 10) / 2);

export function generateMonster(params: {
  cr?: number;
  type?: CreatureType;
  size?: Size;
  alignment?: Alignment;
}): Monster {
  const cr = params.cr ?? 1;
  const type = params.type ?? randomElement(CREATURE_TYPES);
  const size = params.size ?? randomElement(SIZES);
  const alignment = params.alignment ?? randomElement(ALIGNMENTS);
  const archetypeNames = Object.keys(ARCHETYPES) as (keyof typeof ARCHETYPES)[];
  const archetypeKey = randomElement(archetypeNames);
  const archetype = ARCHETYPES[archetypeKey];

  const stats = CR_TABLE[cr] || CR_TABLE[1];
  
  // Base stats calculation
  const baseScores: Record<string, number> = {
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  };

  const scaleFactor = Math.sqrt(cr + 1) * 3.5;
  baseScores[archetype.main] = 13 + scaleFactor;
  baseScores[archetype.secondary] = 11 + scaleFactor * 0.75;
  
  Object.keys(baseScores).forEach(stat => {
    if (stat !== archetype.main && stat !== archetype.secondary) {
      baseScores[stat] = 8 + randomInt(0, 4) + (cr / 2.5);
    }
  });

  const abilities: AbilityScores = {
    str: { score: Math.round(baseScores.str), modifier: getModifier(Math.round(baseScores.str)) },
    dex: { score: Math.round(baseScores.dex), modifier: getModifier(Math.round(baseScores.dex)) },
    con: { score: Math.round(baseScores.con), modifier: getModifier(Math.round(baseScores.con)) },
    int: { score: Math.round(baseScores.int), modifier: getModifier(Math.round(baseScores.int)) },
    wis: { score: Math.round(baseScores.wis), modifier: getModifier(Math.round(baseScores.wis)) },
    cha: { score: Math.round(baseScores.cha), modifier: getModifier(Math.round(baseScores.cha)) },
  };

  // HP Calculation - Better balance for CR (Strictly following Monster Manual range)
  const die = HP_DICE[size];
  const hpBase = randomInt(stats.hpMin, stats.hpMax);
  const targetHp = hpBase * archetype.hpBonus;
  const numDice = Math.max(1, Math.round(targetHp / (die / 2 + 0.5 + abilities.con.modifier)));
  const hp = Math.floor(numDice * (die / 2 + 0.5) + (numDice * abilities.con.modifier));
  const hpFormula = `${numDice}d${die} ${numDice * abilities.con.modifier >= 0 ? '+' : '-'} ${Math.abs(numDice * abilities.con.modifier)}`;

  // Name Generation
  const name = `${randomElement(NAME_PARTS.prefixes)}${randomElement(NAME_PARTS.middles)} ${randomElement(NAME_PARTS.creatures)}`;

  // Sense-making Traits
  const relevantTraits = TRAITS.filter(t => t.types.includes(type) || t.types.includes('Monster'));
  const monsterTraits: Trait[] = [];
  const traitCount = cr >= 20 ? 4 : (cr >= 10 ? 3 : (cr >= 3 ? 2 : 1));
  
  for (let i = 0; i < traitCount; i++) {
    if (relevantTraits.length === 0) break;
    const idx = randomInt(0, relevantTraits.length - 1);
    const t = relevantTraits[idx];
    monsterTraits.push({ id: Math.random().toString(36).substr(2, 9), ...t });
    relevantTraits.splice(idx, 1);
  }

  // Actions
  const actions: Action[] = [];
  const legendaryActions: Action[] = [];
  const reactions: Action[] = [];
  const atkBonus = stats.attackBonus + (abilities[archetype.main as keyof AbilityScores].modifier);
  const avgDmg = (stats.damageMin + stats.damageMax) / 2;
  
  if (cr >= 2) {
    actions.push({
      id: 'multiattack',
      name: 'Multiattack',
      description: `The ${name} makes ${cr >= 11 ? 3 : 2} attacks.`,
      type: 'Special'
    });
  }

  const dmgDie = cr > 15 ? 12 : (cr > 8 ? 10 : (cr > 3 ? 8 : 6));
  const attacksPerRound = cr >= 11 ? 3 : (cr >= 2 ? 2 : 1);
  const dmgPerAttack = avgDmg / attacksPerRound;
  const dmgDiceCount = Math.max(1, Math.round((dmgPerAttack - abilities.str.modifier) / (dmgDie / 2 + 0.5)));

  actions.push({
    id: 'melee-attack',
    name: archetype.main === 'str' ? 'Crushing Blow' : 'Piercing Strike',
    description: `Melee Weapon Attack: +${atkBonus} to hit, reach 5 ft., one target. Hit: ${dmgDiceCount}d${dmgDie} + ${abilities.str.modifier} damage.`,
    type: 'Melee Weapon Attack'
  });

  if (cr >= 5) {
    actions.push({
      id: 'special-action',
      name: 'Overwhelming Surge',
      description: `The ${name} unleashes a burst of energy. Each creature within 15 feet must make a DC ${stats.saveDC} Strength saving throw, taking ${(dmgDiceCount + 1) * 2}d6 damage on a failed save, or half as much on a success.`,
      type: 'Special'
    });
  }

  // Legendary Actions for High CR
  if (cr >= 10) {
    legendaryActions.push({
      id: 'leg-1',
      name: 'Detect',
      description: 'The monster makes a Wisdom (Perception) check.',
      type: 'Legendary'
    });
    legendaryActions.push({
      id: 'leg-2',
      name: 'Move',
      description: 'The monster moves up to its speed without provoking opportunity attacks.',
      type: 'Legendary'
    });
    legendaryActions.push({
      id: 'leg-3',
      name: 'Sudden Strike (Costs 2 Actions)',
      description: 'The monster makes one melee attack.',
      type: 'Legendary'
    });
  }

  // Reactions
  if (cr >= 3) {
    reactions.push({
      id: 'react-1',
      name: 'Parry',
      description: `The monster adds +${Math.max(2, abilities.dex.modifier)} to its AC against one melee attack that would hit it. To do so, the monster must see the attacker and be wielding a melee weapon.`,
      type: 'Reaction'
    });
  }

  // Expanded Description & Lore
  const texture = randomElement(DESCRIPTION_COMPONENTS.textures);
  const feature = randomElement(DESCRIPTION_COMPONENTS.features);
  const move = randomElement(DESCRIPTION_COMPONENTS.movement);
  
  const description = `This ${size.toLowerCase()} ${type.toLowerCase()} is ${texture}, possessing ${feature}. It ${move}, projecting an aura of ${alignment.toLowerCase()} intent. Its physical form seems to defy the natural laws of this world, making it a sight of both awe and terror for any traveler.`;

  const origin = randomElement(LORE_COMPONENTS.origins);
  const habitat = randomElement(LORE_COMPONENTS.habitats);
  const behavior = randomElement(LORE_COMPONENTS.behaviors);

  const LORE_TEMPLATES = [
    `The origins of the ${name} are shrouded in myth; some say it was ${origin}. In the ancient scrolls salvaged from the burning of the Great Library, it is recorded that ${habitat}. Most terrifyingly, it is ${behavior}, a trait discovered at great cost by the frontier guides of old.`,
    `Legends whispered by mountain guides claim the ${name} was ${origin}. Those who have ventured near its territory say ${habitat}. It is widely feared because it is ${behavior}, making it a priority threat for any local garrison.`,
    `Folklore dictates that the first ${name} was ${origin}. Sightings consistently report that ${habitat}. Survivors of its rampages often mention it is ${behavior}, an observation that has saved many lives in the borderlands.`,
    `Scholars of the occult believe this creature was ${origin}. Field reports indicate ${habitat}. Observations by the Royal Bestiary suggest that it is ${behavior}, requiring specialized tactics to neutralize.`,
    `Common superstition holds that the ${name} was ${origin}. Local legends warn that ${habitat}. It is documented by the Church of the Eternal Light that this entity is ${behavior}, a sign of grave cosmic imbalance.`
  ];

  const lore = randomElement(LORE_TEMPLATES);

  const imagePrompt = `D&D style monster illustration, a ${size} ${type} called ${name}, ${description}, cinematic lighting, detailed dark fantasy art, ink wash parchment style`;
  // Initial placeholder, artwork will be forged via AI Horde in the UI
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=720&height=720&nologo=true&seed=${randomInt(0, 999999)}`;

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    size,
    alignment,
    cr,
    xp: stats.xp,
    hp,
    hpFormula,
    ac: stats.ac + (archetype.acBonus),
    acType: stats.ac + archetype.acBonus >= 15 ? 'natural armor' : 'unarmored',
    speed: `${archetype.speed} ft.`,
    abilities,
    savingThrows: [archetype.main.toUpperCase(), archetype.secondary.toUpperCase()],
    skills: ['Perception', 'Athletics'],
    senses: ['Darkvision 60 ft.', 'Passive Perception 12'],
    languages: [type === 'Fiend' ? 'Abyssal' : (type === 'Celestial' ? 'Celestial' : 'Common')],
    traits: monsterTraits,
    actions,
    legendaryActions,
    reactions,
    lore,
    description,
    imageUrl,
    createdAt: Date.now()
  };
}
