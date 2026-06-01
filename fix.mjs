import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
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

    // React Router Dom fixes
    content = content.replace(/import \{([^}]*?)\} from ['"]react-router-dom['"];?/g, (match, imports) => {
      let nextNav = [];
      let nextLink = [];
      
      if (imports.includes('useNavigate')) nextNav.push('useRouter');
      if (imports.includes('useLocation')) nextNav.push('usePathname');
      if (imports.includes('useParams')) nextNav.push('useParams');
      
      if (imports.includes('Link')) nextLink.push('Link');
      if (imports.includes('NavLink')) nextLink.push('Link');

      let res = '';
      if (nextNav.length > 0) res += `import { ${nextNav.join(', ')} } from 'next/navigation';\n`;
      if (nextLink.length > 0) res += `import ${nextLink[0]} from 'next/link';\n`;
      return res;
    });

    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
    content = content.replace(/useLocation\(\)/g, 'usePathname()');
    content = content.replace(/\bnavigate\(/g, 'router.push(');
    content = content.replace(/<NavLink/g, '<Link');
    content = content.replace(/<\/NavLink>/g, '</Link>');

    // Helmet / SEO fixes - Just mock them if used in client
    content = content.replace(/import \{ Helmet \} from ['"]react-helmet-async['"];?/g, '');
    content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
    content = content.replace(/<SEO[^>]*\/>/g, '');

    // Replace react-helmet-async entirely
    content = content.replace(/import .*?react-helmet-async.*?;/g, '');

    if (content !== original) {
      if(!content.includes('"use client"') && !content.includes("'use client'")) {
        // If it uses hooks, make it a client component
        if(content.includes('useRouter') || content.includes('usePathname') || content.includes('useParams')) {
          content = '"use client";\n\n' + content;
        }
      }
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
