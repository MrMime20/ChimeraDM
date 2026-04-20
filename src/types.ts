/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type Alignment = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | 'Lawful Neutral' | 'Neutral' | 'Chaotic Neutral' | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil' | 'Unaligned';
export type CreatureType = 'Aberration' | 'Beast' | 'Celestial' | 'Construct' | 'Dragon' | 'Elemental' | 'Fey' | 'Fiend' | 'Giant' | 'Humanoid' | 'Monstrosity' | 'Ooze' | 'Plant' | 'Undead';

export interface AbilityScore {
  score: number;
  modifier: number;
}

export interface AbilityScores {
  str: AbilityScore;
  dex: AbilityScore;
  con: AbilityScore;
  int: AbilityScore;
  wis: AbilityScore;
  cha: AbilityScore;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  type: 'Melee Weapon Attack' | 'Ranged Weapon Attack' | 'Special' | 'Legendary' | 'Reaction';
}

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface Monster {
  id: string;
  name: string;
  type: CreatureType;
  size: Size;
  alignment: Alignment;
  cr: number;
  xp: number;
  hp: number;
  hpFormula: string;
  ac: number;
  acType: string;
  speed: string;
  abilities: AbilityScores;
  savingThrows: string[];
  skills: string[];
  senses: string[];
  languages: string[];
  traits: Trait[];
  actions: Action[];
  legendaryActions?: Action[];
  reactions?: Action[];
  lore: string;
  description: string;
  imageUrl: string;
  folderId?: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
}

export interface AppData {
  monsters: Monster[];
  folders: Folder[];
}
