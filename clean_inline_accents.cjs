const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) processDir(p);
    else if (p.endsWith('.jsx')) {
      let code = fs.readFileSync(p, 'utf8');
      
      // We will append bg-primary and text-white to the existing className, and remove the inline style.
      // E.g. className="something" style={{ backgroundColor: settings.primaryAccent }}
      code = code.replace(/className="([^"]+)"\s*style=\{\{\s*backgroundColor:\s*settings\.primaryAccent\s*\}\}/g, (match, classes) => {
        // remove text-primary if it exists, add text-white
        let newClasses = classes.replace(/\btext-primary\b/g, '') + ' bg-primary text-white';
        return `className="${newClasses.trim()}"`;
      });
      
      // For border color
      code = code.replace(/className="([^"]+)"\s*style=\{\{\s*borderColor:\s*settings\.primaryAccent\s*\}\}/g, (match, classes) => {
        return `className="${classes} border-primary"`;
      });

      // For text color
      code = code.replace(/className="([^"]+)"\s*style=\{\{\s*color:\s*settings\.primaryAccent\s*\}\}/g, (match, classes) => {
        let newClasses = classes.replace(/\btext-white\b/g, '') + ' text-primary';
        return `className="${newClasses.trim()}"`;
      });

      fs.writeFileSync(p, code);
    }
  }
}
processDir(path.join(__dirname, 'src', 'pages'));
