
import React from 'react';
import { Wind, Droplets, Eye, Gauge, Info, Sun } from 'lucide-react';
import { WeatherData } from '../types';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: 'metric' | 'imperial';
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, unit }) => {
  const getIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const tempUnit = unit === 'metric' ? 'C' : 'F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  const displayLocation = data.originalName || data.city;
  const stationName = data.city;

  const getUVStatus = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  const DetailItem = ({ icon: Icon, label, value, subValue, index }: { icon: any, label: string, value: string, subValue?: string, index: number }) => (
    <div 
      className="reveal-item flex flex-col items-center p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 group shadow-sm"
      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
    >
      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-3">
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black tracking-tighter text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
      {subValue && <p className="text-[9px] font-bold text-blue-500/80 uppercase tracking-widest mt-1">{subValue}</p>}
    </div>
  );

  return (
    <div className="reveal-item glass-card border-beam rounded-[50px] p-8 md:p-12 flex flex-col gap-10 shadow-2xl shadow-blue-500/10 relative overflow-hidden" style={{ animationDelay: '0s' }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full border-b border-slate-200/50 dark:border-slate-800/50 pb-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-500/20">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Live Station Data
          </div>
          <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter leading-tight max-w-2xl">
            {displayLocation}
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-[0.3em]">
              {new Date(data.timestamp * 1000).toLocaleDateString(undefined, { 
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
            {data.originalName && data.originalName !== data.city && (
              <>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  <Info size={12} />
                  {stationName}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-2xl md:text-3xl font-black capitalize text-blue-600 dark:text-blue-400 tracking-tighter">
            {data.description}
          </p>
          <div className="flex items-center gap-3">
             <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em]">
                Feels like <span className="text-slate-800 dark:text-slate-200 font-black">{data.feelsLike}°{tempUnit}</span>
             </p>
             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
             <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em]">
                {data.humidity}% Humidity
             </p>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10 w-full py-4">
        <div className="relative">
          <span className="text-9xl md:text-[11rem] font-[1000] tracking-[-0.08em] text-slate-900 dark:text-white leading-none temp-glow transition-all duration-700 hover:tracking-[-0.05em] cursor-default">
            {data.temp}<span className="text-blue-600 text-6xl md:text-8xl align-top ml-2 font-black">°{tempUnit}</span>
          </span>
        </div>
        
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-48 lg:w-64 lg:h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>
          <img 
            src={getIconUrl(data.icon)} 
            alt={data.description}
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 drop-shadow-[0_20px_60px_rgba(59,130,246,0.3)] animate-weather-icon relative z-10"
          />
        </div>
      </div>

      {/* Bottom Detail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full relative z-10">
        <DetailItem index={1} icon={Wind} label="Wind Speed" value={`${data.windSpeed} ${speedUnit}`} />
        <DetailItem index={2} icon={Droplets} label="Precipitation" value={`${data.humidity}%`} />
        {data.uvIndex !== undefined && (
          <DetailItem 
            index={3}
            icon={Sun} 
            label="UV Index" 
            value={data.uvIndex.toString()} 
            subValue={getUVStatus(data.uvIndex)} 
          />
        )}
        <DetailItem index={4} icon={Eye} label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} />
        <DetailItem index={5} icon={Gauge} label="Atm. Pressure" value={`${data.pressure} hPa`} />
      </div>
    </div>
  );
};

export default CurrentWeather;
