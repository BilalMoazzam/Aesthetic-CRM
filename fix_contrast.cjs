const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  // Text contrast fixes for light cards
  [/text-white/g, 'text-primary'],
  [/#ffffff/g, '#86626E'],
  [/rgba\(255,255,255,0\.9\)/g, '#86626E'],
  [/rgba\(255,255,255,0\.7\)/g, 'rgba(134,98,110,0.8)'], // slightly transparent Smoky Rose
  
  // Background fixes (we turned bg-white into bg-primary last time, let's turn some into DBAFC1)
  // But wait, buttons use text-white, if I change ALL text-white to text-primary, buttons will be unreadable!
  // It's safer to just change the ones in the Dashboard/Pages.
  // Actually, btn-primary has `color: #ffffff !important` in index.css so they will be fine!
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      // Don't modify App.jsx text colors too aggressively maybe?
      if (file === 'App.jsx') continue;
      
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
