import fs from 'node:fs';
import path from 'node:path';

interface AuditFailure {
  rule: string;
  file: string;
  detail: string;
}

const ROOT = process.cwd();
const failures: AuditFailure[] = [];

function walkFiles(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

const uiFiles = [
  ...walkFiles(path.join(ROOT, 'src', 'components'), ['.ts', '.tsx']),
  ...walkFiles(path.join(ROOT, 'src', 'screens'), ['.ts', '.tsx']),
  ...walkFiles(path.join(ROOT, 'src', 'app'), ['.ts', '.tsx', '.css']),
];

const LEGACY_HEX_RE =
  /bg-\[#0c0c0c\]|bg-\[#0f0f0f\]|bg-\[#111\]|bg-\[#0a0a0a\]|bg-\[#050505\]|bg-\[#101214\]|bg-\[#141414\]|stroke-\[#0c0c0c\]/;
const HEAVY_BLUR_RE = /blur-\[(1[0-9]{2}|[2-9][0-9]{2})px\]/;

const ALLOWED_SCOPED_CURSOR_FILE = 'src/cursor/cursor.css';

for (const file of uiFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const r = rel(file);

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Rule 1: Never allow obsolete `cursor-active` or unscoped `cursor: none` outside src/cursor/cursor.css
    if (/cursor-active/.test(line) || (/cursor:\s*none/.test(line) && r !== ALLOWED_SCOPED_CURSOR_FILE)) {
      failures.push({
        rule: 'scoped-cursor-fallback-contract',
        file: `${r}:${lineNum}`,
        detail: 'Unscoped cursor: none / obsolete cursor-active detected outside src/cursor/cursor.css.',
      });
    }

    // Rule 2: Zero legacy opaque dark hex surfaces in components/screens
    if ((r.startsWith('src/components/') || r.startsWith('src/screens/')) && LEGACY_HEX_RE.test(line)) {
      failures.push({
        rule: 'unified-liquid-glass-surfaces',
        file: `${r}:${lineNum}`,
        detail: `Found legacy opaque dark hex token in line: ${line.trim()}`,
      });
    }

    // Rule 3: Zero heavy DOM gaussian blur blobs (>=100px) — use CSS radial-gradient instead
    if ((r.startsWith('src/components/') || r.startsWith('src/screens/')) && HEAVY_BLUR_RE.test(line)) {
      failures.push({
        rule: 'gpu-friendly-glow-budget',
        file: `${r}:${lineNum}`,
        detail: `Found >=100px blur blob (${line.match(HEAVY_BLUR_RE)?.[0]}). Replace with radial-gradient.`,
      });
    }

    // Rule 4: Inline React style backdropFilter must include WebkitBackdropFilter
    if (/backdropFilter\s*:/.test(line) && !/WebkitBackdropFilter/.test(content)) {
      failures.push({
        rule: 'safari-webkit-backdrop-parity',
        file: `${r}:${lineNum}`,
        detail: 'Inline style uses backdropFilter without WebkitBackdropFilter.',
      });
    }
  });
}

// Rule 5: globals.css backdrop-filter rules must pair -webkit-backdrop-filter and include focus/motion/tabular tokens
const globalsPath = path.join(ROOT, 'src', 'app', 'globals.css');
const globalsCss = fs.readFileSync(globalsPath, 'utf8');
const globalsLines = globalsCss.split(/\r?\n/);

globalsLines.forEach((line, idx) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('backdrop-filter:')) {
    const windowSlice = globalsLines
      .slice(Math.max(0, idx - 2), Math.min(globalsLines.length, idx + 3))
      .join('\n');
    if (!windowSlice.includes('-webkit-backdrop-filter:')) {
      failures.push({
        rule: 'safari-css-backdrop-parity',
        file: `src/app/globals.css:${idx + 1}`,
        detail: 'CSS rule sets backdrop-filter without adjacent -webkit-backdrop-filter.',
      });
    }
  }
});

for (const requiredToken of [':focus-visible', 'prefers-reduced-motion', '.tabular-nums', '.bg-noise-subtle']) {
  if (!globalsCss.includes(requiredToken)) {
    failures.push({
      rule: 'globals-required-tokens',
      file: 'src/app/globals.css',
      detail: `Missing required token/rule: ${requiredToken}`,
    });
  }
}

// Rule 6: Analytics components enforce tabular numeric alignment
for (const chartRel of [
  'src/components/dashboard/KPIGrid.tsx',
  'src/components/dashboard/ExecutionChart.tsx',
  'src/components/dashboard/ChannelDistribution.tsx',
]) {
  const chartPath = path.join(ROOT, chartRel);
  const chartSrc = fs.readFileSync(chartPath, 'utf8');
  if (!chartSrc.includes('tabular-nums')) {
    failures.push({
      rule: 'analytics-tabular-nums',
      file: chartRel,
      detail: 'Flagship analytics module must use tabular-nums for numeric alignment.',
    });
  }
}

// Rule 7: Mobile safe-area + OTP accessibility contracts
const modalSrc = fs.readFileSync(path.join(ROOT, 'src/components/ui/GlassModal.tsx'), 'utf8');
if (!modalSrc.includes('90dvh') || !modalSrc.includes('safe-area-inset-bottom')) {
  failures.push({
    rule: 'mobile-modal-safe-area',
    file: 'src/components/ui/GlassModal.tsx',
    detail: 'GlassModal must enforce dynamic viewport height (90dvh) and safe-area-inset-bottom padding.',
  });
}

const otpSrc = fs.readFileSync(path.join(ROOT, 'src/components/ui/OTPInput.tsx'), 'utf8');
if (!otpSrc.includes('aria-describedby') || !otpSrc.includes('aria-live')) {
  failures.push({
    rule: 'otp-a11y-contract',
    file: 'src/components/ui/OTPInput.tsx',
    detail: 'OTPInput must provide aria-describedby guidance and aria-live feedback.',
  });
}

console.log(`Audited ${uiFiles.length} UI source files for design, motion, Safari parity, and accessibility consistency.`);

if (failures.length > 0) {
  console.error(`\n[FAIL] Design consistency audit found ${failures.length} issue(s):\n`);
  for (const f of failures) {
    console.error(` - [${f.rule}] ${f.file}: ${f.detail}`);
  }
  process.exit(1);
}

console.log('[PASS] All design consistency checks passed (0 violations).');
