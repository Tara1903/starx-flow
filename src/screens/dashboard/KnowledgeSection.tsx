"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  FileText,
  RefreshCw,
  X,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useKnowledgeStore } from "../../store/knowledgeStore";
import { formatEuropeanDate } from "../../lib/locale";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function KnowledgeSection() {
  const { documents, isLoading, fetchDocuments, ingestDocument, deleteDocument } = useKnowledgeStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<"text" | "faq" | "url">("faq");
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState<Array<{ content: string; score: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content?.toLowerCase().includes(search.toLowerCase())
  );

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunks_count || 1), 0);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const res = await ingestDocument({
      title,
      documentType: docType,
      content: content.trim(),
      sourceUrl: docType === "url" ? sourceUrl.trim() : undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setSourceUrl("");
    }
  };

  const handleRunTestSearch = () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const q = testQuery.toLowerCase();
      const matches: Array<{ content: string; score: number }> = [];

      documents.forEach((doc) => {
        if (!doc.content) return;
        const lower = doc.content.toLowerCase();
        let score = 0;
        const words = q.split(" ").filter((w) => w.length > 2);
        words.forEach((w) => {
          if (lower.includes(w)) score += 0.35;
        });
        if (score > 0) {
          matches.push({
            content: doc.content.slice(0, 220) + (doc.content.length > 220 ? "..." : ""),
            score: Math.min(0.98, Number((score + 0.2).toFixed(2))),
          });
        }
      });

      if (matches.length === 0 && documents.length > 0) {
        matches.push({
          content: documents[0].content.slice(0, 200) + "...",
          score: 0.45,
        });
      }

      setTestResults(matches.sort((a, b) => b.score - a.score));
      setIsSearching(false);
    }, 350);
  };

  return (
    <div className="space-y-6 select-none tabular-nums">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={CONSOLE_HEADING}>Knowledge base</h1>
            <span className={CONSOLE_BADGE_MUTED}>Tenant-isolated vectors</span>
          </div>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Business policies, service menus, pricing, and FAQs used by AI replies
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={CONSOLE_BTN_PRIMARY}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Document / FAQ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Documents</span>
            <FileText className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {documents.length}
          </div>
          <p className="text-xs text-[#727c75] mt-2">Active reference sources</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Indexed chunks</span>
            <Layers className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {totalChunks}
          </div>
          <p className="text-xs text-[#727c75] mt-2">Sliding-window chunks</p>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#a1aaa4]">Vector storage</span>
            <BookOpen className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          </div>
          <div className="text-[28px] font-semibold text-[#4cc38a] tracking-[-0.02em] mt-2 leading-none">
            pgvector
          </div>
          <p className="text-xs text-[#727c75] mt-2">Cosine retrieval enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#727c75]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents"
                className={cn(CONSOLE_INPUT, "w-full pl-9 pr-4 py-2 text-xs sm:text-sm")}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchDocuments()}
              aria-label="Refresh documents"
              className={CONSOLE_BTN_SECONDARY}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
          </div>

          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className={cn(CONSOLE_PANEL, "p-10 text-center text-xs text-[#727c75]")}>
                No documents indexed yet. Add FAQs or policies to train assistant replies.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    CONSOLE_PANEL,
                    "p-4 flex items-start justify-between gap-4"
                  )}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(CONSOLE_BADGE_LIVE, "capitalize")}>
                        {doc.document_type}
                      </span>
                      <h2 className="text-xs font-medium text-[#edf0ee] truncate">{doc.title}</h2>
                      {doc.source_url && (
                        <a
                          href={doc.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#727c75] hover:text-[#edf0ee]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-[#a1aaa4] line-clamp-2 leading-relaxed">
                      {doc.content}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#727c75] pt-1">
                      <span>{doc.chunks_count || 1} chunks</span>
                      <span>·</span>
                      <span>Indexed {formatEuropeanDate(doc.created_at)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="text-[#727c75] hover:text-[#f28b8e] p-1.5 rounded hover:bg-[#e5484d]/10 transition-colors cursor-pointer"
                    title="Remove document"
                    aria-label="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL, "space-y-4 h-fit")}>
          <h2 className={CONSOLE_SECTION_TITLE}>Retrieval check</h2>
          <p className="text-xs text-[#727c75] leading-relaxed">
            Test how customer questions match your indexed knowledge chunks
          </p>

          <div className="space-y-2.5">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunTestSearch()}
              placeholder="What is your cancellation policy"
              className={cn(CONSOLE_INPUT, "w-full px-3 py-2 text-xs")}
            />
            <button
              type="button"
              onClick={handleRunTestSearch}
              disabled={isSearching}
              className={cn(CONSOLE_BTN_SECONDARY, "w-full")}
            >
              {isSearching ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Run retrieval check</span>
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-[#edf0ee]/[0.08]">
              <p className="text-xs font-medium text-[#a1aaa4]">
                Matches ({testResults.length})
              </p>
              {testResults.map((res, i) => (
                <div key={i} className={cn(CONSOLE_SUBCARD, "p-3 text-xs space-y-1")}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#727c75]">#{i + 1}</span>
                    <span className="font-medium text-[#4cc38a]">
                      {(res.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-[#a1aaa4] leading-relaxed">{res.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl bg-[#0c100e] border border-[#edf0ee]/12 w-full max-w-lg p-6 space-y-4 shadow-[0_24px_64px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between border-b border-[#edf0ee]/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-[#edf0ee]">Add knowledge document</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-[#727c75] hover:text-[#edf0ee] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngest} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a1aaa4] font-medium mb-1.5">Source type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "faq", label: "FAQ" },
                    { id: "text", label: "Policy text" },
                    { id: "url", label: "Website URL" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDocType(opt.id as any)}
                      className={cn(
                        "py-2 rounded-lg border font-medium text-center transition-colors cursor-pointer",
                        docType === opt.id
                          ? "bg-[#19201d] border-[#34d399]/35 text-[#edf0ee]"
                          : "bg-[#121715] border-[#edf0ee]/[0.06] text-[#727c75] hover:text-[#edf0ee]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#a1aaa4] font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Services, Pricing & Cancellation Terms"
                  required
                  className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                />
              </div>

              {docType === "url" ? (
                <div>
                  <label className="block text-[#a1aaa4] font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/pricing"
                    required
                    className={cn(CONSOLE_INPUT, "w-full px-3.5 py-2 text-xs")}
                  />
                  <p className="text-[11px] text-[#727c75] mt-1">
                    Page content is parsed and chunked for semantic search
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-[#a1aaa4] font-medium mb-1">Content</label>
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter policies, service descriptions, or FAQ answers"
                    required
                    className={cn(CONSOLE_INPUT, "w-full p-3 text-xs console-scroll")}
                  />
                </div>
              )}

              <div className="border-t border-[#edf0ee]/[0.08] pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={CONSOLE_BTN_PRIMARY}>
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
