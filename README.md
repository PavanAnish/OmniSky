<div align="center">

# ☁️ OmniSky
### AI-Powered Weather Intelligence

**Experience weather forecasts like never before.**
*Natural language summaries, predictive insights, and a stunning glassmorphism UI.*

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)

[View Demo](#) · [Report Bug](https://github.com/PavanAnish/weatherprediction/issues) · [Request Feature](https://github.com/PavanAnish/weatherprediction/issues)

</div>

---

## ✨ Overview

**OmniSky** is not just another weather app. It leverages the power of **Generative AI** and **n8n automation** to transform raw meteorological data into human-readable, actionable insights. Whether you're planning your day or your week, OmniSky provides clear, concise, and intelligent summaries tailored to your location.

Built with a focus on aesthetics and user experience, OmniSky features a modern **Glassmorphism UI** that feels premium and responsive.

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🌤 Real-Time Weather** | Instant access to current conditions for any city worldwide. |
| **📅 5-Day Forecast** | Comprehensive outlook with 3-hour interval data processing. |
| **🤖 AI Narratives** | **Groq LLM** transforms complex data into friendly, easy-to-read text. |
| **🔮 Smart Predictions** | AI analyzes trends to predict weather for Days 6–10 (experimental). |
| **🎨 Stunning UI** | Frosted glass cards, aurora gradients, and interactive particle backgrounds. |
| **📱 Mobile Ready** | Fully responsive design that looks great on all devices. |

---

## 🏗 Architecture

The system uses a decoupled architecture where the frontend serves as a display layer for intelligent backend processing.

### How It Works

1.  **Input:** User searches for a city.
2.  **Trigger:** Frontend calls the n8n webhook.
3.  **Process:**
    *   **Current Weather:** Fetches live data -> AI generates a "Today" summary.
    *   **Forecast:** Fetches 5-day data -> AI generates a "5-Day" summary + predictive insights for the following week.
4.  **Output:** The structured AI response is displayed in the UI.

---

## 🎨 Design System

We believe in "Software as Art". OmniSky's design highlights include:

*   **Glassmorphism:** `backdrop-filter: blur(20px)` for that premium, frosted look.
*   **Dynamic Backgrounds:** Slowly shifting aurora gradients that breathe life into the page.
*   **Particle Effects:** An interactive canvas of connected particles simulating atmospheric depth.
*   **Micro-interactions:** Subtle hover states, smooth transitions, and loading animations.
*   **Typography:** The clean, geometric lines of **Inter** (Google Fonts).

---

## � Installation & Setup

Get OmniSky running on your local machine in minutes.

### Prerequisites

*   [n8n](https://n8n.io) (Cloud or Self-hosted)
*   [OpenWeatherMap API Key](https://openweathermap.org/api)
*   [Groq API Key](https://console.groq.com)

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/PavanAnish/weatherprediction.git
    cd weatherprediction
    ```

2.  **Setup the Backend (n8n)**
    *   Import `weather.json` into your n8n instance.
    *   Configure your **OpenWeatherMap** and **Groq** credentials.
    *   **Activate** the workflow.
    *   Copy your **Production Webhook URL**.

3.  **Connect Frontend**
    *   Open `app.js`.
    *   Replace the `WEBHOOK_URL` variable:
        ```javascript
        const WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
        ```

4.  **Run Locally**
    Open `index.html` directly or serve it:
    ```bash
    npx serve .
    ```

---

## ⚙️ Configuration

| Component | File | Parameter | Description |
| :--- | :--- | :--- | :--- |
| **Endpoint** | `app.js` | `WEBHOOK_URL` | The link to your n8n workflow. |
| **Theme** | `style.css` | `:root` vars | Colors for background, glass, and text. |
| **AI Model** | `weather.json` | `Model ID` | Switch between Llama 3, Mixtral, etc. |
| **Prompts** | `weather.json` | `System Message` | Customize the personality of the weather reporter. |

---

## 📂 Project Structure

```bash
N8Neather/
├── index.html      # Main user interface
├── app.js          # Logic, API calls, & UI updates
├── style.css       # Styling, animations, & responsive design
├── weather.json    # n8n workflow definition (backend logic)
└── README.md       # Documentation
```

---
## ## 👥 Contributors

Thanks to the team for making this project possible!

<a href="https://github.com/PavanAnish/OmniSky/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=PavanAnish/OmniSky" />
</a>


</div>
## 🌐 Live Demo

**Final Outcome:**  
👉 https://celebrated-gumption-52a5ba.netlify.app/
