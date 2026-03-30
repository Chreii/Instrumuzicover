import fs from 'fs';
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/indigo/g, 'emerald');
fs.writeFileSync(file, content);
console.log('Replaced indigo with emerald');
