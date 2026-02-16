<![CDATA[<div align="center">

# ☁️ OmniSky — AI-Powered Weather Intelligence

**A  weather app that delivers AI-generated natural-language forecasts for any city worldwide.**

Built with vanilla HTML/CSS/JS on the frontend and an [n8n](https://n8n.io) automation workflow on the backend.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=flat&logo=n8n&logoColor=white)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌤 **Current Weather** | Get real-time weather conditions for any city |
| 📅 **5-Day Forecast** | Extended forecast with day-by-day breakdowns |
| 🤖 **AI Summaries** | Weather data is processed by an LLM (Groq) into friendly, readable text |
| 🔮 **AI Predictions** | The 5-day view includes trend-based predictions for Days 6–10 |
| 🎨 **Glassmorphism UI** | Dark theme with frosted-glass cards, aurora gradients, and particle animations |
| 📱 **Responsive** | Fully responsive layout down to 380px viewports |

---

## 🏗 Architecture

```
┌──────────────┐    HTTP GET     ┌──────────────────────────────────────────────┐
│   Frontend   │ ──────────────► │            n8n Webhook Workflow              │
│  index.html  │                 │                                              │
│   app.js     │ ◄────────────── │  Webhook ► If(today?) ─┬─► OpenWeatherMap   │
│  style.css   │   AI-generated  │                        │   (current)        │
└──────────────┘   weather text  │                        │    ▼               │
                                 │                        │   Groq LLM Agent   │
                                 │                        │    ▼               │
                                 │                        │   Respond          │
                                 │                        │                    │
                                 │                        └─► OpenWeatherMap   │
                                 │                            (5-day forecast) │
                                 │                             ▼               │
                                 │                            Groq LLM Agent   │
                                 │                             ▼               │
                                 │                            Respond          │
                                 └──────────────────────────────────────────────┘
```

### How It Works

1. **User searches** for a city and selects "Today" or "5-Day Forecast".
2. The frontend sends a `GET` request to the n8n webhook with the city name as a query parameter.
3. The n8n workflow **branches**:
   - **Today** → strips the "today" keyword, fetches current weather via the OpenWeatherMap node, then passes the raw data to a **Groq LLM Agent** that generates a beautiful natural-language summary.
   - **5-Day Forecast** → fetches the 5-day/3-hour forecast, then a second **Groq LLM Agent** summarizes each day and also predicts Days 6–10 based on trends.
4. The AI-generated text is returned to the frontend and displayed inside a frosted-glass card.

---

## 📁 Project Structure

```
N8Neather/
├── index.html      # App shell — search bar, toggle, result area
├── app.js          # Fetch logic, state management, particle background
├── style.css       # Full design system (CSS custom properties, glassmorphism, animations)
├── weather.json    # Exported n8n workflow (import into your n8n instance)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- An **n8n** instance (cloud or self-hosted) — [n8n.io](https://n8n.io)
- An **OpenWeatherMap** API key — [openweathermap.org](https://openweathermap.org/api)
- A **Groq** API key — [console.groq.com](https://console.groq.com)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PavanAnish/weatherprediction.git
   cd weatherprediction
   ```

2. **Import the n8n workflow**
   - Open your n8n instance.
   - Go to **Workflows → Import from File** and upload `weather.json`.
   - Add your **OpenWeatherMap** and **Groq** credentials in the n8n credential manager.
   - Activate the workflow.

3. **Configure the webhook URL**
   Open `app.js` and replace the `WEBHOOK_URL` constant with your own n8n webhook URL:
   ```js
   const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/77d72b8e-eecc-4fa6-b281-bfacfe0cd56d';
   ```

4. **Launch the app**
   Open `index.html` in your browser, or serve it with any static file server:
   ```bash
   npx serve .
   ```

---

## 🎨 Design Highlights

- **Dark theme** with CSS custom properties for easy theming
- **Animated particle canvas** with inter-particle connection lines
- **Aurora gradient** background with a gentle breathing animation
- **Glassmorphism card** — `backdrop-filter: blur(20px)` with subtle borders
- **Micro-interactions** — button hover lift, toggle bounce, pulsing loader rings, floating placeholder icon
- **Inter font** via Google Fonts for a clean, modern feel

---

## ⚙️ n8n Workflow Details

The `weather.json` file contains the full exportable workflow with these nodes:

| Node | Purpose |
|---|---|
| **Webhook** | Listens for incoming `GET` requests with a `city` query param |
| **If** | Checks if the query contains "today" to branch logic |
| **Edit Fields** | Strips "today" from the city name for the current weather path |
| **Today** (OpenWeatherMap) | Fetches current weather data |
| **OpenWeatherMap** | Fetches 5-day / 3-hour forecast data |
| **AI Agent** | Groq LLM — generates a natural-language summary for today's weather |
| **AI Agent1** | Groq LLM — generates a 5-day summary + AI predictions for Days 6–10 |
| **Respond to Webhook / Respond to Webhook1** | Returns the AI text to the frontend |

> [!NOTE]
> The workflow uses the **Groq** chat model (`openai/gpt-oss-safeguard-20b`). You can swap this for any LLM supported by n8n's LangChain nodes.

---

## 🛠 Customization

| What | Where |
|---|---|
| Webhook URL | `app.js` → `WEBHOOK_URL` constant |
| Color palette | `style.css` → `:root` custom properties |
| LLM model | `weather.json` → Groq Chat Model nodes → `model` parameter |
| AI prompt | `weather.json` → AI Agent nodes → `text` parameter |

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute.

---

<div align="center">

**Powered by [n8n](https://n8n.io) · [OpenWeatherMap](https://openweathermap.org) · [Groq](https://groq.com)**

</div>
]]>
