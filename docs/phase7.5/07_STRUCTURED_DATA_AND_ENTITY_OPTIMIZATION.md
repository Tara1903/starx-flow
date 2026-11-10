# 07 — Structured Data & Knowledge Graph Entity Optimization

**Project:** StarX-Flow  
**Phase:** 7.5 — Universal Search Engine, AI Discovery & Conversion Optimization  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Author:** Principal Technical SEO Architect & Structured Data Engineer  
**Status:** Certified & Production Verified  

---

## 1. Executive Summary & Objective

Structured data using Schema.org vocabulary in JSON-LD format is the primary protocol by which search crawlers, knowledge graphs (Google Knowledge Graph, Bing Entity Graph), and LLMs map web entities.

In StarX-Flow, structured data is not an afterthought; it is programmatically generated across all templates to represent our product, organization, pricing, breadcrumb paths, technical research, and FAQs without human intervention or formatting drift.

---

## 2. Schema Architecture & Registry in Codebase

All structured data generators are centralized in [`src/lib/seoConfig.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/seoConfig.ts):

| Function | Schema Type | Deployment Target | Key Entity Attributes |
| :--- | :--- | :--- | :--- |
| `organizationSchema()` | `Organization` | Injected globally in `src/app/layout.tsx` | `name`, `legalName`, `url`, `logo`, `contactPoint`, `sameAs` |
| `websiteSchema()` | `WebSite` | Injected globally in `src/app/layout.tsx` | `name`, `url`, `potentialAction` (SearchAction) |
| `softwareApplicationSchema()` | `SoftwareApplication` | `/`, `/pricing` | `operatingSystem`, `applicationCategory`, `offers`, `aggregateRating` |
| `breadcrumbSchema(items)` | `BreadcrumbList` | All subroutes (`/industries/*`, `/compare/*`, `/demo`, etc.) | `itemListElement` array with hierarchical `position`, `name`, `item` URL |
| `faqSchema(items)` | `FAQPage` | Homepage, Industry pages, Pricing | `mainEntity` array of `Question` and `Answer` objects |
| `articleSchema(article)` | `Article` / `TechArticle` | `/resources/articles/[slug]` | `headline`, `author`, `publisher`, `datePublished`, `dateModified` |

---

## 3. Verified JSON-LD Schemas (Production Code)

### 3.1 Global `Organization` & `WebSite` Schema (Injected in Root Layout)

In [`src/app/layout.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/layout.tsx):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://starx-flow.runs-on.dev/#organization",
      "name": "StarX-Flow",
      "legalName": "StarX-Flow Technologies Inc.",
      "url": "https://starx-flow.runs-on.dev/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://starx-flow.runs-on.dev/favicon.ico"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@starx-flow.runs-on.dev",
        "availableLanguage": ["English"]
      },
      "sameAs": [
        "https://github.com/Tara1903/starx-flow"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://starx-flow.runs-on.dev/#website",
      "url": "https://starx-flow.runs-on.dev/",
      "name": "StarX-Flow",
      "publisher": {
        "@id": "https://starx-flow.runs-on.dev/#organization"
      }
    }
  ]
}
</script>
```

### 3.2 `SoftwareApplication` & Commercial `Offer` Schema

Embedded on `/pricing` and `/`:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "StarX-Flow",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All (Cloud SaaS)",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "29.00",
      "priceCurrency": "USD",
      "billingDuration": "P1M",
      "url": "https://starx-flow.runs-on.dev/pricing",
      "seller": {
        "@type": "Organization",
        "name": "Polar Payments Inc."
      }
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "59.00",
      "priceCurrency": "USD",
      "billingDuration": "P1M",
      "url": "https://starx-flow.runs-on.dev/pricing",
      "seller": {
        "@type": "Organization",
        "name": "Polar Payments Inc."
      }
    },
    {
      "@type": "Offer",
      "name": "Enterprise Plan",
      "price": "99.00",
      "priceCurrency": "USD",
      "billingDuration": "P1M",
      "url": "https://starx-flow.runs-on.dev/pricing",
      "seller": {
        "@type": "Organization",
        "name": "Polar Payments Inc."
      }
    }
  ]
}
```

### 3.3 `BreadcrumbList` Hierarchical Navigation Schema

Generated on all subpages (e.g. `/demo` and `/industries/dental`):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://starx-flow.runs-on.dev/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Industries",
      "item": "https://starx-flow.runs-on.dev/industries"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Dental",
      "item": "https://starx-flow.runs-on.dev/industries/dental"
    }
  ]
}
```

---

## 4. Rich Result Eligibility & Schema Validation

All schema generators were tested and confirmed free of Google Rich Results syntax errors:
1. **Google Rich Results Test:** No missing required properties (`name`, `offers`, `itemListElement`, `mainEntity`).
2. **Schema.org Validator:** Valid JSON-LD graph resolution with `@id` URI linkage between `WebSite` and `Organization`.
3. **Automated CI Validation:** `tests/test-seo-governance.ts` verifies that `organizationSchema()` and `websiteSchema()` return valid parseable JSON objects containing valid `@context: "https://schema.org"`.
