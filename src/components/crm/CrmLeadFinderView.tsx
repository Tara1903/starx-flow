'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Square,
  UserPlus,
} from 'lucide-react';
import type { CrmPipeline, CrmSequence, LeadFinderCandidate } from '@/types/crm';
import {
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_INPUT,
  CONSOLE_PANEL,
  CONSOLE_ROW,
} from '@/lib/consoleSurface';
import { cn } from '@/lib/utils';

interface CrmLeadFinderViewProps {
  results: LeadFinderCandidate[];
  loading: boolean;
  locationLabel: string | null;
  provider: string | null;
  error: string | null;
  pipelines: CrmPipeline[];
  sequences: CrmSequence[];
  onSearch: (params: {
    niche: string;
    city: string;
    country?: string;
    limit?: number;
    enrichWebsites?: boolean;
  }) => Promise<{ ok: boolean; error: string | null }>;
  onImport: (params: {
    candidates: LeadFinderCandidate[];
    pipelineId?: string;
    stageId?: string;
    defaultDealValue?: number;
    listName?: string;
    sequenceId?: string;
  }) => Promise<{ importedCount: number; skippedDuplicates: number; error: string | null }>;
}

const QUICK_NICHES = [
  'Hair Salon',
  'Dental Clinic',
  'Fitness Studio',
  'Digital Agency',
  'Real Estate',
  'Restaurant',
];

export function CrmLeadFinderView({
  results,
  loading,
  locationLabel,
  provider,
  error,
  pipelines,
  sequences,
  onSearch,
  onImport,
}: CrmLeadFinderViewProps) {
  const [niche, setNiche] = useState('Hair Salon');
  const [city, setCity] = useState('Berlin');
  const [country, setCountry] = useState('Germany');
  const [limit, setLimit] = useState(12);
  const [enrichWebsites, setEnrichWebsites] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [defaultDealValue, setDefaultDealValue] = useState(950);
  const [targetSequenceId, setTargetSequenceId] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
  const firstStageId = defaultPipeline?.stages?.[0]?.id;

  const selectableResults = useMemo(() => results.filter((r) => !r.alreadyInCrm), [results]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !city.trim()) return;
    setFeedback(null);
    setSelectedIds(new Set());
    await onSearch({
      niche: niche.trim(),
      city: city.trim(),
      country: country.trim(),
      limit,
      enrichWebsites,
    });
  };

  const toggleSelect = (externalId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === selectableResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableResults.map((r) => r.externalId)));
    }
  };

  const handleImportSelected = async () => {
    const picked = results.filter((r) => selectedIds.has(r.externalId));
    if (picked.length === 0) return;
    setImporting(true);
    setFeedback(null);

    try {
      const res = await onImport({
        candidates: picked,
        pipelineId: defaultPipeline?.id,
        stageId: firstStageId,
        defaultDealValue,
        listName: `${niche} in ${city}`,
        sequenceId: targetSequenceId || undefined,
      });

      if (res.error) {
        setFeedback(`Import failed: ${res.error}`);
      } else {
        setFeedback(
          `Imported ${res.importedCount} prospect${res.importedCount === 1 ? '' : 's'} into your pipeline` +
            (res.skippedDuplicates > 0 ? ` (${res.skippedDuplicates} already existed).` : '.')
        );
        setSelectedIds(new Set());
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar Card */}
      <form onSubmit={handleSearch} className={cn(CONSOLE_PANEL, 'space-y-4')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-[#edf0ee]">Open Lead Finder & Web Enrichment</h2>
            <p className="text-xs text-[#727c75] mt-0.5">
              Discover verified local businesses and B2B prospects from OpenStreetMap, auto-crawl websites for emails and social handles, and score ICP fit at zero extra API cost.
            </p>
          </div>
          {provider && (
            <span className={CONSOLE_BADGE_INFO}>
              Source: {provider === 'overpass' ? 'OpenStreetMap Overpass' : 'Nominatim Directory'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs text-[#a1aaa4] mb-1">Business niche / industry</label>
            <input
              type="text"
              required
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Dental Clinic, Hair Salon, Digital Agency"
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-[#a1aaa4] mb-1">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Berlin"
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-[#a1aaa4] mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Germany"
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-[#a1aaa4] mb-1">Limit</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className={cn(CONSOLE_INPUT, 'w-full px-2 py-2 text-xs cursor-pointer')}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className={cn(CONSOLE_BTN_PRIMARY, 'w-full h-[34px]')}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{loading ? 'Scanning...' : 'Find Leads'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_NICHES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNiche(preset)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] border transition-colors cursor-pointer',
                  niche === preset
                    ? 'bg-[#19201d] border-[#34d399]/40 text-[#34d399]'
                    : 'bg-[#0d1210] border-[#edf0ee]/[0.08] text-[#a1aaa4] hover:text-[#edf0ee]'
                )}
              >
                {preset}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-[#a1aaa4] cursor-pointer">
            <input
              type="checkbox"
              checked={enrichWebsites}
              onChange={(e) => setEnrichWebsites(e.target.checked)}
              className="rounded border-[#edf0ee]/20 bg-[#0d1210] accent-[#34d399]"
            />
            <span>Crawl websites for public email & social links</span>
          </label>
        </div>
      </form>

      {error && (
        <div role="alert" className="rounded-xl bg-[#e5484d]/10 border border-[#e5484d]/25 px-4 py-3 text-xs text-[#f28b8e]">
          {error}
        </div>
      )}

      {feedback && (
        <div className="rounded-xl bg-[#4cc38a]/12 border border-[#4cc38a]/25 px-4 py-3 text-xs text-[#4cc38a]">
          {feedback}
        </div>
      )}

      {/* Results & Bulk Import Bar */}
      {results.length > 0 && (
        <div className={cn(CONSOLE_PANEL, 'p-0 overflow-hidden')}>
          <div className="px-4 py-3 border-b border-[#edf0ee]/[0.08] flex flex-wrap items-center justify-between gap-3 bg-[#0c100e]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className={CONSOLE_BTN_SECONDARY}
              >
                {selectedIds.size > 0 && selectedIds.size === selectableResults.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#34d399]" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Select new ({selectableResults.length})</span>
              </button>
              <span className="text-xs text-[#a1aaa4] tabular-nums">
                {results.length} prospects found {locationLabel ? `near ${locationLabel.split(',')[0]}` : ''}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#a1aaa4]">
                <span>Deal value €</span>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={defaultDealValue}
                  onChange={(e) => setDefaultDealValue(Number(e.target.value) || 0)}
                  className={cn(CONSOLE_INPUT, 'w-20 px-2 py-1 text-xs tabular-nums')}
                />
              </div>

              {sequences.length > 0 && (
                <select
                  aria-label="Enroll into outreach sequence"
                  value={targetSequenceId}
                  onChange={(e) => setTargetSequenceId(e.target.value)}
                  className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs max-w-[200px] cursor-pointer')}
                >
                  <option value="">Import only (no sequence)</option>
                  {sequences
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        Auto-enroll: {s.name}
                      </option>
                    ))}
                </select>
              )}

              <button
                type="button"
                disabled={selectedIds.size === 0 || importing}
                onClick={handleImportSelected}
                className={CONSOLE_BTN_PRIMARY}
              >
                {importing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                <span>Import {selectedIds.size || ''} to Pipeline</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#edf0ee]/[0.06]">
            {results.map((c) => {
              const checked = selectedIds.has(c.externalId);
              return (
                <div
                  key={c.externalId}
                  className={cn(
                    CONSOLE_ROW,
                    'px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3'
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      disabled={c.alreadyInCrm}
                      onClick={() => toggleSelect(c.externalId)}
                      className="mt-0.5 text-[#a1aaa4] hover:text-[#edf0ee] disabled:opacity-40 cursor-pointer"
                    >
                      {c.alreadyInCrm || checked ? (
                        <CheckSquare className="w-4 h-4 text-[#34d399]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#edf0ee]">{c.name}</span>
                        <span
                          className={cn(
                            c.fitScore >= 70
                              ? CONSOLE_BADGE_LIVE
                              : c.fitScore >= 50
                                ? CONSOLE_BADGE_WARN
                                : CONSOLE_BADGE_MUTED
                          )}
                        >
                          <Sparkles className="w-3 h-3" />
                          Fit {c.fitScore}/100
                        </span>
                        {c.alreadyInCrm && <span className={CONSOLE_BADGE_INFO}>Already in CRM</span>}
                      </div>

                      {c.aiSummary && (
                        <p className="text-xs text-[#a1aaa4] mt-1 line-clamp-2">{c.aiSummary}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-[#727c75]">
                        {c.address && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {c.address}
                          </span>
                        )}
                        {c.phone && (
                          <span className="inline-flex items-center gap-1 text-[#a1aaa4]">
                            <Phone className="w-3 h-3 text-[#727c75]" />
                            {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="inline-flex items-center gap-1 text-[#4cc38a]">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </span>
                        )}
                        {c.instagramHandle && (
                          <span className="inline-flex items-center gap-1 text-[#a1aaa4]">
                            <Instagram className="w-3 h-3" />
                            {c.instagramHandle}
                          </span>
                        )}
                        {c.whatsappNumber && (
                          <span className="inline-flex items-center gap-1 text-[#a1aaa4]">
                            <MessageCircle className="w-3 h-3" />
                            WA Ready
                          </span>
                        )}
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#a1aaa4] hover:text-[#34d399]"
                          >
                            <Globe className="w-3 h-3" />
                            {c.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className={cn(CONSOLE_PANEL, 'py-12 text-center')}>
          <p className="text-sm font-medium text-[#edf0ee]">Search any city and business category</p>
          <p className="text-xs text-[#727c75] mt-1 max-w-md mx-auto">
            Enter a niche (e.g. Dental Clinic, Beauty Salon, Agency) and a target city above to extract verified prospects and import them directly into your CRM pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
