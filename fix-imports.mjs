import fs from 'fs';

// 1. Fix Hero.tsx
const heroPath = 'src/components/Hero.tsx';
let heroContent = fs.readFileSync(heroPath, 'utf8');
if (!heroContent.includes('"use client"')) {
  heroContent = '"use client";\n\n' + heroContent;
  fs.writeFileSync(heroPath, heroContent);
}

// 2. Fix ComparisonPageClient.tsx
const comparePath = 'src/app/compare/[competitorId]/ComparisonPageClient.tsx';
let compareContent = fs.readFileSync(comparePath, 'utf8');
compareContent = compareContent.replace(/import \{ Navbar \} from '.*';/, "import { Navbar } from '@/components/Navbar';");
compareContent = compareContent.replace(/import \{ Footer \} from '.*';/, "import { Footer } from '@/components/Footer';");
compareContent = compareContent.replace(/import \{ useUIStore \} from '.*';/, "import { useUIStore } from '@/store/uiStore';");
fs.writeFileSync(comparePath, compareContent);

// 3. Fix PricingClient.tsx
const pricingPath = 'src/app/pricing/PricingClient.tsx';
let pricingContent = fs.readFileSync(pricingPath, 'utf8');
pricingContent = pricingContent.replace(/import \{ SEO \} from '.*?';/g, '');
pricingContent = pricingContent.replace(/<SEO[^>]*\/>/g, '');
fs.writeFileSync(pricingPath, pricingContent);
