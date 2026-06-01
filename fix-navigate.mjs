import fs from 'fs';
import path from 'path';

const files = [
  'src/app/compare/[competitorId]/ComparisonPageClient.tsx',
  'src/app/resources/articles/[articleSlug]/ArticleViewerClient.tsx',
  'src/app/resources/[deckId]/PresentationViewerClient.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <Navigate to="path" /> with router.push("path") 
    // We already have useRouter() inside these components if they were migrated properly, but maybe not.
    // Let's just use window.location.href for a quick fix since it's client-side anyway.
    
    content = content.replace(/<Navigate\s+to=(['"])(.*?)\1\s*(?:replace)?\s*\/>/g, '(() => { typeof window !== "undefined" && (window.location.href = "$2"); return null; })()');
    
    // Some might not be valid JSX if they were returned directly, so let's make it a valid JSX node
    content = content.replace(/return\s+\(\(\)\s*=>\s*\{.*window\.location\.href\s*=\s*(['"].*?['"]).*\}\)\(\);/g, 'if (typeof window !== "undefined") window.location.href = $1; return null;');
    
    // Wait, replacing JSX `<Navigate>` with a function call isn't valid if it's returned.
    // e.g. `return <Navigate to="/" replace />;` -> `return (() => { typeof window !== "undefined" && (window.location.href = "/"); return null; })();`
    // Yes it is! It's an IIFE that returns null. Perfectly valid JS.
    
    // If it's a JSX node inside a tree, it would be `{(() => { ... })()}` but `<Navigate>` is usually returned directly in these files.
    
    fs.writeFileSync(file, content);
    console.log(`Fixed Navigate in ${file}`);
  }
}
