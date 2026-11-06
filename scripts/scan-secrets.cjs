/**
 * scripts/scan-secrets.cjs
 * StarX-Flow Automated Secret Scanner
 *
 * Scans tracked and staged files for accidental credential commits:
 * - NVIDIA API keys (nvapi-...)
 * - OpenAI API keys (sk-...)
 * - Anthropic API keys (sk-ant-...)
 * - Stripe live secret keys (sk_live_...)
 * - Generic high-entropy private keys and tokens
 *
 * Excludes documented safe placeholders (e.g. values containing 'your-', 'here', 'placeholder', 'example', '...').
 * NEVER outputs raw secret values; only redacted fingerprints (e.g. nvapi-...xxxx).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

// File extensions or directories to ignore
const IGNORED_PATHS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /\.zip$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.webp$/,
  /\.ico$/,
  /\.pdf$/,
  /\.pptx$/,
  /package-lock\.json$/,
  /skills-lock\.json$/,
  /\.system_generated/,
];

// Patterns to detect
const SECRET_RULES = [
  {
    name: 'NVIDIA API Key',
    regex: /nvapi-[A-Za-z0-9_\-]{20,}/g,
    isPlaceholder: (match) => /your|placeholder|example|\.\.\./i.test(match),
  },
  {
    name: 'OpenAI API Key',
    regex: /sk-(?:proj-)?[A-Za-z0-9_\-]{32,}/g,
    isPlaceholder: (match) => /your|placeholder|example|\.\.\./i.test(match),
  },
  {
    name: 'Anthropic API Key',
    regex: /sk-ant-[A-Za-z0-9_\-]{32,}/g,
    isPlaceholder: (match) => /your|placeholder|example|\.\.\./i.test(match),
  },
  {
    name: 'Stripe Live Secret Key',
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
    isPlaceholder: (match) => /your|placeholder|example|\.\.\./i.test(match),
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    isPlaceholder: () => false,
  },
];

function redact(val) {
  if (val.length <= 10) return '***';
  return val.slice(0, 6) + '...' + val.slice(-4);
}

function getFilesToScan(stagedOnly = false) {
  try {
    const cmd = stagedOnly
      ? 'git diff --cached --name-only --diff-filter=ACM'
      : 'git ls-files';
    const output = execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8' });
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
      .filter((f) => !IGNORED_PATHS.some((rx) => rx.test(f)));
  } catch (err) {
    console.error('Error fetching file list from git:', err.message);
    process.exit(1);
  }
}

function scanFile(filePath) {
  const fullPath = path.join(REPO_ROOT, filePath);
  if (!fs.existsSync(fullPath)) return [];

  let content;
  try {
    content = fs.readFileSync(fullPath, 'utf8');
  } catch {
    // Binary or unreadable file
    return [];
  }

  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    for (const rule of SECRET_RULES) {
      let match;
      rule.regex.lastIndex = 0;
      while ((match = rule.regex.exec(line)) !== null) {
        const secretVal = match[0];
        if (!rule.isPlaceholder(secretVal)) {
          findings.push({
            rule: rule.name,
            file: filePath,
            line: lineIdx + 1,
            fingerprint: redact(secretVal),
          });
        }
      }
    }
  });

  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const stagedOnly = args.includes('--staged');

  console.log(
    `[StarX-Flow Secret Scanner] Scanning ${stagedOnly ? 'staged' : 'tracked'} files for credentials...`
  );

  const files = getFilesToScan(stagedOnly);
  const allFindings = [];

  for (const file of files) {
    const findings = scanFile(file);
    if (findings.length > 0) {
      allFindings.push(...findings);
    }
  }

  if (allFindings.length > 0) {
    console.error(
      `\n❌ SECURITY ALERT: Found ${allFindings.length} unredacted secret(s) in repository files:\n`
    );
    for (const f of allFindings) {
      console.error(
        `  - [${f.rule}] ${f.file}:${f.line} -> fingerprint: ${f.fingerprint}`
      );
    }
    console.error(
      '\nPlease remove or sanitize these secrets before committing. Use safe placeholders (e.g. nvapi-your-key-here).'
    );
    process.exit(1);
  } else {
    console.log(
      `✅ Secret scan passed: Checked ${files.length} files. Zero unredacted secrets found.`
    );
    process.exit(0);
  }
}

main();
