// ============================================================
// DevNest — Dynamic Code Syntax Highlighter (Theme Aware)
// ============================================================
import React, { useMemo } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/theme/colors';

interface CodeHighlighterProps {
  code: string;
  language?: string;
  fontSize?: number;
}

type TokenType =
  | 'comment'
  | 'string'
  | 'link'
  | 'decorator'
  | 'phpVar'
  | 'htmlTag'
  | 'regex'
  | 'asyncWord'
  | 'returnWord'
  | 'importWord'
  | 'errorWord'
  | 'loopWord'
  | 'conditionWord'
  | 'jsKeyword'
  | 'tsKeyword'
  | 'goRustKeyword'
  | 'sqlCommand'
  | 'pythonKeyword'
  | 'dataType'
  | 'keyword'
  | 'function'
  | 'constant'
  | 'boolean'
  | 'number'
  | 'operator'
  | 'default';

interface Token {
  text: string;
  type: TokenType;
}

const RULES: { type: TokenType; regex: RegExp }[] = [
  { type: 'comment', regex: /\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\// },
  { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/ },
  { type: 'link', regex: /https?:\/\/[^\s]+/ },
  { type: 'decorator', regex: /@\w+/ },
  { type: 'phpVar', regex: /\$\w+/ },
  { type: 'htmlTag', regex: /<\/?[a-zA-Z0-9:-]+(?:\s+[^>]*?)?>/ },
  { type: 'regex', regex: /\/[^/\n]+\/[gimy]*/ },
  { type: 'asyncWord', regex: /\b(?:async|await)\b/i },
  { type: 'returnWord', regex: /\b(?:return|yield)\b/i },
  { type: 'importWord', regex: /\b(?:import|include|require|from|export)\b/i },
  { type: 'errorWord', regex: /\b(?:throw|catch|try|finally|raise|except)\b/i },
  { type: 'loopWord', regex: /\b(?:for|while|do|foreach)\b/i },
  { type: 'conditionWord', regex: /\b(?:if|else|switch|case|default|break|continue)\b/i },
  { type: 'jsKeyword', regex: /\b(?:const|let|var)\b/ },
  { type: 'tsKeyword', regex: /\b(?:interface|type|enum|namespace)\b/ },
  { type: 'goRustKeyword', regex: /\b(?:func|defer|mut|match|fn)\b/ },
  { type: 'sqlCommand', regex: /\b(?:SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING|DESC|ASC|LEFT|RIGHT|OUTER|INNER|CREATE\s+TABLE|CREATE\s+INDEX|REFERENCES|FOREIGN\s+KEY|PRIMARY\s+KEY)\b/i },
  { type: 'pythonKeyword', regex: /\b(?:def|lambda)\b/ },
  { type: 'dataType', regex: /\b(?:string|boolean|char|int|float|double|long|bool|void|int32|int64|float32|float64|varchar|integer|vector|map)\b/i },
  { type: 'keyword', regex: /\b(?:class|public|private|protected|static|new|this|super|extends|implements|package|struct)\b/ },
  { type: 'function', regex: /\b\w+(?=\()/ },
  { type: 'constant', regex: /\b[A-Z_][A-Z0-9_]*\b/ },
  { type: 'boolean', regex: /\b(?:true|false|null|undefined)\b/ },
  { type: 'number', regex: /\b\d+(?:\.\d+)?\b/ },
  { type: 'operator', regex: /[+\-*/%&|^!=<>:~]+/ },
];

export function CodeHighlighter({ code, language = 'javascript', fontSize = 13 }: CodeHighlighterProps) {
  const colors = useThemeColors();
  const theme = colors.bg.primary === '#000000' ? 'dark' : 'light';

  // Build scanner list matching tokens
  const tokens = useMemo(() => {
    const list: Token[] = [];
    const sourceRegexes = RULES.map(r => `(${r.regex.source})`);
    const combined = new RegExp(sourceRegexes.join('|'), 'g');

    let lastIndex = 0;
    let match;

    while ((match = combined.exec(code)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        list.push({
          text: code.substring(lastIndex, matchIndex),
          type: 'default',
        });
      }

      // Find which capturing group matched
      let matchedType: TokenType = 'default';
      for (let i = 1; i <= RULES.length; i++) {
        if (match[i] !== undefined) {
          matchedType = RULES[i - 1].type;
          break;
        }
      }

      list.push({
        text: match[0],
        type: matchedType,
      });

      lastIndex = combined.lastIndex;
    }

    if (lastIndex < code.length) {
      list.push({
        text: code.substring(lastIndex),
        type: 'default',
      });
    }

    return list;
  }, [code, language]);

  // Color suggestions mapped to the user request table values
  const tokenStyles = useMemo(() => {
    if (theme === 'dark') {
      return {
        comment: { color: '#8E9297' },       // White/Gray comments
        string: { color: '#4ADE80' },        // Light Green
        link: { color: '#67E8F9' },          // Light Cyan
        decorator: { color: '#F97316' },     // Orange
        phpVar: { color: '#A3E635' },        // Lime
        htmlTag: { color: '#EF4444' },       // Red
        regex: { color: '#22C55E' },         // Neon Green
        asyncWord: { color: '#C084FC' },     // Purple
        returnWord: { color: '#F472B6' },    // Pink
        importWord: { color: '#F472B6' },    // Pink
        errorWord: { color: '#DC2626' },      // Bright Red
        loopWord: { color: '#38BDF8' },      // Sky Blue
        conditionWord: { color: '#3B82F6' }, // Blue
        jsKeyword: { color: '#22D3EE' },     // Cyan
        tsKeyword: { color: '#C084FC' },     // Violet
        goRustKeyword: { color: '#F97316' }, // Orange
        sqlCommand: { color: '#22D3EE' },    // Cyan
        pythonKeyword: { color: '#3B82F6' }, // Blue
        dataType: { color: '#10B981' },      // Green
        keyword: { color: '#3B82F6' },       // Blue
        function: { color: '#A855F7' },      // Purple
        constant: { color: '#F97316' },      // Orange
        boolean: { color: '#06B6D4' },       // Cyan/Booleans
        number: { color: '#FACC15' },        // Yellow
        operator: { color: '#EF4444' },      // Red
        default: { color: '#FFFFFF' },       // White
      };
    } else {
      return {
        comment: { color: '#9CA3AF' },       // Gray
        string: { color: '#166534' },        // Green
        link: { color: '#0891B2' },          // Cyan
        decorator: { color: '#C2410C' },     // Orange
        phpVar: { color: '#4D7C0F' },        // Lime
        htmlTag: { color: '#991B1B' },       // Red
        regex: { color: '#15803D' },         // Neon Green
        asyncWord: { color: '#7E22CE' },     // Purple
        returnWord: { color: '#BE185D' },    // Pink
        importWord: { color: '#BE185D' },    // Pink
        errorWord: { color: '#B91C1C' },      // Bright Red
        loopWord: { color: '#0369A1' },      // Sky Blue
        conditionWord: { color: '#1D4ED8' }, // Blue
        jsKeyword: { color: '#0891B2' },     // Cyan
        tsKeyword: { color: '#6D28D9' },     // Violet
        goRustKeyword: { color: '#C2410C' }, // Orange
        sqlCommand: { color: '#0891B2' },    // Cyan
        pythonKeyword: { color: '#1D4ED8' }, // Blue
        dataType: { color: '#047857' },      // Green
        keyword: { color: '#1D4ED8' },       // Blue
        function: { color: '#6D28D9' },      // Purple
        constant: { color: '#C2410C' },      // Orange
        boolean: { color: '#0369A1' },       // Cyan
        number: { color: '#A16207' },        // Yellow
        operator: { color: '#B91C1C' },      // Red
        default: { color: '#18181B' },       // Dark variable
      };
    }
  }, [theme]);

  const baseFont = {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize,
    lineHeight: Math.round(fontSize * 1.6),
  };

  return (
    <Text style={baseFont}>
      {tokens.map((token, idx) => (
        <Text key={idx} style={tokenStyles[token.type]}>
          {token.text}
        </Text>
      ))}
    </Text>
  );
}
