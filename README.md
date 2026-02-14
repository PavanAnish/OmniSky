# OmniSky 🔮

**OmniSky** is a futuristic, AI-powered weather prediction application that combines a stunning glassmorphism design with advanced machine learning models to deliver hyper-accurate weather forecasts.OmniSky brings  weather prediction to your fingertips.

## ✨ Features

- **AI-Powered Prediction** - Utilizes advanced machine learning models for hyper-accurate weather forecasting
- **Stunning Glassmorphism Design** - Modern, futuristic UI with frosted glass effects and smooth animations
- **Real-Time Weather Data** - Up-to-the-minute weather conditions from reliable sources
- **5-Day Forecast** - Plan your week with detailed daily forecasts
- **Hourly Breakdown** - Track temperature, humidity, and wind changes throughout the day
- **Dark Mode** - Beautiful dark theme optimized for OLED displays
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **Smooth Animations** - Micro-interactions and transitions that bring the app to life
- **Error Handling** - User-friendly messages for network issues or invalid locations

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- [Node.js](https://nodejs.org/) (for running the backend server)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OmniSky
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## 🛠️ Tech Stack

### Frontend

- **[React](https://reactjs.org/)** - UI library for building the user interface
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for styling
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Backend

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express](https://expressjs.com/)** - Web framework for building the API
- **[Python](https://www.python.org/)** - Machine learning backend
- **[Flask](https://flask.palletsprojects.com/)** - Python microframework
- **[Scikit-learn](https://scikit-learn.org/)** - Machine learning library
- **[Pandas](https://pandas.pydata.org/)** - Data manipulation and analysis
- **[NumPy](https://numpy.org/)** - Numerical operations

## 📂 Project Structure

```
OmniSky/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable React components
│   ├── services/          # API integration and data services
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── server/                # Backend server (Node.js + Python)
│   ├── api/               # API routes
│   ├── models/            # Machine learning models
│   ├── data/              # Weather data
│   └── server.js          # Server entry point
├── .env                   # Environment variables
├── package.json           # Frontend dependencies
├── package-lock.json      # Frontend lock file
├── server/package.json    # Backend dependencies
├── server/requirements.txt # Python dependencies
└── README.md              # Project documentation
```

## 🎨 Design System

### Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary: #0a0e1a;
    --bg-card: rgba(15, 20, 40, 0.55);
    --bg-input: rgba(255, 255, 255, 0.05);
    
    /* Text */
    --text-primary: #e8ecf4;
    --text-secondary: rgba(232, 236, 244, 0.55);
    --text-muted: rgba(232, 236, 244, 0.3);
    
    /* Accents */
    --accent-1: #6366f1;
    --accent-2: #818cf8;
    --accent-3: #a78bfa;
    
    /* Gradients */
    --gradient-btn: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
    --gradient-aurora: radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 60%);
    
    /* Effects */
    --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
    --shadow-btn: 0 4px 20px rgba(99, 102, 241, 0.3);
    
    /* Typography */
    --font: 'Inter', sans-serif;
    
    /* Spacing */
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
}
```

### Key Components

1. **Glassmorphism Cards**
   ```css
   .card {
       background: var(--bg-card);
       border: 1px solid var(--bg-card-border);
       border-radius: var(--radius-lg);
       backdrop-filter: blur(20px) saturate(1.4);
       box-shadow: var(--shadow-card);
   }
   ```

2. **Gradient Buttons**
   ```css
   .btn-primary {
       background: var(--gradient-btn);
       border-radius: var(--radius-md);
       box-shadow: var(--shadow-btn);
       transition: all var(--transition-fast);
   }
   
   .btn-primary:hover {
       transform: translateY(-2px);
       box-shadow: var(--shadow-btn-hover);
   }
   ```

3. **Animated Background**
   ```css
   .aurora {
       position: fixed;
       inset: 0;
       background: var(--gradient-aurora);
       animation: auroraShift 12s ease-in-out infinite alternate;
   }
   ```

## 🤖 Machine Learning Models

### Model Architecture

The backend uses a combination of machine learning models for weather prediction:

1. **Random Forest Regressor** - For temperature prediction
2. **Logistic Regression** - For precipitation probability
3. **K-Nearest Neighbors** - For humidity prediction
4. **Decision Tree** - For wind speed prediction

### Training Data

Models are trained on historical weather data including:
- Temperature
- Humidity
- Wind speed
- Precipitation
- Atmospheric pressure
- Weather conditions

### API Endpoints

```
GET /api/weather?city={city} - Get current weather and 5-day forecast
GET /api/weather/hourly?city={city} - Get hourly breakdown for today
```

## 📱 Responsive Design

### Mobile (320px - 480px)
```css
@media (max-width: 480px) {
    .app {
        padding: 16px 12px;
    }
    
    .search-group {
        flex-direction: column;
    }
    
    #searchBtn {
        width: 100%;
    }
}

### Tablet (768px - 1024px)
```css
@media (min-width: 768px) and (max-width: 1024px) {
    .app {
        padding: 24px;
    }
    
    .card {
        padding: 28px;
    }
}
```

### Desktop (1024px+)
```css
@media (min-width: 1024px) {
    .app {
        padding: 32px;
    }
    
    .card {
        padding: 36px;
    }
}
```

## 🎨 Animations

### Fade Slide Down
```css
@keyframes fadeSlideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Sun Pulse
```css
@keyframes sunPulse {
    0%, 100% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.3)); }
    50% { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5)); }
}
```

## 🧪 Testing

### Frontend Tests
```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Backend Tests
```bash
# Run backend server
npm run server

# Run Python tests
cd server && python -m unittest test_weather.py
```

## 📦 Deployment

### Frontend Deployment
```bash
# Build the frontend
npm run build

# Deploy the build folder to your hosting provider
# For example, with Netlify:
netlify deploy --dir=dist
```

### Backend Deployment
```bash
# Deploy to Heroku
git subtree push --prefix server heroku main

# Or deploy to Vercel
vercel --prod
```

## 📝 Environment Variables

Create a `.env` file in the root directory:
```env
# Frontend
VITE_API_URL=http://localhost:5000/api

# Backend
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ by OmniSky Team**

