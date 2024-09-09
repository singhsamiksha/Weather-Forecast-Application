const inputbox = document.getElementById('searchbox');
const button = document.getElementById('searchbutton');

button.addEventListener('click', async function() {
    const inputValue = inputbox.value.trim();

    if (inputValue === "") {
        alert("Please enter a location.");
        return;
    }

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
                console.error("Error fetching forecast data:", error);
            }
        } else {
            console.log("No results found.");
        }
    } catch (error) {
        console.error("Error fetching location data:", error);
    }
});

// Function to display weather data
function displayWeather(data, locationName) {
    const weatherContainer = document.getElementById('extended');
    const currentWeatherContainer = document.getElementById('current');
    
    weatherContainer.innerHTML = ''; // Clear previous data
    currentWeatherContainer.innerHTML = ''; // Clear previous current weather data

    // Display location name
    const locationHeader = `<h2 id="location">${locationName.toUpperCase()}</h2>`;
    currentWeatherContainer.innerHTML += locationHeader;

    // Display current weather
    const current = data.current;
    const currentWeatherInfo = `
        <div class="weather-day">
            <h3>Today</h3>
            <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>Temperature: ${current.temp_c}°C</p>
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind Speed: ${current.wind_kph} kph)</p>
            <p>Condition: ${current.condition.text}</p>           
        </div>
    `;
    currentWeatherContainer.innerHTML += currentWeatherInfo;

    // Display forecast
    const forecast = data.forecast.forecastday;
    const forecastHeader = `<h2 id="heading">4- Day Forecast</h2>`;
    currentWeatherContainer.innerHTML += forecastHeader;
    forecast.forEach(day => {
        if (day.date !== data.forecast.forecastday[0].date) { // Skip the current day's forecast as it's already displayed
            const weatherInfo = `
                <div class="weather-day">
                    <h3>${day.date}</h3>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p>Temperature: ${day.day.avgtemp_c}°C </p>
                    <p>Humidity: ${day.day.avghumidity}%</p>
                    <p>Wind Speed: ${day.day.maxwind_kph} kph </p>
                    <p>Condition: ${day.day.condition.text}</p>           
                </div>
            `;
            weatherContainer.innerHTML += weatherInfo;
        }
    });
}
