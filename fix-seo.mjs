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
    
    content = content.replace(/import\s+\{\s*SEO\s*\}\s+from\s+['"].*?['"];?/g, '');
    content = content.replace(/<SEO[^>]*\/>/g, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed SEO in', filePath);
    }
  }
});
