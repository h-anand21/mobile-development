const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'constants', 'templates.ts');
let content = fs.readFileSync(file, 'utf8');

// I will parse the TEMPLATES array out by string manipulation, fix the strings, and write it back.
// Since it's a JS object literal, it's easier to just do a regex replace on the backtick strings.
// A regex to match content: `...`
content = content.replace(/content:\s*`([^`\\]*(?:\\.[^`\\]*)*)`/g, (match, p1) => {
    // p1 is the string inside the backticks.
    // Let's unescape whatever was escaped:
    let unescaped = p1.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    // Now let's JSON.stringify it to get a safe double-quoted string with all newlines and quotes escaped
    return `content: ${JSON.stringify(unescaped)}`;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed templates.ts');
