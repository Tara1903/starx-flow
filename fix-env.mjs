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

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace import.meta.env.VITE_... with process.env.NEXT_PUBLIC_...
    content = content.replace(/import\.meta\.env\.VITE_([A-Za-z0-9_]+)/g, 'process.env.NEXT_PUBLIC_$1');
    content = content.replace(/import\.meta\.env\.DEV/g, '(process.env.NODE_ENV === "development")');
    content = content.replace(/import\.meta\.env\.PROD/g, '(process.env.NODE_ENV === "production")');
    content = content.replace(/import\.meta\.env/g, 'process.env');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed env vars in', filePath);
    }
  }
});
