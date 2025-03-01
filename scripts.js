// Update clock every second
function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clock');
    clock.textContent = now.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
}

// Fetch and display current weather
async function updateCurrentWeather() {
    try {
        const response = await fetch('data/current_weather.json');
        const data = await response.json();
        document.getElementById('temperature').textContent = data.temperature;
        document.getElementById('humidity').textContent = data.humidity;
        document.getElementById('precipitation').textContent = data.precipitation;
    } catch (error) {
        console.error('Error fetching current weather:', error);
    }
}

// Historical temperatures chart instance
let historicalChart;
async function updateHistoricalChart() {
    try {
        const response = await fetch('data/actual_temps.json');
        const data = await response.json();
        const labels = data.map(entry => entry.timestamp);
        const temperatures = data.map(entry => entry.temperature);

        if (historicalChart) {
            // Update existing chart
            historicalChart.data.labels = labels;
            historicalChart.data.datasets[0].data = temperatures;
            historicalChart.update();
        } else {
            // Create new chart
            const ctx = document.getElementById('historical-chart').getContext('2d');
            historicalChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatures,
                        borderColor: 'blue',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: { type: 'time', time: { unit: 'hour' } }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching historical temperatures:', error);
    }
}

// Forecast chart instance
let forecastChart;
async function updateForecastChart() {
    try {
        const response = await fetch('data/forecast.json');
        const data = await response.json();
        const labels = data.map(entry => entry.timestamp);
        const temperatures = data.map(entry => entry.temperature);

        if (forecastChart) {
            // Update existing chart
            forecastChart.data.labels = labels;
            forecastChart.data.datasets[0].data = temperatures;
            forecastChart.update();
        } else {
            // Create new chart
            const ctx = document.getElementById('forecast-chart').getContext('2d');
            forecastChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Forecast Temperature (°C)',
                        data: temperatures,
                        borderColor: 'green',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: { type: 'time', time: { unit: 'hour' } }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Initial updates
updateClock();
updateCurrentWeather();
updateHistoricalChart();
updateForecastChart();

// Update clock every second
setInterval(updateClock, 1000);

// Update weather data every minute
setInterval(() => {
    updateCurrentWeather();
    updateHistoricalChart();
    updateForecastChart();
}, 60000);