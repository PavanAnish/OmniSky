
import { N8N_WEBHOOK_URL } from '../constants';
import { SearchSuggestion } from '../types';

/**
 * Mock data for design preview when no backend is connected
 */
const MOCK_WEATHER_DATA = {
  current: {
    city: "Kanjirappally",
    originalName: "Divisional block, Amal Jyothi College of Engineering",
    country: "IN",
    temp: 28,
    feelsLike: 31,
    humidity: 72,
    windSpeed: 3.5,
    windDeg: 120,
    pressure: 1012,
    visibility: 10000,
    description: "scattered clouds",
    icon: "03d",
    timestamp: Math.floor(Date.now() / 1000),
    sunrise: Math.floor(Date.now() / 1000) - 10000,
    sunset: Math.floor(Date.now() / 1000) + 20000,
    uvIndex: 4
  },
  hourly: Array.from({ length: 24 }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + (i * 3600),
    temp: 24 + Math.sin(i / 4) * 5,
    description: "clear sky",
    icon: "01d",
    rainProb: Math.floor(Math.random() * 20),
    humidity: 60 + Math.random() * 20
  })),
  daily: Array.from({ length: 7 }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + (i * 86400),
    temp: 27,
    minTemp: 22,
    maxTemp: 31,
    description: i % 2 === 0 ? "partly cloudy" : "sunny",
    icon: i % 2 === 0 ? "02d" : "01d",
    rainProb: 10,
    humidity: 65
  }))
};

const callN8n = async (action: string, payload: any) => {
  // If URL is missing, return mock data instead of throwing error
  if (!N8N_WEBHOOK_URL) {
    console.info(`[N8N MOCK MODE] Intercepted action: ${action}`);
    if (action === 'get_geocoding') return [];
    if (action === 'get_weather') return MOCK_WEATHER_DATA;
    return {};
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });

  if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);
  return await response.json();
};

export const fetchGeocoding = async (query: string): Promise<SearchSuggestion[]> => {
  const q = query.toLowerCase().trim();
  
  // High-priority local logic for the campus location
  if (q.includes('kanjirappally') || q.includes('amal jyothi')) {
    return [{
      name: "Divisional block, Amal Jyothi College of Engineering",
      lat: 9.527091,
      lon: 76.820919,
      country: "IN",
      state: "Kerala"
    }];
  }

  try {
    return await callN8n('get_geocoding', { query: q });
  } catch (e) {
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  const isCollege = Math.abs(lat - 9.527091) < 0.001 && Math.abs(lon - 76.820919) < 0.001;
  if (isCollege) return "Divisional block, Amal Jyothi College of Engineering";

  try {
    const data = await callN8n('reverse_geocode', { lat, lon });
    return data.locationName || "Your Location";
  } catch (err) {
    return "Your Location";
  }
};

export const fetchWeatherByCoords = async (
  lat: number, 
  lon: number, 
  unit: 'metric' | 'imperial' = 'metric',
  overrideName?: string
) => {
  try {
    const data = await callN8n('get_weather', { lat, lon, unit, overrideName });
    
    // Maintain the campus branding in mock mode or if data returns
    const isCollegeCoords = Math.abs(lat - 9.527091) < 0.001 && Math.abs(lon - 76.820919) < 0.001;
    if (isCollegeCoords && data.current) {
      data.current.originalName = "Divisional block, Amal Jyothi College of Engineering";
    }
    return data;
  } catch (e) {
    // Fallback if n8n fails or in mock mode
    console.info(`[WEATHER SERVICE] Using mock data for unit: ${unit}`);
    const data = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
    
    if (unit === 'imperial') {
      // Convert Celsius to Fahrenheit: (C * 9/5) + 32
      const toF = (c: number) => Math.round((c * 9/5) + 32);
      
      data.current.temp = toF(data.current.temp);
      data.current.feelsLike = toF(data.current.feelsLike);
      
      data.hourly.forEach((h: any) => {
        h.temp = toF(h.temp);
      });
      
      data.daily.forEach((d: any) => {
        d.temp = toF(d.temp);
        d.minTemp = toF(d.minTemp);
        d.maxTemp = toF(d.maxTemp);
      });
    }
    
    const isCollegeCoords = Math.abs(lat - 9.527091) < 0.001 && Math.abs(lon - 76.820919) < 0.001;
    if (isCollegeCoords) {
      data.current.originalName = "Divisional block, Amal Jyothi College of Engineering";
    }
    return data;
  }
};
