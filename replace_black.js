import fs from 'fs';
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/zinc-950/g, 'black');
fs.writeFileSync(file, content);
console.log('Replaced zinc-950 with black');
