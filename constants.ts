
/**
 * BACKEND CONFIGURATION (n8n Integration)
 */

// Replace this with your actual n8n Webhook URL
export const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/77d72b8e-eecc-4fa6-b281-bfacfe0cd56d";

export const DEFAULT_CITY = "Kochi";
export const DEFAULT_LAT = 9.9312;
export const DEFAULT_LON = 76.2673;

export const WEATHER_ICON_MAP: Record<string, string> = {
  '01d': 'Sun',
  '01n': 'Moon',
  '02d': 'CloudSun',
  '02n': 'CloudMoon',
  '03d': 'Cloud',
  '03n': 'Cloud',
  '04d': 'Clouds',
  '04n': 'Clouds',
  '09d': 'CloudDrizzle',
  '09n': 'CloudDrizzle',
  '10d': 'CloudRain',
  '10n': 'CloudRain',
  '11d': 'CloudLightning',
  '11n': 'CloudLightning',
  '13d': 'Snowflake',
  '13n': 'Snowflake',
  '50d': 'CloudFog',
  '50n': 'CloudFog',
};
