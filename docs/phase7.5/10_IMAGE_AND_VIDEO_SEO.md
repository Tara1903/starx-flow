# 10 — Image & Video SEO Optimization

**Project:** StarX-Flow  
**Phase:** 7.5 — Universal Search Engine, AI Discovery & Conversion Optimization  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Author:** Principal Technical SEO Architect & Multimedia Performance Engineer  
**Status:** Certified & Production Verified  

---

## 1. Executive Summary & Objective

Visual assets and media representations significantly impact search engine discovery (Google Images, Google Discover), social snippet generation (OpenGraph, Twitter Cards), and Web Performance (Cumulative Layout Shift, Largest Contentful Paint).

This document establishes the media SEO standards, dimension requirements, file formats, and semantic markup enforced across StarX-Flow.

---

## 2. Image Optimization & Next.js Standards

All images in StarX-Flow utilize the Next.js `next/image` component or optimized inline vector graphics (`SVG`):

### 2.1 Technical Image Governance Rules
1. **Next-Gen Image Formats:** Automatic generation of modern AVIF and WebP variants with fallback to optimized PNG/JPEG via Next.js image optimization.
2. **Explicit Dimensions (`width` and `height`):** Every image element declares explicit width and height attributes (or uses `fill` inside an aspect-ratio-constrained container) to prevent Cumulative Layout Shift (CLS score < 0.05).
3. **Lazy Loading by Default:** All below-the-fold media uses browser-native `loading="lazy"`. Above-the-fold hero elements specify `priority={true}` to accelerate Largest Contentful Paint (LCP < 1.8s).
4. **Context-Rich Alt Text:** No decorative images receive blank alt text if they carry informational value. Meaningful descriptions describe both the entity and its operational context (e.g. `alt="StarX-Flow AI receptionist real-time dashboard displaying inbound call analytics"`).

---

## 3. Social Media OpenGraph & Twitter Card Assets

StarX-Flow provides uniform OpenGraph and Twitter Card metadata configured in `src/lib/seoConfig.ts`:

```typescript
openGraph: {
  type: 'website',
  url: 'https://starx-flow.runs-on.dev/',
  siteName: 'StarX-Flow',
  images: [
    {
      url: 'https://starx-flow.runs-on.dev/favicon.ico', // Global verified fallback
      width: 1200,
      height: 630,
      alt: 'StarX-Flow AI Business Automation Platform',
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  site: '@starxflow',
  creator: '@starxflow',
  images: ['https://starx-flow.runs-on.dev/favicon.ico'],
}
```

### 3.1 Dimensions & Ratio Requirements
- **Target Resolution:** 1200 × 630 pixels (1.91:1 ratio).
- **Format:** Optimized PNG / JPEG under 200 KB to guarantee instant preview loading in WhatsApp, Slack, Telegram, Twitter, and LinkedIn.

---

## 4. Interactive Sandbox & Product Demonstrations

Rather than relying on heavy uncompressed video files that bloat initial page load, StarX-Flow leverages lightweight, interactive WebGL/SVG/React sandbox components:

- **Interactive Lead Funnel Simulation:** Allows prospective customers to test real-time AI conversation flows directly in the browser with zero video streaming overhead.
- **Micro-Animations:** Pure CSS and Lucide-React SVG icons animated via Tailwind CSS transitions, ensuring 60fps performance on mobile devices without external video player dependencies.
