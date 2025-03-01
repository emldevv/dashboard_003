import requests
import json
from datetime import datetime
import pytz
import os

# Coordinates for Sutherland, NSW, Australia
LATITUDE = -34.03
LONGITUDE = 151.06
TIMEZONE = 'Australia/Sydney'

# API URL for current weather and hourly forecast
API_URL = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&hourly=temperature_2m,relative_humidity_2m,precipitation&current_weather=true&timezone={TIMEZONE}"

# Ensure data directory exists
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Fetch data from Open-Meteo API
response = requests.get(API_URL)
data = response.json()

# Get current time in Sydney time zone
now = datetime.now(pytz.timezone(TIMEZONE))
current_date = now.date()

# Parse hourly timestamps
hourly_times = [datetime.fromisoformat(t) for t in data['hourly']['time']]

# Find the current hour's index (latest hour <= now)
current_hour_index = max(i for i, t in enumerate(hourly_times) if t <= now)

# Extract current weather from hourly data for consistency
current_weather = {
    "temperature": data['hourly']['temperature_2m'][current_hour_index],
    "humidity": data['hourly']['relative_humidity_2m'][current_hour_index],
    "precipitation": data['hourly']['precipitation'][current_hour_index],
    "timestamp": now.isoformat()
}

# Save current weather to data/current_weather.json
with open(os.path.join(DATA_DIR, 'current_weather.json'), 'w') as f:
    json.dump(current_weather, f)

# Extract 24-hour forecast starting from current hour
forecast = []
for i in range(current_hour_index, current_hour_index + 24):
    if i < len(hourly_times):
        forecast.append({
            "timestamp": hourly_times[i].isoformat(),
            "temperature": data['hourly']['temperature_2m'][i],
            "humidity": data['hourly']['relative_humidity_2m'][i],
            "precipitation": data['hourly']['precipitation'][i]
        })

# Save forecast to data/forecast.json for the frontend
with open(os.path.join(DATA_DIR, 'forecast.json'), 'w') as f:
    json.dump(forecast, f)

# Manage historical temperatures in data/actual_temps.json
actual_temps_file = os.path.join(DATA_DIR, 'actual_temps.json')

# Load existing historical data if it exists
if os.path.exists(actual_temps_file):
    with open(actual_temps_file, 'r') as f:
        actual_temps = json.load(f)
else:
    actual_temps = []

# Filter to keep only today's data (resets at midnight)
actual_temps = [entry for entry in actual_temps if datetime.fromisoformat(entry['timestamp']).date() == current_date]

# Append current temperature with timestamp
actual_temps.append({
    "timestamp": now.isoformat(),
    "temperature": current_weather['temperature']
})

# Save updated historical temperatures
with open(actual_temps_file, 'w') as f:
    json.dump(actual_temps, f)
