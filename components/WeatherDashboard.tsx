
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Moon, RefreshCw, Radio, MapPin, Zap } from 'lucide-react';
import { WeatherState, SearchSuggestion } from '../types';
import { fetchWeatherByCity } from '../services/weatherService';
import { DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY } from '../constants';
import {
  logBackendRequest,
  getCachedWeather,
  setCachedWeather,
  saveToHistory,
  getSettings,
  saveSettings
} from '../services/backendSimulator';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import ForecastSection from './ForecastSection';
import WeatherCharts from './WeatherCharts';
import InsightsPanel from './InsightsPanel';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorMessage from './ErrorMessage';

const WeatherDashboard: React.FC = () => {
  const initialSettings = getSettings();
  const [state, setState] = useState<WeatherState>({
    current: null,
    hourly: [],
    daily: [],
    loading: true,
    error: null,
    unit: initialSettings.unit || 'metric',
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
    selectedName: DEFAULT_CITY
  });
  const [insight, setInsight] = useState<string>('');
  const [forecastMode, setForecastMode] = useState<'today' | '5day'>('today');
  const [darkMode, setDarkMode] = useState(initialSettings.darkMode);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const unitRef = useRef(state.unit);
  useEffect(() => {
    unitRef.current = state.unit;
    saveSettings({ unit: state.unit, darkMode });
  }, [state.unit, darkMode]);

  /**
   * Load weather by city name — calls n8n webhook directly
   */
  const loadWeatherByName = useCallback(async (
    cityName: string,
    mode: 'today' | '5day' = 'today',
    forceUnit?: 'metric' | 'imperial',
    country?: string,
    stateLabel?: string
  ) => {
    const activeUnit = forceUnit || unitRef.current;
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      selectedName: cityName,
      unit: activeUnit
    }));

    try {
      console.info(`[DASHBOARD] Loading weather for "${cityName}" (${mode}, ${activeUnit})`);
      const result = await fetchWeatherByCity(cityName, mode, activeUnit);

      saveToHistory(cityName, 0, 0, country, stateLabel);

      setState(prev => ({
        ...prev,
        current: result.current,
        hourly: result.hourly,
        daily: result.daily,
        loading: false
      }));
      setLastUpdated(new Date());
      setInsight(result.aiText || '');
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    } finally {
      setIsLocating(false);
    }
  }, []);

  const useCurrentLocation = useCallback(() => {
    setIsLocating(true);
    setState(prev => ({ ...prev, loading: true, error: null }));

    setTimeout(() => {
      const collegeName = "Amal Jyothi College of Engineering";
      logBackendRequest('COLLEGE_LOCATION_ACCESSED', { name: collegeName });
      loadWeatherByName(collegeName, forecastMode);
    }, 1200);
  }, [loadWeatherByName, forecastMode]);

  useEffect(() => {
    loadWeatherByName(DEFAULT_CITY, 'today');
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleUnit = () => {
    const newUnit = state.unit === 'metric' ? 'imperial' : 'metric';
    unitRef.current = newUnit;
    setState(prev => ({ ...prev, unit: newUnit }));
    if (state.selectedName) {
      loadWeatherByName(state.selectedName, forecastMode, newUnit);
    }
  };

  const handleRefresh = () => {
    if (state.selectedName) {
      loadWeatherByName(state.selectedName, forecastMode);
    } else {
      useCurrentLocation();
    }
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500 relative">
      {/* Background Scanning Animation for "Use Current Location" */}
      {isLocating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm"></div>
          <div className="w-96 h-96 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-64 h-64 border-2 border-blue-400 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <Zap size={64} className="text-blue-500 animate-bounce mb-4" />
            <span className="font-black text-blue-600 uppercase tracking-[0.4em] text-sm">Targeting Campus...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto relative z-40">
        <div className="flex flex-col reveal-item" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/30 transform hover:rotate-6 transition-transform duration-500">
              S
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">OmniSky</h1>
              {lastUpdated && !state.loading && (
                <div className="flex items-center gap-2 mt-2 text-[10px] uppercase tracking-[0.3em] font-black text-blue-500 dark:text-blue-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  System Online
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-2xl flex justify-center reveal-item" style={{ animationDelay: '0.1s' }}>
          <SearchBar
            onSelect={(s, mode) => {
              setForecastMode(mode);
              loadWeatherByName(s.name, mode, undefined, s.country, s.state);
            }}
            onUseCurrentLocation={useCurrentLocation}
          />
        </div>

        <div className="flex items-center gap-4 reveal-item" style={{ animationDelay: '0.2s' }}>
          <div className="flex p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <button
              onClick={toggleUnit}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${state.unit === 'metric' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              disabled={state.loading}
            >
              °C
            </button>
            <button
              onClick={toggleUnit}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${state.unit === 'imperial' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              disabled={state.loading}
            >
              °F
            </button>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all hover:scale-110 shadow-sm"
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button
            onClick={handleRefresh}
            className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all hover:scale-110 shadow-sm group"
          >
            <RefreshCw size={22} className={`${state.loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 relative z-10">
        {state.error && <ErrorMessage message={state.error} onRetry={handleRefresh} />}

        {state.loading && !isLocating ? (
          <LoadingSkeleton />
        ) : (
          state.current && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <CurrentWeather data={state.current} unit={state.unit} />
                  <InsightsPanel insight={insight} />
                </div>
                <div className="lg:col-span-4">
                  <ForecastSection daily={state.daily} unit={state.unit} />
                </div>
              </div>

              <div className="w-full reveal-item" style={{ animationDelay: '0.4s' }}>
                <WeatherCharts hourly={state.hourly} unit={state.unit} />
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default WeatherDashboard;
