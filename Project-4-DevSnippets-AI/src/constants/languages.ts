// ============================================================
// DevNest — Language Config
// ============================================================
import { Language } from '@/types/snippet.types';

export interface LanguageConfig {
  label: Language;
  shortLabel: string;
  color: string;        // badge background color
  textColor: string;    // badge text color
}

export const LANGUAGES: LanguageConfig[] = [
  { label: 'JavaScript', shortLabel: 'JS',  color: '#F7DF1E', textColor: '#000000' },
  { label: 'TypeScript', shortLabel: 'TS',  color: '#3178C6', textColor: '#FFFFFF' },
  { label: 'Python',     shortLabel: 'PY',  color: '#3776AB', textColor: '#FFFFFF' },
  { label: 'Java',       shortLabel: 'JV',  color: '#ED8B00', textColor: '#FFFFFF' },
  { label: 'C#',         shortLabel: 'C#',  color: '#9B4F96', textColor: '#FFFFFF' },
  { label: 'C++',        shortLabel: 'C++', color: '#00599C', textColor: '#FFFFFF' },
  { label: 'C',          shortLabel: 'C',   color: '#A8B9CC', textColor: '#000000' },
  { label: 'Go',         shortLabel: 'GO',  color: '#00ADD8', textColor: '#FFFFFF' },
  { label: 'Rust',       shortLabel: 'RS',  color: '#CE422B', textColor: '#FFFFFF' },
  { label: 'PHP',        shortLabel: 'PHP', color: '#777BB4', textColor: '#FFFFFF' },
  { label: 'Ruby',       shortLabel: 'RB',  color: '#CC342D', textColor: '#FFFFFF' },
  { label: 'Swift',      shortLabel: 'SW',  color: '#FA7343', textColor: '#FFFFFF' },
  { label: 'Kotlin',     shortLabel: 'KT',  color: '#7F52FF', textColor: '#FFFFFF' },
  { label: 'Dart',       shortLabel: 'DT',  color: '#0175C2', textColor: '#FFFFFF' },
  { label: 'SQL',        shortLabel: 'SQL', color: '#336791', textColor: '#FFFFFF' },
  { label: 'HTML',       shortLabel: 'HTML',color: '#E34C26', textColor: '#FFFFFF' },
  { label: 'CSS',        shortLabel: 'CSS', color: '#264DE4', textColor: '#FFFFFF' },
  { label: 'Shell',      shortLabel: 'SH',  color: '#4EAA25', textColor: '#FFFFFF' },
  { label: 'Bash',       shortLabel: 'BASH',color: '#4EAA25', textColor: '#FFFFFF' },
  { label: 'PowerShell', shortLabel: 'PS',  color: '#012456', textColor: '#FFFFFF' },
  { label: 'Markdown',   shortLabel: 'MD',  color: '#083FA1', textColor: '#FFFFFF' },
  { label: 'JSON',       shortLabel: 'JSON',color: '#292929', textColor: '#FFFFFF' },
  { label: 'YAML',       shortLabel: 'YML', color: '#CB171E', textColor: '#FFFFFF' },
  { label: 'GraphQL',    shortLabel: 'GQL', color: '#E10098', textColor: '#FFFFFF' },
  { label: 'Vue',        shortLabel: 'VUE', color: '#41B883', textColor: '#FFFFFF' },
  { label: 'Svelte',     shortLabel: 'SVT', color: '#FF3E00', textColor: '#FFFFFF' },
  { label: 'Dockerfile', shortLabel: 'DCK', color: '#2496ED', textColor: '#FFFFFF' },
  { label: 'Solidity',   shortLabel: 'SOL', color: '#363636', textColor: '#FFFFFF' },
  { label: 'Elixir',     shortLabel: 'EX',  color: '#4E2A8E', textColor: '#FFFFFF' },
  { label: 'Groovy',     shortLabel: 'GRV', color: '#4298B8', textColor: '#FFFFFF' },
  { label: 'Lua',        shortLabel: 'LUA', color: '#000080', textColor: '#FFFFFF' },
  { label: 'Julia',      shortLabel: 'JL',  color: '#9558B2', textColor: '#FFFFFF' },
  { label: 'Scala',      shortLabel: 'SC',  color: '#DC322F', textColor: '#FFFFFF' },
  { label: 'Haskell',    shortLabel: 'HS',  color: '#5D4F85', textColor: '#FFFFFF' },
  { label: 'Perl',       shortLabel: 'PL',  color: '#39457E', textColor: '#FFFFFF' },
  { label: 'R',          shortLabel: 'R',   color: '#278CC0', textColor: '#FFFFFF' },
  { label: 'Objective-C',shortLabel: 'OBJC',color: '#438EFF', textColor: '#FFFFFF' },
  { label: 'Assembly',   shortLabel: 'ASM', color: '#6E4C13', textColor: '#FFFFFF' },
  { label: 'Other',      shortLabel: '?',   color: '#CCFF00', textColor: '#000000' },
];

export const POPULAR_LANGUAGES: Language[] = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#',
];

export function getLanguageConfig(lang: string): LanguageConfig {
  return LANGUAGES.find(l => l.label === lang) ?? LANGUAGES[LANGUAGES.length - 1];
}
