import { type FC } from 'react';

export interface ComparisonData {
  competitor: string;
  title: string;
  description: string;
  heroText: string;
  starxPros: string[];
  competitorCons: string[];
  featureTable: {
    feature: string;
    starx: boolean | string;
    competitor: boolean | string;
  }[];
  verdict: string;
}

export const comparisonData: Record<string, ComparisonData> = {
  'starx-flow-vs-mindbody': {
    competitor: 'Mindbody',
    title: 'StarX Flow vs Mindbody | The Better Alternative for Local Businesses',
    description: 'See why local salons, gyms, and wellness centers are switching from Mindbody to StarX Flow for AI-powered WhatsApp bookings and zero hidden fees.',
    heroText: 'Mindbody is bloated and expensive. StarX Flow is smart, fast, and lives right in WhatsApp.',
    starxPros: [
      'Clients book natively via WhatsApp in seconds',
      'No app downloads required for your customers',
      '24/7 AI Receptionist answers questions instantly',
      'Flat pricing with zero per-transaction fees',
      'Simple, modern, fast interface'
    ],
    competitorCons: [
      'Requires clients to download the Mindbody app',
      'Complex, outdated software built in the 2000s',
      'Expensive monthly fees that scale up',
      'Hidden transaction costs and promoted listing fees',
      'No AI customer service capabilities'
    ],
    featureTable: [
      { feature: 'WhatsApp Booking', starx: true, competitor: false },
      { feature: 'AI Conversational Receptionist', starx: true, competitor: false },
      { feature: 'Client App Required', starx: false, competitor: true },
      { feature: 'Hidden Transaction Fees', starx: false, competitor: true },
      { feature: 'Calendar Sync (Google/Outlook)', starx: true, competitor: true },
      { feature: 'Automated Reminders', starx: 'Smart AI Reminders', competitor: 'Basic SMS' },
    ],
    verdict: 'If you run a modern wellness or fitness business and want to reduce friction, StarX Flow lets your clients book where they already spend their time: WhatsApp. No more forcing clients to download an app they hate.'
  },
  'starx-flow-vs-vagaro': {
    competitor: 'Vagaro',
    title: 'StarX Flow vs Vagaro | The Next-Gen Booking Alternative',
    description: 'Compare StarX Flow and Vagaro. Discover why salons and independent pros prefer StarX Flow\'s AI receptionist and seamless WhatsApp booking system.',
    heroText: 'Upgrade from Vagaro\'s basic booking to a 24/7 AI Receptionist that sells for you.',
    starxPros: [
      'Frictionless booking on WhatsApp',
      'AI understands complex scheduling requests',
      'Automatic lead recovery for missed messages',
      'Seamless multi-channel integrations',
    ],
    competitorCons: [
      'Basic web-only booking',
      'Clients must create a Vagaro account',
      'Lacks intelligent conversational AI',
      'Add-on pricing models'
    ],
    featureTable: [
      { feature: 'AI Scheduling', starx: true, competitor: false },
      { feature: 'Booking via WhatsApp', starx: true, competitor: false },
      { feature: 'Point of Sale', starx: 'Via Square/Clover', competitor: true },
      { feature: 'Client Account Required', starx: false, competitor: true },
    ],
    verdict: 'Vagaro is a solid legacy tool for salons, but StarX Flow represents the future: instant, conversational, AI-driven bookings that feel like talking to a real human.'
  },
  'starx-flow-vs-calendly': {
    competitor: 'Calendly',
    title: 'StarX Flow vs Calendly | Advanced AI Booking vs Static Links',
    description: 'Stop sending static Calendly links. Use StarX Flow to let clients chat with an AI receptionist to book appointments directly via WhatsApp or SMS.',
    heroText: 'Calendly is just a link. StarX Flow is an intelligent assistant.',
    starxPros: [
      'Conversational booking feels natural, not robotic',
      'Answers business FAQs before booking',
      'Handles rescheduling dynamically via chat',
      'Captures context and qualifies leads'
    ],
    competitorCons: [
      'Static, impersonal booking experience',
      'No ability to answer customer questions',
      'Forces users into a web browser view',
      'Requires you to manually send the link'
    ],
    featureTable: [
      { feature: 'Conversational Booking', starx: true, competitor: false },
      { feature: 'Answers FAQs', starx: true, competitor: false },
      { feature: 'Calendar Sync', starx: true, competitor: true },
      { feature: 'Meeting Links', starx: true, competitor: true },
      { feature: 'Multi-service scheduling', starx: 'Dynamic', competitor: 'Static' },
    ],
    verdict: 'Calendly is great for B2B meetings, but local service businesses need more. StarX Flow actually talks to your clients, answers their questions, and books them in.'
  }
,
  'starx-flow-vs-zapier': { competitor: 'Zapier', title: 'StarX Flow vs Zapier', description: 'Compare StarX Flow vs Zapier for AI automation.', heroText: 'Zapier connects apps, StarX Flow builds AI agents.', starxPros: ['Native AI Agents', 'Built-in Chat UI', 'No-code workflow logic'], competitorCons: ['Requires chaining many tasks', 'Expensive at scale', 'No native AI chat interface'], featureTable: [{ feature: 'AI Chat Interface', starx: true, competitor: false }, { feature: 'App Integrations', starx: '100+', competitor: '5000+' }], verdict: 'Use Zapier for simple if-this-then-that logic. Use StarX Flow for AI agents.' },
  'starx-flow-vs-make': { competitor: 'Make (Integromat)', title: 'StarX Flow vs Make', description: 'Compare StarX Flow vs Make.', heroText: 'Make is a visual builder, StarX Flow is an AI workflow platform.', starxPros: ['Native AI Agents'], competitorCons: ['Steep learning curve'], featureTable: [], verdict: 'Use StarX Flow for AI.' },
  'starx-flow-vs-n8n': { competitor: 'n8n', title: 'StarX Flow vs n8n', description: 'Compare StarX Flow vs n8n.', heroText: 'n8n is for developers, StarX Flow is for business owners.', starxPros: ['No-code'], competitorCons: ['Requires coding knowledge'], featureTable: [], verdict: 'Use StarX Flow.' },
  'starx-flow-vs-langflow': { competitor: 'Langflow', title: 'StarX Flow vs Langflow', description: 'Compare StarX Flow vs Langflow.', heroText: 'Langflow is a dev tool, StarX Flow is a business solution.', starxPros: ['Business Ready'], competitorCons: ['Requires engineering'], featureTable: [], verdict: 'Use StarX Flow.' }
};