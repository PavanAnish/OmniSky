/* ============================================
   N8Neather — Application Logic
   ============================================ */

// ━━━ Configuration ━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Replace this with your actual n8n webhook URL
const WEBHOOK_URL = 'https://weatherboy.app.n8n.cloud/webhook-test/77d72b8e-eecc-4fa6-b281-bfacfe0cd56d';
// Example: 'https://your-n8n-instance.com/webhook/77d72b8e-eecc-4fa6-b281-bfacfe0cd56d'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// --- DOM Elements ---
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const forecastToggle = document.getElementById('forecastToggle');
const labelToday = document.getElementById('labelToday');
const labelForecast = document.getElementById('labelForecast');
const placeholderState = document.getElementById('placeholderState');
const loadingState = document.getElementById('loadingState');
const weatherResult = document.getElementById('weatherResult');
const errorState = document.getElementById('errorState');
const resultCity = document.getElementById('resultCity');
const resultBadge = document.getElementById('resultBadge');
const resultText = document.getElementById('resultText');
const errorMessage = document.getElementById('errorMessage');

// --- State ---
let isLoading = false;

// --- Toggle Logic ---
forecastToggle.addEventListener('change', () => {
    const isForecast = forecastToggle.checked;
    labelToday.classList.toggle('active', !isForecast);
    labelForecast.classList.toggle('active', isForecast);
});

labelToday.addEventListener('click', () => {
    forecastToggle.checked = false;
    forecastToggle.dispatchEvent(new Event('change'));
});

labelForecast.addEventListener('click', () => {
    forecastToggle.checked = true;
    forecastToggle.dispatchEvent(new Event('change'));
});

// --- Search ---
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city || isLoading) return;

    const isToday = !forecastToggle.checked;
    const queryCity = isToday ? `${city} today` : city;

    showState('loading');
    isLoading = true;
    searchBtn.disabled = true;

    try {
        const url = `${WEBHOOK_URL}?city=${encodeURIComponent(queryCity)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.text();

        // Try to parse as JSON in case the response is JSON-wrapped
        let weatherText = data;
        try {
            const json = JSON.parse(data);
            // n8n might return { output: "..." } or just text
            if (json.output) weatherText = json.output;
            else if (json.text) weatherText = json.text;
            else if (json.response) weatherText = json.response;
            else if (typeof json === 'string') weatherText = json;
        } catch {
            // Response is plain text, use as-is
        }

        resultCity.textContent = city;
        resultBadge.textContent = isToday ? 'Today' : '5-Day Forecast';
        resultText.textContent = weatherText;

        showState('result');
    } catch (err) {
        console.error('Weather fetch error:', err);
        if (WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
            errorMessage.textContent = 'Please configure your n8n webhook URL in app.js';
        } else {
            errorMessage.textContent = 'Could not fetch weather data. Please try again.';
        }
        showState('error');
    } finally {
        isLoading = false;
        searchBtn.disabled = false;
    }
}

function showState(state) {
    placeholderState.classList.add('hidden');
    loadingState.classList.add('hidden');
    weatherResult.classList.add('hidden');
    errorState.classList.add('hidden');

    switch (state) {
        case 'placeholder': placeholderState.classList.remove('hidden'); break;
        case 'loading': loadingState.classList.remove('hidden'); break;
        case 'result': weatherResult.classList.remove('hidden'); break;
        case 'error': errorState.classList.remove('hidden'); break;
    }
}

// --- Animated Particle Background ---
(function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.min(Math.floor((w * h) / 18000), 80);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.8 + 0.3,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.2 - 0.1,
                opacity: Math.random() * 0.4 + 0.05,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.01 + 0.005
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.x += p.dx;
            p.y += p.dy;
            p.pulse += p.pulseSpeed;

            // Wrap around
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 146, 230, ${alpha})`;
            ctx.fill();
        }

        // Draw faint connections between close particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const alpha = (1 - dist / 120) * 0.06;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    resize();
    createParticles();
    draw();
})();

// --- Focus input on load ---
window.addEventListener('DOMContentLoaded', () => {
    cityInput.focus();
});
