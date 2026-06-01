import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src/app', (filePath) => {
  if (filePath.endsWith('page.tsx') || filePath.endsWith('layout.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find named exports of functions that match the component name
    // like `export function AdminLogin() {`
    // and replace with `export default function AdminLogin() {`
    // but only if it's the main component of the file (usually the one matching the filename or route)
    // Actually, just replace `export function ` with `export default function ` if `export default` is missing
    
    if (!content.includes('export default function') && !content.includes('export default class')) {
      content = content.replace(/export function\s+([A-Za-z0-9_]+)\s*\(/, 'export default function $1(');
      fs.writeFileSync(filePath, content);
      console.log('Fixed default export in', filePath);
    }
  }
});
