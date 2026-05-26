/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // DevNest brand colors
        'dn-bg':       '#0D1117',
        'dn-card':     '#161B22',
        'dn-input':    '#21262D',
        'dn-border':   '#30363D',
        'dn-green':    '#39D353',
        'dn-green-d':  '#2EA043',
        'dn-text':     '#E6EDF3',
        'dn-muted':    '#8B949E',
        'dn-danger':   '#F85149',
        'dn-warning':  '#D29922',
        'dn-info':     '#58A6FF',
      },
      fontFamily: {
        mono: ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
};
