import fs from 'fs';
import path from 'path';

const pages = [
  { src: 'src/pages/Terms.tsx', dest: 'src/app/terms/page.tsx' },
  { src: 'src/pages/Privacy.tsx', dest: 'src/app/privacy/page.tsx' },
  { src: 'src/pages/Dashboard.tsx', dest: 'src/app/dashboard/page.tsx' },
  { src: 'src/pages/AdminDashboard.tsx', dest: 'src/app/admin/page.tsx' },
  { src: 'src/pages/AdminLogin.tsx', dest: 'src/app/admin/login/page.tsx' },
  { src: 'src/pages/AdminSetup.tsx', dest: 'src/app/admin/setup/page.tsx' },
  { src: 'src/pages/setup/WelcomeStep.tsx', dest: 'src/app/setup/welcome/page.tsx' },
  { src: 'src/pages/setup/AccountStep.tsx', dest: 'src/app/setup/account/page.tsx' },
  { src: 'src/pages/setup/WhatsAppStep.tsx', dest: 'src/app/setup/whatsapp/page.tsx' },
  { src: 'src/pages/setup/InstagramStep.tsx', dest: 'src/app/setup/instagram/page.tsx' },
  { src: 'src/pages/setup/SMSStep.tsx', dest: 'src/app/setup/sms/page.tsx' },
  { src: 'src/pages/setup/AIConfigStep.tsx', dest: 'src/app/setup/ai/page.tsx' },
  { src: 'src/pages/setup/TestStep.tsx', dest: 'src/app/setup/test/page.tsx' },
  { src: 'src/pages/setup/LaunchStep.tsx', dest: 'src/app/setup/launch/page.tsx' },
];

for (const { src, dest } of pages) {
  if (fs.existsSync(src)) {
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });
    
    let content = fs.readFileSync(src, 'utf8');
    
    // Add use client
    content = '"use client";\n\n' + content;
    
    // Replace react-router-dom hooks with next/navigation
    content = content.replace(/import \{.*?useNavigate.*?\} from "react-router-dom";/g, 'import { useRouter } from "next/navigation";');
    content = content.replace(/import \{.*?Link.*?\} from "react-router-dom";/g, 'import Link from "next/link";');
    content = content.replace(/import \{.*?useLocation.*?\} from "react-router-dom";/g, 'import { usePathname } from "next/navigation";');
    content = content.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
    content = content.replace(/navigate\(/g, 'router.push(');
    content = content.replace(/useLocation\(\)/g, 'usePathname()');
    
    // Fix relative imports
    // If it's going 1 level deeper (e.g. src/app/terms instead of src/pages), we change ../ to ../../
    const depthDiff = dest.split('/').length - src.split('/').length;
    if (depthDiff > 0) {
      let prefix = '';
      for(let i=0; i<depthDiff; i++) prefix += '../';
      content = content.replace(/from "\.\.\//g, `from "${prefix}../`);
      content = content.replace(/from '\.\.\//g, `from '${prefix}../`);
    }

    fs.writeFileSync(dest, content);
    fs.unlinkSync(src);
    console.log(`Migrated ${src} to ${dest}`);
  }
}

// Handle SetupLayout.tsx -> layout.tsx
if (fs.existsSync('src/pages/setup/SetupLayout.tsx')) {
  fs.mkdirSync('src/app/setup', { recursive: true });
  let content = fs.readFileSync('src/pages/setup/SetupLayout.tsx', 'utf8');
  content = '"use client";\n\n' + content;
  content = content.replace(/import \{ Outlet \} from "react-router-dom";/g, '');
  content = content.replace(/<Outlet \/>/g, '{children}');
  content = content.replace(/export function SetupLayout\(\)/g, 'export default function SetupLayout({ children }: { children: React.ReactNode })');
  
  // Fix imports
  content = content.replace(/from "\.\.\//g, 'from "../../');
  
  fs.writeFileSync('src/app/setup/layout.tsx', content);
  fs.unlinkSync('src/pages/setup/SetupLayout.tsx');
  console.log(`Migrated SetupLayout to src/app/setup/layout.tsx`);
}
