const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
  // Remove blur
  [/backdrop-blur-sm/g, ''],
  [/backdrop-blur-md/g, ''],
  [/backdrop-blur/g, ''],
  // Replace bg-white
  [/bg-white\b/g, 'bg-primary'],
  [/bg-white\/[0-9]+/g, 'bg-primary'],
  // Replace dark text classes
  [/text-slate-900/g, 'text-white'],
  [/text-slate-800/g, 'text-white'],
  [/text-slate-700/g, 'text-white'],
  [/text-slate-600/g, 'text-white'],
  [/text-slate-500/g, 'text-white/80'],
  [/text-slate-400/g, 'text-white/70'],
  [/text-gray-900/g, 'text-white'],
  [/text-gray-800/g, 'text-white'],
  [/text-gray-700/g, 'text-white'],
  [/text-gray-600/g, 'text-white'],
  [/text-gray-500/g, 'text-white/80'],
  [/text-gray-400/g, 'text-white/70'],
  // Replace inline dark colors
  [/#2d1f24/g, '#ffffff'],
  [/#7a5a62/g, 'rgba(255,255,255,0.9)'],
  [/#9e7a86/g, 'rgba(255,255,255,0.7)'],
  // Fix background slate
  [/bg-slate-50/g, 'bg-primary'],
  [/bg-slate-100/g, 'bg-primary'],
  [/bg-gray-50/g, 'bg-primary'],
  [/bg-gray-100/g, 'bg-primary'],
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
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
