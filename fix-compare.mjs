import fs from 'fs';

const p = 'src/app/compare/[competitorId]/comparisonData.ts';
let code = fs.readFileSync(p, 'utf8');
code = code.replace(/mindbody:/, "'starx-flow-vs-mindbody':");
code = code.replace(/vagaro:/, "'starx-flow-vs-vagaro':");
code = code.replace(/calendly:/, "'starx-flow-vs-calendly':");

const append = `
  'starx-flow-vs-zapier': { competitor: 'Zapier', title: 'StarX Flow vs Zapier', description: 'Compare StarX Flow vs Zapier for AI automation.', heroText: 'Zapier connects apps, StarX Flow builds AI agents.', starxPros: ['Native AI Agents', 'Built-in Chat UI', 'No-code workflow logic'], competitorCons: ['Requires chaining many tasks', 'Expensive at scale', 'No native AI chat interface'], featureTable: [{ feature: 'AI Chat Interface', starx: true, competitor: false }, { feature: 'App Integrations', starx: '100+', competitor: '5000+' }], verdict: 'Use Zapier for simple if-this-then-that logic. Use StarX Flow for AI agents.' },
  'starx-flow-vs-make': { competitor: 'Make (Integromat)', title: 'StarX Flow vs Make', description: 'Compare StarX Flow vs Make.', heroText: 'Make is a visual builder, StarX Flow is an AI workflow platform.', starxPros: ['Native AI Agents'], competitorCons: ['Steep learning curve'], featureTable: [], verdict: 'Use StarX Flow for AI.' },
  'starx-flow-vs-n8n': { competitor: 'n8n', title: 'StarX Flow vs n8n', description: 'Compare StarX Flow vs n8n.', heroText: 'n8n is for developers, StarX Flow is for business owners.', starxPros: ['No-code'], competitorCons: ['Requires coding knowledge'], featureTable: [], verdict: 'Use StarX Flow.' },
  'starx-flow-vs-langflow': { competitor: 'Langflow', title: 'StarX Flow vs Langflow', description: 'Compare StarX Flow vs Langflow.', heroText: 'Langflow is a dev tool, StarX Flow is a business solution.', starxPros: ['Business Ready'], competitorCons: ['Requires engineering'], featureTable: [], verdict: 'Use StarX Flow.' }
};`;

code = code.replace(/\};\s*$/, ',' + append);
fs.writeFileSync(p, code);
