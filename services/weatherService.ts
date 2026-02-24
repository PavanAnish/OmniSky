
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

/**
 * Call the n8n webhook with a city name as a GET query parameter.
 * The n8n workflow expects: ?city=CityName
 * For today's weather, append "today": ?city=CityName today
 */
export const callN8nWebhook = async (cityName: string, isToday: boolean = true): Promise<string | null> => {
  if (!N8N_WEBHOOK_URL) {
    console.info('[N8N] No webhook URL configured, skipping n8n call.');
    return null;
  }

  const cityQuery = isToday ? `${cityName} today` : cityName;
  const url = `${N8N_WEBHOOK_URL}?city=${encodeURIComponent(cityQuery)}`;

  try {
    console.info(`[N8N] Calling webhook: ${url}`);
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      console.warn(`[N8N] Webhook returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    // The n8n AI Agent returns text in the "output" field
    if (typeof data === 'string') return data;
    if (data?.output) return data.output;
    if (data?.text) return data.text;
    // If it's an array (n8n sometimes wraps in array), get first item
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      return item?.output || item?.text || JSON.stringify(item);
    }
    return JSON.stringify(data);
  } catch (error) {
    console.warn('[N8N] Webhook call failed:', error);
    return null;
  }
};

/**
 * Geocoding — uses local logic for known locations, otherwise returns empty
 * (n8n workflow doesn't support geocoding, so we keep local logic)
 */
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

  // Basic geocoding for common Indian cities (n8n doesn't have a geocoding endpoint)
  const KNOWN_CITIES: Record<string, SearchSuggestion> = {
    'kochi': { name: 'Kochi', lat: 9.9312, lon: 76.2673, country: 'IN', state: 'Kerala' },
    'ernakulam': { name: 'Ernakulam', lat: 9.9816, lon: 76.2999, country: 'IN', state: 'Kerala' },
    'mumbai': { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN', state: 'Maharashtra' },
    'delhi': { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'IN', state: 'Delhi' },
    'bangalore': { name: 'Bangalore', lat: 12.9716, lon: 77.5946, country: 'IN', state: 'Karnataka' },
    'bengaluru': { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'IN', state: 'Karnataka' },
    'chennai': { name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'IN', state: 'Tamil Nadu' },
    'hyderabad': { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, country: 'IN', state: 'Telangana' },
    'kolkata': { name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'IN', state: 'West Bengal' },
    'pune': { name: 'Pune', lat: 18.5204, lon: 73.8567, country: 'IN', state: 'Maharashtra' },
    'jaipur': { name: 'Jaipur', lat: 26.9124, lon: 75.7873, country: 'IN', state: 'Rajasthan' },
    'ahmedabad': { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, country: 'IN', state: 'Gujarat' },
    'thiruvananthapuram': { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, country: 'IN', state: 'Kerala' },
    'trivandrum': { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, country: 'IN', state: 'Kerala' },
    'thrissur': { name: 'Thrissur', lat: 10.5276, lon: 76.2144, country: 'IN', state: 'Kerala' },
    'kozhikode': { name: 'Kozhikode', lat: 11.2588, lon: 75.7804, country: 'IN', state: 'Kerala' },
    'calicut': { name: 'Kozhikode', lat: 11.2588, lon: 75.7804, country: 'IN', state: 'Kerala' },
    'new york': { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US', state: 'New York' },
    'london': { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB', state: 'England' },
    'tokyo': { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
    'paris': { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
    'dubai': { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'AE' },
    'singapore': { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SG' },
  };

  const results: SearchSuggestion[] = [];
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (key.includes(q) || q.includes(key)) {
      results.push(city);
    }
  }
  return results;
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  const isCollege = Math.abs(lat - 9.527091) < 0.001 && Math.abs(lon - 76.820919) < 0.001;
  if (isCollege) return "Divisional block, Amal Jyothi College of Engineering";
  return "Your Location";
};

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  unit: 'metric' | 'imperial' = 'metric',
  overrideName?: string
) => {
  // Use mock data for structured UI (charts, temp cards, forecasts)
  // The n8n webhook returns AI text, not structured JSON
  console.info(`[WEATHER SERVICE] Using local data for structured UI (unit: ${unit})`);
  const data = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));

  // Override city name if provided
  if (overrideName) {
    data.current.city = overrideName;
    data.current.originalName = overrideName;
  }

  if (unit === 'imperial') {
    const toF = (c: number) => Math.round((c * 9 / 5) + 32);

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
};
