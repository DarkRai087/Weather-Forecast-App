// OpenWeatherMap API Configuration
const API_KEY = 'cf5257f225a2f5396375e1bbbcfe3b23';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherContainer = document.getElementById('weather-container');
const forecastContainer = document.getElementById('forecast-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Theme Management
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
    localStorage.setItem('theme', theme);
}

// Theme Toggle Event Listener
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(currentTheme);
});

// Initialize Theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

// Error Handling
function handleApiError(message) {
    weatherContainer.innerHTML = `
        <div class="text-red-500 dark:text-red-400 text-center">
            ${message}
        </div>
    `;
}

// Fetch Current Weather
async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        // Current Weather Display
        weatherContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4">
                ${data.name}, ${data.sys.country}
            </h2>
            <div class="flex justify-center items-center mb-4">
                <img 
                    src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" 
                    alt="${data.weather[0].description}"
                    class="w-32 h-32 bg-blue-100 dark:bg-gray-700 rounded-full p-2"
                >
            </div>
            <p class="text-4xl font-bold text-blue-900 dark:text-white mb-2">
                ${Math.round(data.main.temp)}°C
            </p>
            <p class="text-xl text-blue-600 dark:text-blue-300 capitalize mb-4">
                ${data.weather[0].description}
            </p>
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p class="text-sm text-blue-600 dark:text-blue-300">Humidity</p>
                    <p class="font-bold text-blue-900 dark:text-white">${data.main.humidity}%</p>
                </div>
                <div class="bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p class="text-sm text-blue-600 dark:text-blue-300">Wind</p>
                    <p class="font-bold text-blue-900 dark:text-white">${data.wind.speed} m/s</p>
                </div>
                <div class="bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p class="text-sm text-blue-600 dark:text-blue-300">Pressure</p>
                    <p class="font-bold text-blue-900 dark:text-white">${data.main.pressure} hPa</p>
                </div>
            </div>
        `;
        
        // Fetch Forecast
        await fetchForecast(city);
    } catch (error) {
        handleApiError(error.message);
    }
}

// Fetch 5-Day Forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        const data = await response.json();
        
        // Filter forecast to get one entry per day
        const dailyForecast = data.list.filter((reading, index) => 
            index % 8 === 0
        ).slice(0, 5);
        
        // Forecast Display
        forecastContainer.innerHTML = dailyForecast.map(forecast => `
            <div class="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p class="text-sm text-blue-600 dark:text-blue-300 mb-2">
                    ${new Date(forecast.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}
                </p>
                <img 
                    src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" 
                    alt="${forecast.weather[0].description}"
                    class="mx-auto w-16 h-16 bg-blue-100 dark:bg-gray-700 rounded-full p-2 mb-2"
                >
                <p class="font-bold text-blue-900 dark:text-white">
                    ${Math.round(forecast.main.temp)}°C
                </p>
                <p class="text-xs text-blue-500 dark:text-blue-300 capitalize">
                    ${forecast.weather[0].description}
                </p>
            </div>
        `).join('');
    } catch (error) {
        handleApiError(error.message);
    }
}

// Search Event Listener
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
});

// Location Button Event Listener
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                const data = await response.json();
                cityInput.value = data.name;
                fetchWeatherData(data.name);
            } catch (error) {
                handleApiError('Unable to fetch location weather');
            }
        }, () => {
            handleApiError('Location access denied');
        });
    } else {
        handleApiError('Geolocation not supported');
    }
});

// Initialize App
function initApp() {
    initializeTheme();
    fetchWeatherData('London'); // Default city
}

// Start the application
initApp();