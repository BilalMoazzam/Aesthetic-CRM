const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  // Remove bg-primary/50 and bg-primary/90
  [/bg-primary\/50/g, 'bg-transparent'],
  [/bg-primary\/90/g, 'bg-white/20'],
  // Change bg-primary to use E7C8DD or just keep it? 
  // Wait, the user said "change grid/card color from 86626E to DBAFC1".
  // The cards have `card-pro` class. We will handle that in index.css.
  
  // They also said: "remove this color from all pages and button and number bg-primary/50"
  [/bg-primary\/50/g, ''],
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
