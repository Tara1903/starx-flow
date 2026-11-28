import { z } from 'zod';
import { DocumentParser } from '../rag/documentParser';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { CrmService, computeLeadScore } from './crmService';
import type { LeadFinderCandidate } from '@/types/crm';

const OsmElementSchema = z.object({
  type: z.enum(['node', 'way', 'relation']).optional(),
  id: z.union([z.number(), z.string()]),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

const OverpassResponseSchema = z.object({
  elements: z.array(OsmElementSchema).default([]),
});

const NominatimResultSchema = z.array(
  z.object({
    place_id: z.union([z.number(), z.string()]).optional(),
    display_name: z.string(),
    lat: z.string(),
    lon: z.string(),
    boundingbox: z.array(z.string()).length(4).optional(),
    extratags: z.record(z.string(), z.string()).optional(),
    namedetails: z.record(z.string(), z.string()).optional(),
  })
);

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const NICHE_OSM_FILTERS: Array<{ pattern: RegExp; clauses: string[] }> = [
  { pattern: /hair|salon|beauty|barber|spa/i, clauses: ['shop=hairdresser', 'shop=beauty', 'leisure=spa'] },
  { pattern: /dent|orthodont|clinic|medical|doctor|health/i, clauses: ['amenity=dentist', 'amenity=clinic', 'amenity=doctors', 'healthcare=dentist'] },
  { pattern: /gym|fitness|yoga|pilates|wellness/i, clauses: ['leisure=fitness_centre', 'leisure=sports_centre'] },
  { pattern: /restaur|cafe|food|bistro|bakery|coffee/i, clauses: ['amenity=restaurant', 'amenity=cafe', 'shop=bakery'] },
  { pattern: /hotel|hospitality|resort/i, clauses: ['tourism=hotel', 'tourism=guest_house'] },
  { pattern: /real estate|property|realtor/i, clauses: ['office=estate_agent'] },
  { pattern: /auto|car|garage|mechanic|repair/i, clauses: ['shop=car_repair', 'shop=car'] },
  { pattern: /plumb|hvac|electric|contract|home service/i, clauses: ['craft=plumber', 'craft=electrician', 'craft=hvac'] },
  { pattern: /law|legal|account|consult|agency|software/i, clauses: ['office=lawyer', 'office=accountant', 'office=company', 'office=it'] },
];

function buildOverpassClauses(niche: string, bbox: [number, number, number, number]): string {
  const [south, north, west, east] = bbox;
  const matched = NICHE_OSM_FILTERS.find((m) => m.pattern.test(niche));
  const safeRegex = niche.replace(/[^a-zA-Z0-9\s-]/g, '').trim();

  if (matched) {
    return matched.clauses
      .map((kv) => {
        const [k, v] = kv.split('=');
        return `nwr["${k}"="${v}"](${south},${west},${north},${east});`;
      })
      .join('\n');
  }

  const term = safeRegex || 'Business';
  return [
    `nwr["name"~"${term}",i](${south},${west},${north},${east});`,
    `nwr["shop"]["name"~"${term}",i](${south},${west},${north},${east});`,
    `nwr["office"]["name"~"${term}",i](${south},${west},${north},${east});`,
  ].join('\n');
}

function normalizeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProto);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function extractContactsFromHtml(html: string): {
  email: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
} {
  // Prefer mailto links first, then clean body emails while filtering image/asset filenames
  const mailtoMatches = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)).map(
    (m) => m[1].toLowerCase()
  );
  const genericMatches = Array.from(
    html.matchAll(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|de|eu|io|co|net|org|fr|uk|at|ch|nl|es|it|ai|dev))\b/gi)
  ).map((m) => m[1].toLowerCase());

  const badDomains = ['example.com', 'sentry.io', 'wixpress.com', 'schema.org', 'w3.org'];
  const email =
    [...mailtoMatches, ...genericMatches].find(
      (candidate) =>
        candidate.length <= 80 &&
        !candidate.endsWith('.png') &&
        !candidate.endsWith('.jpg') &&
        !badDomains.some((d) => candidate.endsWith(d))
    ) || null;

  const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]{2,30})/i);
  const blockedIgPaths = new Set(['p', 'reel', 'explore', 'accounts', 'stories', 'tv']);
  const instagramHandle = igMatch && !blockedIgPaths.has(igMatch[1].toLowerCase()) ? `@${igMatch[1]}` : null;

  const waMatch = html.match(/https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?(\+?\d{8,15})/i);
  const whatsappNumber = waMatch ? `+${waMatch[1].replace(/^\+/, '')}` : null;

  return { email, instagramHandle, whatsappNumber };
}

async function generateAiProspectBrief(params: {
  name: string;
  niche: string;
  city: string;
  websiteText: string;
}): Promise<{ summary: string; bonusScore: number } | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.includes('your-')) return null;

  try {
    const prompt = `Summarize this business in 1 concise sentence (max 24 words) for B2B sales outreach, highlighting services they offer or booking needs. Return plain JSON {"summary":"...","bonusScore":0-15}.
Business: ${params.name} (${params.niche} in ${params.city})
Website excerpt: ${params.websiteText.slice(0, 1200)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 120, responseMimeType: 'application/json' },
        }),
      }
    );
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (typeof parsed?.summary === 'string') {
      return {
        summary: parsed.summary.slice(0, 220),
        bonusScore: Math.max(0, Math.min(15, Number(parsed.bonusScore) || 8)),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export class LeadFinderService {
  /**
   * Enriches one candidate website via SSRF-safe HTML crawl + contact extraction + optional AI summary.
   */
  static async enrichCandidate(candidate: LeadFinderCandidate, nicheContext: string): Promise<LeadFinderCandidate> {
    if (!candidate.website) {
      return {
        ...candidate,
        fitScore: computeLeadScore({
          phone: candidate.phone,
          email: candidate.email,
          website: null,
          company_name: candidate.name,
        }),
      };
    }

    try {
      const fetched = await DocumentParser.fetchSafePublicHtml(candidate.website, 4200);
      const extracted = extractContactsFromHtml(fetched.html);
      const aiBrief = await generateAiProspectBrief({
        name: candidate.name,
        niche: nicheContext,
        city: candidate.city,
        websiteText: fetched.text,
      });

      const mergedEmail = candidate.email || extracted.email;
      const mergedIg = candidate.instagramHandle || extracted.instagramHandle;
      const mergedWa = candidate.whatsappNumber || extracted.whatsappNumber || candidate.phone;

      const baseScore = computeLeadScore({
        phone: candidate.phone,
        email: mergedEmail,
        website: fetched.finalUrl,
        company_name: candidate.name,
        ai_summary: aiBrief?.summary || fetched.title,
      });

      return {
        ...candidate,
        website: fetched.finalUrl,
        email: mergedEmail,
        instagramHandle: mergedIg,
        whatsappNumber: mergedWa,
        aiSummary: aiBrief?.summary || `${fetched.title} (${candidate.city})`,
        fitScore: Math.min(100, baseScore + (aiBrief?.bonusScore || 5)),
        enrichmentStatus: 'enriched',
      };
    } catch {
      return {
        ...candidate,
        enrichmentStatus: 'failed',
      };
    }
  }

  /**
   * Free public OpenStreetMap discovery + bounded SSRF-safe website enrichment.
   */
  static async searchProspects(params: {
    organizationId: string;
    niche: string;
    city: string;
    country?: string;
    limit?: number;
    enrichWebsites?: boolean;
  }): Promise<{
    candidates: LeadFinderCandidate[];
    locationLabel: string;
    provider: 'overpass' | 'nominatim';
  }> {
    const limit = Math.min(25, Math.max(1, params.limit || 12));
    const locationQuery = [params.city, params.country].filter(Boolean).join(', ');

    // 1. Resolve city bounding box via Nominatim
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(locationQuery)}&limit=1`;
    const nomController = new AbortController();
    const nomTimer = setTimeout(() => nomController.abort(), 5000);

    const nomRes = await fetch(nomUrl, {
      signal: nomController.signal,
      headers: { 'User-Agent': 'StarXFlowLeadFinder/1.0 (+https://starx-flow.runs-on.dev)' },
    });
    clearTimeout(nomTimer);

    if (!nomRes.ok) {
      throw new Error(`Location lookup unavailable (HTTP ${nomRes.status}).`);
    }

    const parsedLocation = NominatimResultSchema.parse(await nomRes.json());
    if (parsedLocation.length === 0) {
      return { candidates: [], locationLabel: locationQuery, provider: 'nominatim' };
    }

    const loc = parsedLocation[0];
    const bboxRaw = loc.boundingbox;
    let bbox: [number, number, number, number] = [
      Number(loc.lat) - 0.08,
      Number(loc.lat) + 0.08,
      Number(loc.lon) - 0.08,
      Number(loc.lon) + 0.08,
    ];
    if (bboxRaw) {
      // Clamp oversized country boxes to ~0.18 deg (~20km) around center so Overpass runs fast
      const s = Number(bboxRaw[0]);
      const n = Number(bboxRaw[1]);
      const w = Number(bboxRaw[2]);
      const e = Number(bboxRaw[3]);
      if (n - s <= 0.35 && e - w <= 0.35) {
        bbox = [s, n, w, e];
      }
    }

    // 2. Query Overpass API with failover mirrors
    const ql = `[out:json][timeout:10];(${buildOverpassClauses(params.niche, bbox)});out center tags ${limit * 2};`;
    let elements: z.infer<typeof OsmElementSchema>[] = [];
    let provider: 'overpass' | 'nominatim' = 'overpass';

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8500);
        const ovRes = await fetch(endpoint, {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'StarXFlowLeadFinder/1.0' },
          body: `data=${encodeURIComponent(ql)}`,
        });
        clearTimeout(t);
        if (!ovRes.ok) continue;
        const parsed = OverpassResponseSchema.parse(await ovRes.json());
        elements = parsed.elements;
        break;
      } catch {
        continue;
      }
    }

    // 3. Fallback to Nominatim POI search if Overpass returned nothing
    if (elements.length === 0) {
      provider = 'nominatim';
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&extratags=1&namedetails=1&q=${encodeURIComponent(
        `${params.niche} in ${locationQuery}`
      )}&limit=${limit}`;
      const fbRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'StarXFlowLeadFinder/1.0 (+https://starx-flow.runs-on.dev)' },
      }).catch(() => null);
      if (fbRes && fbRes.ok) {
        const pois = NominatimResultSchema.safeParse(await fbRes.json());
        if (pois.success) {
          elements = pois.data.map((p, idx) => ({
            id: p.place_id || idx,
            lat: Number(p.lat),
            lon: Number(p.lon),
            tags: {
              name: p.namedetails?.name || p.display_name.split(',')[0],
              ...(p.extratags || {}),
            },
          }));
        }
      }
    }

    // 4. Normalize & deduplicate prospects and cross-check existing org leads
    const existingSet = new Set<string>();
    if (isSupabaseAdminConfigured && params.organizationId) {
      const { data: existingLeads } = await supabaseAdmin
        .from('leads')
        .select('name, phone, email, website')
        .eq('organization_id', params.organizationId)
        .limit(1000);
      for (const row of existingLeads || []) {
        if (row.name) existingSet.add(row.name.trim().toLowerCase());
        if (row.email) existingSet.add(row.email.trim().toLowerCase());
        if (row.phone) existingSet.add(row.phone.replace(/\D/g, ''));
      }
    }

    const seenNames = new Set<string>();
    const rawCandidates: LeadFinderCandidate[] = [];
    for (const el of elements) {
      const tags = el.tags || {};
      const name = (tags.name || tags['brand'] || '').trim();
      if (!name || seenNames.has(name.toLowerCase())) continue;
      seenNames.add(name.toLowerCase());

      const website = normalizeUrl(tags.website || tags['contact:website'] || tags.url);
      const phone = (tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '').trim() || null;
      const email = (tags.email || tags['contact:email'] || '').trim().toLowerCase() || null;
      const instagramRaw = tags['contact:instagram'] || null;
      const instagramHandle = instagramRaw
        ? instagramRaw.startsWith('http')
          ? `@${instagramRaw.split('/').filter(Boolean).pop()}`
          : `@${instagramRaw.replace(/^@/, '')}`
        : null;

      const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
      const address = [street, tags['addr:postcode'], tags['addr:city'] || params.city].filter(Boolean).join(', ') || null;

      const inCrm =
        existingSet.has(name.toLowerCase()) ||
        Boolean(email && existingSet.has(email)) ||
        Boolean(phone && phone.replace(/\D/g, '').length >= 7 && existingSet.has(phone.replace(/\D/g, '')));

      rawCandidates.push({
        externalId: `osm:${el.type || 'node'}:${el.id}`,
        name,
        industry: params.niche,
        city: tags['addr:city'] || params.city,
        country: tags['addr:country'] || params.country || '',
        address,
        phone,
        website,
        email,
        instagramHandle,
        whatsappNumber: phone,
        aiSummary: null,
        fitScore: computeLeadScore({ phone, email, website, company_name: name }),
        enrichmentStatus: 'raw',
        lat: el.lat ?? el.center?.lat ?? null,
        lon: el.lon ?? el.center?.lon ?? null,
        alreadyInCrm: inCrm,
      });

      if (rawCandidates.length >= limit) break;
    }

    // 5. Enrich top 5 candidates with websites concurrently (bounded timeout for fast API response)
    if (params.enrichWebsites !== false) {
      const withSiteIdx = rawCandidates
        .map((c, idx) => (c.website ? idx : -1))
        .filter((idx) => idx >= 0)
        .slice(0, 5);

      await Promise.all(
        withSiteIdx.map(async (idx) => {
          rawCandidates[idx] = await this.enrichCandidate(rawCandidates[idx], params.niche);
        })
      );
    }

    rawCandidates.sort((a, b) => b.fitScore - a.fitScore);
    return {
      candidates: rawCandidates,
      locationLabel: loc.display_name,
      provider,
    };
  }

  /**
   * Saves selected Lead Finder prospects into `leads`, creates pipeline deals, and optionally saves a list snapshot.
   */
  static async importCandidates(params: {
    organizationId: string;
    userId: string;
    candidates: LeadFinderCandidate[];
    pipelineId?: string;
    stageId?: string;
    defaultDealValue?: number;
    listName?: string;
    queryMeta?: Record<string, any>;
  }): Promise<{ importedCount: number; skippedDuplicates: number; leadIds: string[] }> {
    const pipelines = await CrmService.ensureDefaultPipeline(params.organizationId);
    const defaultPipeline = pipelines.find((p) => p.id === params.pipelineId) || pipelines.find((p) => p.is_default) || pipelines[0];
    const targetStage =
      defaultPipeline?.stages?.find((s) => s.id === params.stageId) ||
      defaultPipeline?.stages?.[0];

    const dealValue = Math.max(0, Number(params.defaultDealValue || 0));
    const leadIds: string[] = [];
    let skippedDuplicates = 0;

    for (const candidate of params.candidates) {
      const idempotencyKey = `finder:${candidate.externalId}`;
      const { data: existing } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('organization_id', params.organizationId)
        .or(`idempotency_key.eq.${idempotencyKey}${candidate.email ? `,email.eq.${candidate.email}` : ''}`)
        .maybeSingle();

      if (existing) {
        skippedDuplicates++;
        continue;
      }

      const { data: createdLead, error: leadErr } = await supabaseAdmin
        .from('leads')
        .insert({
          user_id: params.userId,
          organization_id: params.organizationId,
          owner_id: params.userId,
          name: candidate.name,
          company_name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          website: candidate.website,
          city: candidate.city,
          country: candidate.country || null,
          industry: candidate.industry,
          status: 'new',
          source: 'outbound_finder',
          score: candidate.fitScore || 60,
          deal_value: dealValue,
          pipeline_id: defaultPipeline?.id || null,
          stage_id: targetStage?.id || null,
          ai_summary: candidate.aiSummary,
          tags: ['prospect', candidate.industry.toLowerCase().replace(/\s+/g, '-')],
          notes: candidate.address ? `Address: ${candidate.address}` : null,
          enrichment_data: {
            externalId: candidate.externalId,
            address: candidate.address,
            instagramHandle: candidate.instagramHandle,
            whatsappNumber: candidate.whatsappNumber,
            lat: candidate.lat,
            lon: candidate.lon,
          },
          enriched_at: candidate.enrichmentStatus === 'enriched' ? new Date().toISOString() : null,
          idempotency_key: idempotencyKey,
        })
        .select('*')
        .single();

      if (leadErr || !createdLead) {
        continue;
      }

      leadIds.push(createdLead.id);

      if (defaultPipeline && targetStage) {
        await supabaseAdmin.from('crm_deals').insert({
          organization_id: params.organizationId,
          user_id: params.userId,
          pipeline_id: defaultPipeline.id,
          stage_id: targetStage.id,
          lead_id: createdLead.id,
          owner_id: params.userId,
          title: `${candidate.name} — Outbound Opportunity`,
          value: dealValue,
          currency: 'EUR',
          probability: targetStage.probability,
          status: 'open',
          idempotency_key: `deal:${idempotencyKey}`,
        });
      }

      await CrmService.recordActivity({
        organizationId: params.organizationId,
        leadId: createdLead.id,
        actorId: params.userId,
        activityType: 'enrichment',
        title: `Imported from Open Lead Finder (${candidate.city})`,
        body: candidate.aiSummary || candidate.address || undefined,
      });
    }

    if (params.listName && leadIds.length > 0) {
      await supabaseAdmin.from('crm_lead_lists').insert({
        organization_id: params.organizationId,
        name: params.listName,
        query_params: params.queryMeta || {},
        lead_count: leadIds.length,
      });
    }

    return {
      importedCount: leadIds.length,
      skippedDuplicates,
      leadIds,
    };
  }
}
