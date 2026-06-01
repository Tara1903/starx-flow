import fs from 'fs';
const files = [
  'src/components/CookieConsent.tsx',
  'src/components/CustomCursor.tsx',
  'src/components/dashboard/ActivityFeed.tsx',
  'src/components/dashboard/CreateWorkflowWizard.tsx',
  'src/components/dashboard/SmartNudge.tsx',
  'src/components/Demo.tsx',
  'src/components/IntegrationModal.tsx',
  'src/components/setup/SetupHelp.tsx',
  'src/components/SignupModal.tsx',
  'src/components/ui/GlassButton.tsx',
  'src/components/ui/GlassChip.tsx',
  'src/components/ui/GlassPanel.tsx',
  'src/components/ui/GlassSheet.tsx',
  'src/lib/motionVariants.ts',
  'src/screens/dashboard/AgentsSection.tsx',
  'src/screens/dashboard/DashboardLayout.tsx'
];
for(const p of files) {
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    if (!c.includes('use client')) {
      fs.writeFileSync(p, '"use client";\n' + c);
    }
  }
}
