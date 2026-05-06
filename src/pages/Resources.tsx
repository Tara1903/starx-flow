import React from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, PlayCircle, Download } from "lucide-react";

export default function Resources() {
  const articles = [
    {
      title: "How to reduce delivery platform commissions",
      category: "Guide",
      readTime: "5 min read",
      desc: "Learn actionable strategies to shift your customer base from expensive marketplaces to your direct channel.",
    },
    {
      title: "How to get repeat customers without ads",
      category: "Strategy",
      readTime: "7 min read",
      desc: "Discover how to build a loyalty loop using zero-party data and direct communication tools like WhatsApp.",
    },
    {
      title: "Why direct customers matter",
      category: "Industry Insights",
      readTime: "4 min read",
      desc: "An analytical breakdown of the lifetime value differences between marketplace renters and direct customers.",
    },
    {
      title: "Optimizing your checkout flow",
      category: "Productivity",
      readTime: "6 min read",
      desc: "Small tweaks to your digital storefront that can increase conversion rates by up to 15%.",
    },
    {
      title: "SEO for local delivery businesses",
      category: "Marketing",
      readTime: "8 min read",
      desc: "A step-by-step guide on ranking your direct ordering site above third-party aggregators on Google.",
    },
    {
      title: "The future of omnichannel ordering",
      category: "Industry Insights",
      readTime: "5 min read",
      desc: "How the landscape of digital ordering is shifting away from monopolies towards independent brands.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[400px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/5 pb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
            >
              Knowledge Base
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
            >
              Resources to grow <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
                your business.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-zinc-400 leading-relaxed"
            >
              Insights, guides, and strategies to help you build a profitable
              direct-to-consumer operation.
            </motion.p>
          </div>

          {/* Newsletter Signup (Dummy) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-auto bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col gap-4 min-w-[320px]"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-lg">Weekly insights</h3>
              <p className="text-zinc-500 text-sm">
                Join 10,000+ business owners.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button className="bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>

        {/* Featured Video / Content */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8">
            Featured Webinar
          </h2>
          <div className="group cursor-pointer relative rounded-3xl overflow-hidden bg-[#0c0c0c] border border-white/10 aspect-video md:aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent opacity-50 z-0" />
            <div className="absolute inset-0 bg-black/40 z-10" />

            <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-12">
              <div className="flex gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  Webinar
                </span>
              </div>

              <div className="max-w-2xl">
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors">
                  Mastering Direct Channels in 2026: Strategies for Independence
                </h3>
                <div className="flex items-center gap-4 text-zinc-300 mb-6">
                  <span className="flex items-center gap-2">
                    <PlayCircle size={16} /> 45 minutes
                  </span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>With Sarah Jenkins, CEO of StarX Flow</span>
                </div>
              </div>
            </div>

            <div className="absolute right-12 bottom-12 z-20 w-16 h-16 rounded-full bg-emerald-500 text-black flex flex-col items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <PlayCircle size={24} className="ml-1" />
            </div>
          </div>
        </div>

        {/* Ebooks / Downloads */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-white mb-8">
            Free Templates & Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "The Direct-to-Consumer Transition Checklist",
                desc: "A 30-day checklist detailing the exact steps to transition off third-party platforms.",
              },
              {
                title: "WhatsApp Marketing Templates for Restaurants",
                desc: "10 proven message templates to re-engage past customers and boost loyalty.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:border-emerald-500/30 transition-colors group cursor-pointer"
              >
                <div className="w-24 h-32 bg-gradient-to-br from-zinc-800 to-black border border-white/5 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/20 blur-[10px]" />
                  <BookOpen size={24} className="text-zinc-500" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4">{item.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                    <Download size={16} /> Download PDF
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Articles */}
        <h2 className="text-2xl font-bold text-white mb-8">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer flex flex-col"
            >
              <div className="w-full h-56 bg-[#0c0c0c] rounded-2xl mb-6 relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent group-hover:from-emerald-900/30 transition-all duration-500" />
                <BookOpen
                  size={32}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-sm">
                  {article.category}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {article.readTime}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-300 transition-colors">
                {article.title}
              </h3>
              <p className="text-zinc-400 mb-6 flex-1 text-sm">
                {article.desc}
              </p>

              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm group-hover:gap-3 transition-all mt-auto">
                Read article <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
