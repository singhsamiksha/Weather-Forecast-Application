const inputbox = document.getElementById('searchbox');
const button = document.getElementById('searchbutton');
const currentWeatherContainer = document.getElementById('current');
const weatherContainer = document.getElementById('extended');
const buttoncurr = document.getElementById('currentbutton');
const history = document.getElementById('history');

// Function to load and display search history
function loadHistory() {
    history.innerHTML = ''; // Clear existing history
    if (localStorage.length === 0) {
        history.innerHTML = '<p class="text-white">No search history available.</p>';
    } else {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const historyItem = document.createElement('li');
            historyItem.textContent = value;
            historyItem.classList.add('history-item');
            historyItem.addEventListener('click', () => {
                inputbox.value = value;
                button.click();
            });
            history.appendChild(historyItem);
        }
    }
}

// Function to remove the oldest entry from localStorage
function removeOldestHistory() {
    if (localStorage.length >= 5) {
        // Get the oldest key
        const oldestKey = localStorage.key(0);
        // Remove the oldest key-value pair
        localStorage.removeItem(oldestKey);
    }
}

// Initial load of history
loadHistory();

button.addEventListener('click', async function() {
    const inputValue = inputbox.value.trim();

    if (inputValue === "") {
        displayError("Please enter a location.");
        return;
    }

    // Remove the oldest entry if there are already 5 items
    removeOldestHistory();

    // Save location to localStorage
    localStorage.setItem(`location${localStorage.length + 1}`, inputValue);
    loadHistory();

    try {
        // Fetch the location data
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=a9ff57f2e6394ba296282142240609&q=${inputValue}`);
        const result = await response.json();

        if (result.length > 0) {  // Check if the array has at least one element
            const locationName = result[0].name; // Access the 'name' property of the first element

            try {
                // Fetch the weather forecast data
                const responseforecast = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=a9ff57f2e6394ba296282142240609&q=${locationName}&days=5&aqi=yes&alerts=yes`);
                const resultforecast = await responseforecast.json();
                console.log(resultforecast);
                
                // Display data
                displayWeather(resultforecast, locationName);
            } catch (error) {
                displayError(`Error fetching forecast data: ${error.message}`);
            }
        } else {
            displayError("No results found. Please enter a valid city name.");
        }
    } catch (error) {
        displayError(`Error fetching location data: ${error.message}`);
    }
});

// Function to display weather data
function displayWeather(data, locationName) {
    weatherContainer.innerHTML = ''; // Clear previous data
    currentWeatherContainer.innerHTML = ''; // Clear previous current weather data

    // Display location name
    const locationHeader = `<h2 id="location">${locationName.toUpperCase()}</h2>`;
    currentWeatherContainer.innerHTML += locationHeader;

    // Display current weather
    const current = data.current;
    const currentWeatherInfo = `
        <div class="curr-weather-day">
            <h3 id="todayHeading">Today</h3>
            <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>Temperature: ${current.temp_c}°C</p>
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind Speed: ${current.wind_kph} kph</p>
            <p>Condition: ${current.condition.text}</p>           
        </div>
    `;
    currentWeatherContainer.innerHTML += currentWeatherInfo;

    // Display forecast
    const forecast = data.forecast.forecastday;
    const forecastHeader = `<h2 id="heading">4-Day Forecast</h2>`;
    currentWeatherContainer.innerHTML += forecastHeader;
    forecast.forEach(day => {
        if (day.date !== data.forecast.forecastday[0].date) { // Skip the current day's forecast as it's already displayed
            const weatherInfo = `
                <div class="weather-day">
                    <h3 id="dateHeading">${day.date}</h3>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p>Temperature: ${day.day.avgtemp_c}°C</p>
                    <p>Humidity: ${day.day.avghumidity}%</p>
                    <p>Wind Speed: ${day.day.maxwind_kph} kph</p>
                    <p>Condition: ${day.day.condition.text}</p>           
                </div>
            `;
            weatherContainer.innerHTML += weatherInfo;
        }
    });
}

// Function to display error messages
function displayError(message) {
    weatherContainer.innerHTML = ''; // Clear previous data
    currentWeatherContainer.innerHTML = ''; // Clear previous current weather data
    currentWeatherContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Add functionality to buttoncurr to get the current location
buttoncurr.addEventListener('click', async function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const { latitude, longitude } = position.coords;

            try {
                // Fetch the location name from coordinates
                const responseLocation = await fetch(`https://api.weatherapi.com/v1/search.json?key=a9ff57f2e6394ba296282142240609&q=${latitude},${longitude}`);
                const locationResult = await responseLocation.json();

                if (locationResult && locationResult.length > 0) {
                    const locationName = locationResult[0].name;
                    // Fetch the weather forecast data for the current location
                    const responseforecast = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=a9ff57f2e6394ba296282142240609&q=${locationName}&days=5&aqi=yes&alerts=yes`);
                    const resultforecast = await responseforecast.json();
                    console.log(resultforecast);
                    
                    // Display data
                    displayWeather(resultforecast, locationName);
                } else {
                    displayError("Unable to retrieve location name.");
                }
            } catch (error) {
                displayError(`Error fetching location data: ${error.message}`);
            }
        }, function(error) {
            displayError(`Error retrieving your location: ${error.message}`);
        });
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
});
