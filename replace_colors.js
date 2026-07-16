const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

const replacements = [
  [/bg-blue-600/g, 'bg-primary'],
  [/text-blue-600/g, 'text-primary'],
  [/text-blue-700/g, 'text-primary'],
  [/border-blue-600/g, 'border-primary'],
  [/border-blue-100/g, 'border-[#c89aad]'],
  [/border-blue-300/g, 'border-primary'],
  [/bg-blue-50/g, 'bg-[#E7C8DD]'],
  [/hover:bg-blue-50/g, 'hover:bg-[#E7C8DD]'],
  [/bg-blue-100/g, 'bg-[#DBAFC1]'],
  [/hover:bg-blue-100/g, 'hover:bg-[#DBAFC1]'],
  [/shadow-blue-100/g, 'shadow-rose-sm'],
  [/text-blue-100/g, 'text-white'],
  [/bg-indigo-50/g, 'bg-[#E7C8DD]'],
  [/text-indigo-600/g, 'text-primary'],
  [/text-blue-800/g, 'text-[#6e4f5a]'],
  [/text-blue-400/g, 'text-primary'],
  [/focus:ring-blue-500/g, 'focus:ring-primary'],
  [/bg-gradient-to-br from-blue-600 to-blue-700/g, 'bg-primary']
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
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
