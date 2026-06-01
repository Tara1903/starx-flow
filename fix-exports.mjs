import fs from 'fs';
import path from 'path';

const fixes = [
  { file: 'src/app/about/AboutClient.tsx', old: 'export function About', new: 'export function AboutClient' },
  { file: 'src/app/product/ProductClient.tsx', old: 'export function Product', new: 'export function ProductClient' },
  { file: 'src/app/features/FeaturesClient.tsx', old: 'export function Features', new: 'export function FeaturesClient' },
  { file: 'src/app/pricing/PricingClient.tsx', old: 'export function Pricing', new: 'export function PricingClient' },
  { file: 'src/app/resources/ResourcesClient.tsx', old: 'export function Resources', new: 'export function ResourcesClient' },
  { file: 'src/app/resources/articles/[articleSlug]/ArticleViewerClient.tsx', old: 'export function ArticleViewer', new: 'export function ArticleViewerClient' },
  { file: 'src/app/resources/[deckId]/PresentationViewerClient.tsx', old: 'export function PresentationViewer', new: 'export function PresentationViewerClient' },
  { file: 'src/app/compare/[competitorId]/ComparisonPageClient.tsx', old: 'export function ComparisonPage', new: 'export function ComparisonPageClient' }
];

for (const fix of fixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf8');
    content = content.replace(fix.old, fix.new);
    fs.writeFileSync(fix.file, content);
    console.log(`Fixed ${fix.file}`);
  } else {
    console.log(`Not found: ${fix.file}`);
  }
}
