// ============================================================
// DevNest — Language Config
// ============================================================
import { Language } from '@/types/snippet.types';

export interface LanguageConfig {
  label: Language;
  shortLabel: string;
  color: string;        // badge background color
  textColor: string;    // badge text color
  iconSlug?: string;    // simpleicons.org slug for the language logo
}

export const LANGUAGES: LanguageConfig[] = [
  { label: 'JavaScript', shortLabel: 'JS',  color: '#F7DF1E', textColor: '#000000', iconSlug: 'javascript' },
  { label: 'TypeScript', shortLabel: 'TS',  color: '#3178C6', textColor: '#FFFFFF', iconSlug: 'typescript' },
  { label: 'Python',     shortLabel: 'PY',  color: '#3776AB', textColor: '#FFFFFF', iconSlug: 'python' },
  { label: 'Java',       shortLabel: 'JV',  color: '#ED8B00', textColor: '#FFFFFF' },
  { label: 'C#',         shortLabel: 'C#',  color: '#9B4F96', textColor: '#FFFFFF' },
  { label: 'C++',        shortLabel: 'C++', color: '#00599C', textColor: '#FFFFFF', iconSlug: 'cplusplus' },
  { label: 'C',          shortLabel: 'C',   color: '#A8B9CC', textColor: '#000000', iconSlug: 'c' },
  { label: 'Go',         shortLabel: 'GO',  color: '#00ADD8', textColor: '#FFFFFF', iconSlug: 'go' },
  { label: 'Rust',       shortLabel: 'RS',  color: '#CE422B', textColor: '#FFFFFF', iconSlug: 'rust' },
  { label: 'PHP',        shortLabel: 'PHP', color: '#777BB4', textColor: '#FFFFFF', iconSlug: 'php' },
  { label: 'Ruby',       shortLabel: 'RB',  color: '#CC342D', textColor: '#FFFFFF', iconSlug: 'ruby' },
  { label: 'Swift',      shortLabel: 'SW',  color: '#FA7343', textColor: '#FFFFFF', iconSlug: 'swift' },
  { label: 'Kotlin',     shortLabel: 'KT',  color: '#7F52FF', textColor: '#FFFFFF', iconSlug: 'kotlin' },
  { label: 'Dart',       shortLabel: 'DT',  color: '#0175C2', textColor: '#FFFFFF', iconSlug: 'dart' },
  { label: 'SQL',        shortLabel: 'SQL', color: '#336791', textColor: '#FFFFFF', iconSlug: 'mysql' },
  { label: 'HTML',       shortLabel: 'HTML',color: '#E34C26', textColor: '#FFFFFF', iconSlug: 'html5' },
  { label: 'CSS',        shortLabel: 'CSS', color: '#264DE4', textColor: '#FFFFFF', iconSlug: 'css3' },
  { label: 'Shell',      shortLabel: 'SH',  color: '#4EAA25', textColor: '#FFFFFF', iconSlug: 'gnubash' },
  { label: 'Bash',       shortLabel: 'BASH',color: '#4EAA25', textColor: '#FFFFFF', iconSlug: 'gnubash' },
  { label: 'PowerShell', shortLabel: 'PS',  color: '#012456', textColor: '#FFFFFF', iconSlug: 'powershell' },
  { label: 'Markdown',   shortLabel: 'MD',  color: '#083FA1', textColor: '#FFFFFF', iconSlug: 'markdown' },
  { label: 'JSON',       shortLabel: 'JSON',color: '#292929', textColor: '#FFFFFF', iconSlug: 'json' },
  { label: 'YAML',       shortLabel: 'YML', color: '#CB171E', textColor: '#FFFFFF', iconSlug: 'yaml' },
  { label: 'GraphQL',    shortLabel: 'GQL', color: '#E10098', textColor: '#FFFFFF', iconSlug: 'graphql' },
  { label: 'Vue',        shortLabel: 'VUE', color: '#41B883', textColor: '#FFFFFF', iconSlug: 'vuedotjs' },
  { label: 'Svelte',     shortLabel: 'SVT', color: '#FF3E00', textColor: '#FFFFFF', iconSlug: 'svelte' },
  { label: 'Dockerfile', shortLabel: 'DCK', color: '#2496ED', textColor: '#FFFFFF', iconSlug: 'docker' },
  { label: 'Solidity',   shortLabel: 'SOL', color: '#363636', textColor: '#FFFFFF', iconSlug: 'solidity' },
  { label: 'Elixir',     shortLabel: 'EX',  color: '#4E2A8E', textColor: '#FFFFFF', iconSlug: 'elixir' },
  { label: 'Groovy',     shortLabel: 'GRV', color: '#4298B8', textColor: '#FFFFFF', iconSlug: 'apachegroovy' },
  { label: 'Lua',        shortLabel: 'LUA', color: '#000080', textColor: '#FFFFFF', iconSlug: 'lua' },
  { label: 'Julia',      shortLabel: 'JL',  color: '#9558B2', textColor: '#FFFFFF', iconSlug: 'julia' },
  { label: 'Scala',      shortLabel: 'SC',  color: '#DC322F', textColor: '#FFFFFF', iconSlug: 'scala' },
  { label: 'Haskell',    shortLabel: 'HS',  color: '#5D4F85', textColor: '#FFFFFF', iconSlug: 'haskell' },
  { label: 'Perl',       shortLabel: 'PL',  color: '#39457E', textColor: '#FFFFFF', iconSlug: 'perl' },
  { label: 'R',          shortLabel: 'R',   color: '#278CC0', textColor: '#FFFFFF', iconSlug: 'r' },
  { label: 'Objective-C',shortLabel: 'OBJC',color: '#438EFF', textColor: '#FFFFFF', iconSlug: 'apple' },
  { label: 'Assembly',   shortLabel: 'ASM', color: '#6E4C13', textColor: '#FFFFFF' },
  { label: 'Other',      shortLabel: '?',   color: '#CCFF00', textColor: '#000000' },
];

export const POPULAR_LANGUAGES: Language[] = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#',
];

export const LANGUAGE_LOGOS: Record<string, string> = {
  'JavaScript': 'javascript/javascript-original.svg',
  'TypeScript': 'typescript/typescript-original.svg',
  'React': 'react/react-original.svg',
  'Python': 'python/python-original.svg',
  'Java': 'java/java-original.svg',
  'C++': 'cplusplus/cplusplus-original.svg',
  'C': 'c/c-original.svg',
  'C#': 'csharp/csharp-original.svg',
  'HTML': 'html5/html5-original.svg',
  'CSS': 'css3/css3-original.svg',
  'Go': 'go/go-original.svg',
  'Rust': 'rust/rust-original.svg',
  'PHP': 'php/php-original.svg',
  'Ruby': 'ruby/ruby-original.svg',
  'Swift': 'swift/swift-original.svg',
  'Kotlin': 'kotlin/kotlin-original.svg',
  'Dart': 'dart/dart-original.svg',
  'Vue': 'vuejs/vuejs-original.svg',
  'Svelte': 'svelte/svelte-original.svg',
  'Markdown': 'markdown/markdown-original.svg',
  'Bash': 'bash/bash-original.svg',
  'Shell': 'bash/bash-original.svg',
  'Dockerfile': 'docker/docker-original.svg',
  'SQL': 'mysql/mysql-original.svg',
  'GraphQL': 'graphql/graphql-plain.svg',
  'JSON': 'json/json-original.svg',
  'YAML': 'yaml/yaml-original.svg',
  'Solidity': 'solidity/solidity-original.svg',
  'Elixir': 'elixir/elixir-original.svg',
  'Lua': 'lua/lua-original.svg',
  'Scala': 'scala/scala-original.svg',
  'Haskell': 'haskell/haskell-original.svg',
  'Perl': 'perl/perl-original.svg',
  'R': 'r/r-original.svg',
  'Objective-C': 'objectivec/objectivec-plain.svg'
};

export function getLanguageConfig(lang: string): LanguageConfig {
  return LANGUAGES.find(l => l.label === lang) ?? LANGUAGES[LANGUAGES.length - 1];
}
