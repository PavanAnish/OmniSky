
import { callN8nWebhook } from "./weatherService";
import { WeatherData, ForecastItem } from "../types";

const MOCK_INSIGHTS = [
  "Expect perfect campus weather today! A slight breeze makes it a great day for outdoor study sessions near the lake.",
  "Visibility is excellent. It's a prime time for a quick walk across the divisional block.",
  "UV levels are moderate. If you're heading to the stadium, don't forget your sunglasses!",
  "Humidity is slightly high, giving the campus a lush, tropical feel. Stay hydrated!"
];

/**
 * Fetch AI-generated weather insight from the n8n webhook.
 * The n8n workflow has two branches:
 *   - "today" mode: sends "CityName today" → gets current weather AI text
 *   - "5day" mode: sends "CityName" → gets 5-day forecast AI text
 */
export const generateWeatherInsight = async (
  current: WeatherData,
  daily: ForecastItem[],
  forecastMode: 'today' | '5day' = 'today'
): Promise<string> => {
  const cityName = current.originalName || current.city;
  const isToday = forecastMode === 'today';

  try {
    const n8nResponse = await callN8nWebhook(cityName, isToday);

    if (n8nResponse) {
      console.info(`[INSIGHT] Got ${forecastMode} AI insight from n8n for "${cityName}"`);
      return n8nResponse;
    }
  } catch (error) {
    console.warn('[INSIGHT] n8n call failed, using fallback:', error);
  }

  // Fallback to mock insights if n8n is unavailable
  return MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)];
};
