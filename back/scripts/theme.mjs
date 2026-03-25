import fs from 'fs';
import path from 'path';

const dirs = [
  'e:/Projects/CivilBridge/Civilbridge/front/src/pages/dashboard/roles',
  'e:/Projects/CivilBridge/Civilbridge/front/src/pages/dashboard/components',
  'e:/Projects/CivilBridge/Civilbridge/front/src/pages/dashboard'
];

const reps = {
  "'#0a0a0a'": "'var(--card-bg)'",
  "'#1a1a1a'": "'var(--border-color)'",
  "'#262626'": "'var(--border-color)'",
  "'#050505'": "'var(--bg-color)'",
  "'#f0f0f0'": "'var(--text-color)'",
  "'#64748b'": "'var(--text-muted)'",
  "'#a1a1aa'": "'var(--text-muted)'"
};

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
    for (const file of files) {
      const p = path.join(dir, file);
      let content = fs.readFileSync(p, 'utf8');
      
      let modified = false;
      for (const [key, val] of Object.entries(reps)) {
        if (content.includes(key)) {
          content = content.split(key).join(val);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(p, content);
        console.log(`Updated theme variables in ${file}`);
      }
    }
  }
}
