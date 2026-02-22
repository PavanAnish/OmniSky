
import { N8N_WEBHOOK_URL } from "../constants";
import { WeatherData, ForecastItem } from "../types";

const MOCK_INSIGHTS = [
  "Expect perfect campus weather today! A slight breeze makes it a great day for outdoor study sessions near the lake.",
  "Visibility is excellent. It's a prime time for a quick walk across the divisional block.",
  "UV levels are moderate. If you're heading to the stadium, don't forget your sunglasses!",
  "Humidity is slightly high, giving the campus a lush, tropical feel. Stay hydrated!"
];

export const generateWeatherInsight = async (current: WeatherData, daily: ForecastItem[]): Promise<string> => {
  // If no n8n configured, pick a random mock insight to keep the UI alive
  if (!N8N_WEBHOOK_URL) {
    return MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)];
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'get_insight', 
        weatherData: { current, daily } 
      })
    });

    if (!response.ok) throw new Error("n8n Insight failure");
    const data = await response.json();
    return data.insight || MOCK_INSIGHTS[0];
  } catch (error) {
    return MOCK_INSIGHTS[0];
  }
};
