const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  // Emerald to primary/rose
  [/bg-emerald-50/g, 'bg-[#E7C8DD]'],
  [/text-emerald-700/g, 'text-primary'],
  [/text-emerald-600/g, 'text-primary'],
  [/bg-emerald-100/g, 'bg-[#DBAFC1]'],
  [/hover:bg-emerald-100/g, 'hover:bg-[#DBAFC1]'],
  [/bg-emerald-500/g, 'bg-primary'],
  [/text-emerald-400/g, 'text-primary'],
  [/border-emerald-[0-9]+/g, 'border-primary'],
  [/shadow-emerald-500\/10/g, 'shadow-rose-sm'],
  
  // They also said: "if background is dark then use text color white light and vice versa"
  // The cards are DBAFC1 (light), and I already set their text to 86626E in index.css.
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

processDir(dir);
