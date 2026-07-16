const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) processDir(p);
    else if (p.endsWith('.jsx')) {
      let code = fs.readFileSync(p, 'utf8');

      // 1. Fix ternary `selected ? { backgroundColor: settings.primaryAccent } : ...`
      // We'll look for `text-primary` inside the preceding className and replace it with `text-white` if it is selected.
      // Easiest is to just globally replace `'text-primary border-transparent shadow-sm'` (since we know the exact string here) with `'text-white border-transparent shadow-sm bg-primary'` and completely remove the style tag.
      code = code.replace(
        /selected\s*\?\s*'text-primary border-transparent shadow-sm'\s*:\s*booked\s*\?\s*'border-slate-100 bg-primary text-white\/70 line-through opacity-30'\s*:\s*'border-slate-200 hover:border-slate-300 text-white bg-primary hover:bg-primary'/g,
        `selected ? 'text-white border-transparent shadow-sm bg-primary' : booked ? 'border-slate-100 bg-primary text-white/70 line-through opacity-30' : 'border-slate-200 hover:border-slate-300 text-white bg-primary hover:bg-primary'`
      );

      // Now remove the inline style for selected
      code = code.replace(/style=\{selected \? \{ backgroundColor: settings\.primaryAccent \} : \{\}\}/g, '');

      // 2. Fix BookingManager `selected ? { backgroundColor: settings.primaryAccent, borderColor: settings.primaryAccent }`
      code = code.replace(
        /selected \? 'border-transparent text-primary' : 'border-slate-200 text-white hover:border-slate-300'/g,
        `selected ? 'border-transparent text-white bg-primary' : 'border-slate-200 text-white hover:border-slate-300'`
      );
      code = code.replace(/style=\{selected \? \{ backgroundColor: settings\.primaryAccent, borderColor: settings\.primaryAccent \} : \{\}\}/g, '');
      
      // 3. Fix ScheduleManager isToday ternary
      code = code.replace(/style=\{isToday \? \{ backgroundColor: settings\.primaryAccent \} : undefined\}/g, '');
      // The className already has `${isToday ? 'bg-primary text-white shadow-sm' : ''}` let's check
      code = code.replace(/\$\{isToday \? 'text-primary' : 'text-primary\/60'\}/g, "${isToday ? 'text-white bg-primary' : 'text-primary/60'}");
      
      // 4. Any other text-primaryAccent
      code = code.replace(/text-primaryAccent/g, 'text-primary');

      fs.writeFileSync(p, code);
    }
  }
}
processDir(path.join(__dirname, 'src', 'pages'));
