const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // 1. If an element has style={{ backgroundColor: settings.primaryAccent }}, 
      //    we ensure its text color is text-white, and remove text-primary
      content = content.replace(/className="(.*?text-primary.*?)".*?style=\{\{\s*(?:backgroundColor|background):\s*settings\.primaryAccent.*?\}\}/gs, (match, p1) => {
        return match.replace('text-primary', 'text-white');
      });

      // Also if it has background: `linear-gradient(...)` with settings.primaryAccent
      content = content.replace(/className="(.*?text-primary.*?)".*?style=\{\{\s*background:\s*`linear-gradient.*?settings\.primaryAccent.*?\}\}/gs, (match, p1) => {
        return match.replace('text-primary', 'text-white');
      });
      
      // Check for elements that have style={{ backgroundColor: settings.primaryAccent }} but no text-white or text-primary.
      // We'll just forcefully add text-white to their className if it's not there.
      // Actually, let's just replace all settings.primaryAccent usages with the tailwind class `bg-primary` 
      // or `text-primary` and just rely on that!
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed inline accents in:', file);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
