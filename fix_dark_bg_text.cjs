const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

// Function to fix dark bg text color
function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // If we see bg-primary followed by text-primary, change to text-white
      content = content.replace(/bg-primary([^"']*)text-primary/g, 'bg-primary$1text-white');
      
      // Sometimes it's text-primary then bg-primary
      content = content.replace(/text-primary([^"']*)bg-primary/g, 'text-white$1bg-primary');
      
      // Specifically fix bg-[#86626E] text-primary
      content = content.replace(/bg-\[#86626E\]([^"']*)text-primary/g, 'bg-[#86626E]$1text-white');
      content = content.replace(/text-primary([^"']*)bg-\[#86626E\]/g, 'text-white$1bg-[#86626E]');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

processDir(dir);
