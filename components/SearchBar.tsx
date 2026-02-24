
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, History, Trash2, ArrowRight, Calendar, Sun } from 'lucide-react';
import { fetchGeocoding, callN8nWebhook } from '../services/weatherService';
import { getHistory, clearHistory } from '../services/backendSimulator';
import { SearchSuggestion } from '../types';

interface SearchBarProps {
  onSelect: (suggestion: SearchSuggestion, forecastMode: 'today' | '5day') => void;
  onUseCurrentLocation: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect, onUseCurrentLocation }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [forecastMode, setForecastMode] = useState<'today' | '5day'>('today');
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history on mount and when query changes (to show history if query is empty)
  useEffect(() => {
    setHistory(getHistory());
  }, [isOpen, query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        try {
          const results = await fetchGeocoding(query);
          setSuggestions(results);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHistory();
    setHistory([]);
  };

  // Submit: pick first suggestion or search by name
  const handleSubmit = () => {
    if (suggestions.length > 0) {
      onSelect(suggestions[0], forecastMode);
      setQuery('');
      setIsOpen(false);
    } else if (query.trim().length > 0) {
      // Direct search by name — create a suggestion with the query
      const directSuggestion: SearchSuggestion = {
        name: query.trim(),
        lat: 0,
        lon: 0,
        country: '',
      };
      onSelect(directSuggestion, forecastMode);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={containerRef}>
      {/* Forecast Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="flex p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <button
            onClick={() => setForecastMode('today')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${forecastMode === 'today'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            <Sun size={14} />
            Today
          </button>
          <button
            onClick={() => setForecastMode('5day')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${forecastMode === '5day'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            <Calendar size={14} />
            5-Day
          </button>
        </div>
      </div>

      {/* Search Input + Submit Button */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. Kochi, Mumbai)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-lg"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="absolute right-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => { onUseCurrentLocation(); setIsOpen(false); }}
            className="absolute right-4 text-blue-500 hover:text-blue-600 transition-colors"
            title="Use my location"
          >
            <MapPin size={20} />
          </button>
        </div>

        {/* Enter / Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={query.trim().length === 0 && suggestions.length === 0}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          title={`Get ${forecastMode === 'today' ? "today's" : '5-day'} weather`}
        >
          <ArrowRight size={22} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto no-scrollbar">

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div>
              {suggestions.map((s, idx) => (
                <button
                  key={`suggestion-${s.lat}-${s.lon}-${idx}`}
                  onClick={() => {
                    onSelect(s, forecastMode);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 uppercase tracking-widest">{s.country}</span>
                  </div>
                  <span className="text-sm text-slate-500">{s.state ? `${s.state}, ` : ''}{s.country}</span>
                </button>
              ))}
            </div>
          )}

          {/* History List (only if no suggestions or query is empty) */}
          {query.trim().length <= 2 && history.length > 0 && (
            <div>
              <div className="px-5 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-2 text-slate-400">
                  <History size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Recent Searches</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
              {history.map((h, idx) => (
                <button
                  key={`history-${h.lat}-${h.lon}-${idx}`}
                  onClick={() => {
                    onSelect(h, forecastMode);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                >
                  <div className="text-slate-300">
                    <Search size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{h.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{h.state ? `${h.state}, ` : ''}{h.country}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State when Focused */}
          {query.trim().length > 0 && query.trim().length <= 2 && suggestions.length === 0 && (
            <div className="px-5 py-6 text-center text-slate-400 italic text-sm">
              Keep typing to search...
            </div>
          )}

          {query.trim().length > 2 && suggestions.length === 0 && (
            <div className="px-5 py-6 text-center text-slate-400 italic text-sm">
              No matching locations found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
