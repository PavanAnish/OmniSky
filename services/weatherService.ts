
import { N8N_WEBHOOK_URL } from '../constants';
import { WeatherData, ForecastItem, SearchSuggestion } from '../types';

/**
 * Combined response from the n8n webhook (after Merge nodes)
 */
export interface N8nWeatherResponse {
  aiText: string;
  type: 'today' | '5day';
  weatherData: {
    city: string;
    country: string;
    temp: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    pressure: number;
    visibility: number;
    windSpeed: number;
    windDeg: number;
    description: string;
    icon: string;
    timestamp: number;
    sunrise: number;
    sunset: number;
  };
  daily?: ForecastItem[];
  hourly?: ForecastItem[];
}

/**
 * Mock data for fallback when n8n is unavailable
 */
const MOCK_WEATHER_DATA = {
  current: {
    city: "Kochi",
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
 * Call the n8n webhook and get the combined response (AI text + weather data).
 * Sends GET with ?city=CityName (or ?city=CityName today)
 */
export const fetchFromN8n = async (
  cityName: string,
  forecastMode: 'today' | '5day' = 'today'
): Promise<N8nWeatherResponse | null> => {
  if (!N8N_WEBHOOK_URL) {
    console.info('[N8N] No webhook URL configured.');
    return null;
  }

  const cityQuery = forecastMode === 'today' ? `${cityName} today` : cityName;
  const url = `${N8N_WEBHOOK_URL}?city=${encodeURIComponent(cityQuery)}`;

  try {
    console.info(`[N8N] Fetching ${forecastMode} weather for "${cityName}": ${url}`);
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      console.warn(`[N8N] Webhook returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Handle the combined response from our Merge Code nodes
    if (data?.weatherData && data?.aiText !== undefined) {
      console.info('[N8N] Got combined response (AI text + weather data)');
      return data as N8nWeatherResponse;
    }

    // Handle old format (just AI text) — wrap it
    if (data?.output || data?.text || typeof data === 'string') {
      const text = typeof data === 'string' ? data : (data.output || data.text || '');
      console.info('[N8N] Got text-only response (old format)');
      return {
        aiText: text,
        type: forecastMode,
        weatherData: MOCK_WEATHER_DATA.current as any
      };
    }

    // Array response from n8n
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      if (item?.weatherData && item?.aiText !== undefined) {
        return item as N8nWeatherResponse;
      }
      return {
        aiText: item?.output || item?.text || JSON.stringify(item),
        type: forecastMode,
        weatherData: MOCK_WEATHER_DATA.current as any
      };
    }

    console.warn('[N8N] Unexpected response format:', data);
    return null;
  } catch (error) {
    console.warn('[N8N] Webhook call failed:', error);
    return null;
  }
};

/**
 * Map n8n weather data to frontend WeatherData type
 */
const mapToWeatherData = (raw: N8nWeatherResponse['weatherData'], overrideName?: string): WeatherData => ({
  city: overrideName || raw.city || 'Unknown',
  originalName: overrideName,
  country: raw.country || '',
  temp: Math.round(raw.temp ?? 0),
  feelsLike: Math.round(raw.feelsLike ?? 0),
  humidity: raw.humidity ?? 0,
  windSpeed: raw.windSpeed ?? 0,
  windDeg: raw.windDeg ?? 0,
  pressure: raw.pressure ?? 0,
  visibility: raw.visibility ?? 10000,
  description: raw.description || '',
  icon: raw.icon || '01d',
  timestamp: raw.timestamp || Math.floor(Date.now() / 1000),
  sunrise: raw.sunrise || Math.floor(Date.now() / 1000) - 10000,
  sunset: raw.sunset || Math.floor(Date.now() / 1000) + 20000,
});

/**
 * Fetch weather data — calls n8n, falls back to mock data
 */
export const fetchWeatherByCity = async (
  cityName: string,
  forecastMode: 'today' | '5day' = 'today',
  unit: 'metric' | 'imperial' = 'metric'
): Promise<{ current: WeatherData; hourly: ForecastItem[]; daily: ForecastItem[]; aiText: string }> => {
  const n8nResult = await fetchFromN8n(cityName, forecastMode);

  if (n8nResult && n8nResult.weatherData) {
    const current = mapToWeatherData(n8nResult.weatherData, cityName);

    // Use real daily/hourly if available (5-day mode), else generate from current
    let daily = n8nResult.daily || [];
    let hourly = n8nResult.hourly || [];

    // If today mode, generate hourly/daily from the current data
    if (daily.length === 0) {
      daily = Array.from({ length: 7 }, (_, i) => ({
        dt: (current.timestamp || Math.floor(Date.now() / 1000)) + (i * 86400),
        temp: current.temp,
        minTemp: Math.round((n8nResult.weatherData.tempMin ?? current.temp - 3)),
        maxTemp: Math.round((n8nResult.weatherData.tempMax ?? current.temp + 3)),
        description: current.description,
        icon: current.icon,
        rainProb: 0,
        humidity: current.humidity
      }));
    }

    if (hourly.length === 0) {
      hourly = Array.from({ length: 24 }, (_, i) => ({
        dt: (current.timestamp || Math.floor(Date.now() / 1000)) + (i * 3600),
        temp: current.temp + Math.sin(i / 4) * 3,
        description: current.description,
        icon: current.icon,
        rainProb: 0,
        humidity: current.humidity
      }));
    }

    // Handle unit conversion for imperial
    if (unit === 'imperial') {
      const toF = (c: number) => Math.round((c * 9 / 5) + 32);
      current.temp = toF(current.temp);
      current.feelsLike = toF(current.feelsLike);
      hourly = hourly.map(h => ({ ...h, temp: toF(h.temp) }));
      daily = daily.map(d => ({
        ...d,
        temp: toF(d.temp),
        minTemp: toF(d.minTemp),
        maxTemp: toF(d.maxTemp)
      }));
    }

    return { current, hourly, daily, aiText: n8nResult.aiText || '' };
  }

  // Fallback to mock data
  console.info('[WEATHER] Using mock data (n8n unavailable)');
  const data = JSON.parse(JSON.stringify(MOCK_WEATHER_DATA));
  data.current.city = cityName;
  data.current.originalName = cityName;

  if (unit === 'imperial') {
    const toF = (c: number) => Math.round((c * 9 / 5) + 32);
    data.current.temp = toF(data.current.temp);
    data.current.feelsLike = toF(data.current.feelsLike);
    data.hourly.forEach((h: any) => { h.temp = toF(h.temp); });
    data.daily.forEach((d: any) => {
      d.temp = toF(d.temp);
      d.minTemp = toF(d.minTemp);
      d.maxTemp = toF(d.maxTemp);
    });
  }

  return { current: data.current, hourly: data.hourly, daily: data.daily, aiText: '' };
};

/**
 * Geocoding — local lookup for known cities
 */
export const fetchGeocoding = async (query: string): Promise<SearchSuggestion[]> => {
  const q = query.toLowerCase().trim();

  if (q.includes('kanjirappally') || q.includes('amal jyothi')) {
    return [{
      name: "Amal Jyothi College of Engineering",
      lat: 9.527091, lon: 76.820919, country: "IN", state: "Kerala"
    }];
  }

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
  if (isCollege) return "Amal Jyothi College of Engineering";
  return "Your Location";
};

// Keep backward compatibility
export const callN8nWebhook = async (cityName: string, isToday: boolean = true): Promise<string | null> => {
  const result = await fetchFromN8n(cityName, isToday ? 'today' : '5day');
  return result?.aiText || null;
};
