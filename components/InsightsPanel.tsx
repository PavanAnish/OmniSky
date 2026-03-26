
import React, { useMemo } from 'react';
import { Sparkles, Quote, CalendarDays } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InsightsPanelProps {
  insight: string;
}

interface ParsedSection {
  icon: string;
  label: string;
  value: string;
}

/**
 * Clean markdown symbols for simpler presentation in Today mode
 */
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-–—]\s*/, '')
    .trim();
};

/**
 * Format markdown text with bold and italic support for Today mode
 */
const FormatText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-slate-700 dark:text-slate-200">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

/**
 * Extract metrics if the AI returns a continuous blob instead of lines
 */
const normalizeTextBlob = (text: string) => {
  return text.replace(/(?<!\n)(🌡️|💧|🌬️|💨|🔭|👁️|⚖️|🔵|⏰|🌅|🌇|🌞|🌤️|⛅|🌦️|🌧️|🌩️|❄️|🌈|☀️)/gi, '\n$1');
};

const parseTodayForecast = (text: string) => {
  let cleaned = text.replace(/^["']|["']$/g, '').trim();
  cleaned = normalizeTextBlob(cleaned);
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

  let title = '';
  const sections: ParsedSection[] = [];
  const summaryParts: string[] = [];

  const metricPatterns = [
    { pattern: /^(?:🌡️|temperature|temp)[:\s*-]*(.+)/i, icon: '🌡️', label: 'Temperature' },
    { pattern: /^(?:💧|humidity)[:\s*-]*(.+)/i, icon: '💧', label: 'Humidity' },
    { pattern: /^(?:🌬️|💨|wind)[:\s*-]*(.+)/i, icon: '🌬️', label: 'Wind' },
    { pattern: /^(?:🔭|👁️|visibility)[:\s*-]*(.+)/i, icon: '🔭', label: 'Visibility' },
    { pattern: /^(?:⚖️|🔵|pressure|atmospheric)[:\s*-]*(.+)/i, icon: '⚖️', label: 'Pressure' },
    { pattern: /^(?:⏰|🌅|sunrise)[:\s*-]*(.+?)(?:,|\s*while|\s*and|$)/i, icon: '🌅', label: 'Sunrise' },
    { pattern: /^(?:🌇|sunset)[:\s*-]*(.+)/i, icon: '🌇', label: 'Sunset' },
  ];

  for (let line of lines) {
    if (!title && (line.startsWith('**') || line.startsWith('#') || /^[🌞🌤️⛅🌦️🌧️🌩️❄️🌈☀️]/.test(line))) {
      const sentenceMatch = line.match(/^([^\.]+\.?)/);
      title = sentenceMatch ? cleanMarkdown(sentenceMatch[1]) : cleanMarkdown(line);
      if (sentenceMatch && line.length > sentenceMatch[1].length) {
        summaryParts.push(line.substring(sentenceMatch[1].length).trim());
      }
      continue;
    }

    let matched = false;
    for (const mp of metricPatterns) {
      const match = line.match(mp.pattern);
      if (match) {
        const val = match[1].split(/(?=\s[🌡️💧🌬️💨🔭👁️⚖️🔵⏰🌅🌇])/)[0].trim();
        sections.push({ icon: mp.icon, label: mp.label, value: cleanMarkdown(val.replace(/\.$/, '')) });
        
        const leftover = match[1].substring(val.length).trim();
        if (leftover) summaryParts.push(leftover);
        
        matched = true;
        break;
      }
    }

    if (!matched && title) {
      summaryParts.push(line);
    }
  }

  return { 
    title: title || 'Weather Report', 
    sections, 
    summary: sections.length === 0 ? text : summaryParts.join(' ') 
  };
};

const BentoMetric: React.FC<{ section: ParsedSection; index: number }> = ({ section, index }) => (
  <div
    className="group flex flex-col justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 hover:bg-white/90 dark:hover:bg-slate-800/90 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${index * 0.05}s` }}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-lg transform group-hover:scale-110 transition-transform">
        {section.icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {section.label}
      </span>
    </div>
    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
      <FormatText text={section.value} />
    </p>
  </div>
);

// Custom Markdown Components for the 5-Day report
const MarkdownComponents = {
  h1: ({node, ...props}: any) => <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tight first:mt-0" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4 tracking-tight" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-6 mb-3" {...props} />,
  p: ({node, ...props}: any) => <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal list-inside space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />,
  li: ({node, ...props}: any) => <li className="leading-relaxed" {...props} />,
  strong: ({node, ...props}: any) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
  em: ({node, ...props}: any) => <em className="italic text-slate-600 dark:text-slate-400" {...props} />,
  blockquote: ({node, ...props}: any) => (
    <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 my-6 text-slate-600 dark:text-slate-400 italic bg-blue-50/30 dark:bg-slate-800/30 rounded-r-xl" {...props} />
  ),
  table: ({node, ...props}: any) => (
    <div className="w-full overflow-x-auto mb-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  ),
  thead: ({node, ...props}: any) => <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white/50 dark:bg-slate-900/50" {...props} />,
  tr: ({node, ...props}: any) => <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors" {...props} />,
  th: ({node, ...props}: any) => <th className="px-4 py-3 font-semibold" {...props} />,
  td: ({node, ...props}: any) => <td className="px-4 py-3 text-slate-700 dark:text-slate-300" {...props} />,
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insight }) => {
  if (!insight) return null;

  // Determine if this is a 5-day forecast (AI output has a table or explicitly says "AI Predictions" or "Day 1")
  const isDayForecast = /📅\s*Day\s*\d|Day\s*\d:|AI\s*Predictions?|\bDay 1\b|\|.*\|/i.test(insight);

  // Parse for Today mode
  const parsedToday = useMemo(() => isDayForecast ? null : parseTodayForecast(insight), [insight, isDayForecast]);

  return (
    <div className="reveal-item w-full" style={{ animationDelay: '0.1s' }}>
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900/50 dark:to-slate-800/50 border border-white/40 dark:border-slate-700/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-indigo-500/5">
        
        {/* Header Ribbon */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200/50 dark:border-slate-700/50 pb-5">
          <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white shrink-0 shadow-lg ${isDayForecast ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/30'}`}>
            {isDayForecast ? <CalendarDays size={24} className="animate-pulse" /> : <Sparkles size={24} className="animate-pulse" />}
          </div>
          <div>
            <h4 className={`font-black text-[10px] uppercase tracking-[0.3em] mb-1 ${isDayForecast ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              OmniSky AI Analysis
            </h4>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isDayForecast ? 'Extended 5-Day Outlook' : parsedToday?.title || 'Current Weather Report'}
            </h2>
          </div>
        </div>

        {/* --- Today Mode Layout --- */}
        {!isDayForecast && parsedToday && (
          <div className="flex flex-col gap-6">
            
            {/* Context / Narrative Bubble */}
            {parsedToday.summary && (
              <div className="relative bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 md:p-8 border border-white/50 dark:border-slate-700/50 shadow-sm">
                <div className="absolute top-6 left-6 text-blue-200 dark:text-slate-700/50">
                  <Quote size={48} className="rotate-180" />
                </div>
                <p className="relative z-10 text-base md:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  <FormatText text={parsedToday.summary} />
                </p>
              </div>
            )}

            {/* Metrics Bento Grid */}
            {parsedToday.sections.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {parsedToday.sections.map((section, i) => (
                  <BentoMetric key={`${section.label}-${i}`} section={section} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 5-Day Mode Layout (Markdown View) --- */}
        {isDayForecast && (
          <div className="bg-white/70 dark:bg-slate-800/40 rounded-3xl p-6 md:p-8 border border-white/50 dark:border-slate-700/50 shadow-sm">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {insight.replace(/^["']|["']$/g, '').trim()}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 dark:text-slate-600 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full">
            Powered by Groq AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
