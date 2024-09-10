// User Input Section DOMs
const inputbox = document.getElementById('search-box');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');

// History Section DOMs
const searchHistoryContainer = document.getElementById('history-section');
const clearHistoy = document.getElementById('clearhistory');
const history = document.getElementById('search-history-list');

// Conatiners, one of them should be visible at a time
const searchResultContainer = document.getElementById('search-result-container');
const errorContainer = document.getElementById('error-section');
const loaderContainer = document.getElementById('loader-section');

// Search Result Container DOMs
const locationTitle = document.getElementById('locationname');
const todayWeatherContainer = document.getElementById('today-forcast');
const upcomingDaysForcastContainer = document.getElementById('upcoming-forcast');

const MAX_SEARCH_HISTORY_ITEM_LENGTH = 5;

const CONTAINERS = {
    SEARCH_RESULT: "SEARCH_RESULT",
    LOADER: "LOADER",
    ERROR_MESSAGE: "ERROR_MESSAGE",
}

function showDOM(dom) {
    dom.classList.remove('hidden');
}

function hideDOM(dom) {
    dom.classList.add('hidden');
}

function setContainer(container) {
    hideDOM(searchResultContainer);
    hideDOM(loaderContainer);
    hideDOM(errorContainer);
    // In this variable we will fill the item from containers
    let currentContainer = null;
    switch (container) {
        case CONTAINERS.SEARCH_RESULT:
            currentContainer = searchResultContainer;
            break;
        case CONTAINERS.LOADER:
            currentContainer = loaderContainer;
            break;
        case CONTAINERS.ERROR_MESSAGE:
            currentContainer = errorContainer;
            break;
        default:
            return;
    }
    currentContainer && showDOM(currentContainer);
}

function getSearchHistory() {
    const data = localStorage.getItem('locationSearchHistory') || '[]';
    return JSON.parse(data);
}

function setSearchHistory(searchValue) {
    let currentSearchHistory = getSearchHistory();

    // checking if item already exists or not
    const isItemAlreadyExists = currentSearchHistory.find(searchItem => {
        return searchItem.toLowerCase() === searchValue.toLowerCase();
    })

    // Search value already in local storage, no need to add then
    if (isItemAlreadyExists) return loadHistory();

    // Adding the search value at starting of array
    currentSearchHistory.unshift(searchValue);

    // If Localstorage item have more than MAX item, remove last item as it will be oldest
    if (currentSearchHistory.length > MAX_SEARCH_HISTORY_ITEM_LENGTH) {
        currentSearchHistory.pop();
    }
    localStorage.setItem('locationSearchHistory', JSON.stringify(currentSearchHistory));
    loadHistory();
}

// Function to load and display search history
function loadHistory() {
    history.innerHTML = ''; // Clear existing history
    const searchHistory = getSearchHistory();
    if (searchHistory.length === 0) {
        hideDOM(searchHistoryContainer);
    } else {
        showDOM(searchHistoryContainer);
        for (let i = 0; i < searchHistory.length; i++) {
            const value = searchHistory[i];
            const historyItem = document.createElement('li');
            historyItem.textContent = value;
            historyItem.classList.add('py-2', 'px-3', 'hover:bg-gray-600', 'cursor-pointer');
            historyItem.addEventListener('click', () => {
                inputbox.value = value;
                searchButton.click();
            });
            history.appendChild(historyItem);
        }
    }
}

// Function to display weather data
function displayWeather(data, locationName) {
    upcomingDaysForcastContainer.innerHTML = ''; // Clear previous data
    todayWeatherContainer.innerHTML = ''; // Clear previous current weather data

    // Display location name
    locationTitle.innerHTML = locationName.toUpperCase()

    // Display current weather
    const current = data.current;
    const currentWeatherInfo = `
        <div class="bg-zinc-900 rounded-lg flex flex-col justify-center items-center p-5">
            <h3 id="todayHeading">Today</h3>
            <img src="https:${current.condition.icon}" alt="${current.condition.text}">
            <p>Temperature: ${current.temp_c}°C</p>
            <p>Humidity: ${current.humidity}%</p>
            <p>Wind Speed: ${current.wind_kph} kph</p>
            <p>Condition: ${current.condition.text}</p>           
        </div>
    `;
    todayWeatherContainer.innerHTML += currentWeatherInfo;

    // Display forecast
    const forecast = data.forecast.forecastday;
    forecast.forEach(day => {
        if (day.date !== data.forecast.forecastday[0].date) { // Skip the current day's forecast as it's already displayed
            const weatherInfo = `
                <div class="weather-day bg-zinc-900 text-center w-full rounded-lg p-7">
                    <h3 id="dateHeading">${day.date}</h3>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p>Temperature: ${day.day.avgtemp_c}°C</p>
                    <p>Humidity: ${day.day.avghumidity}%</p>
                    <p>Wind Speed: ${day.day.maxwind_kph} kph</p>
                    <p>Condition: ${day.day.condition.text}</p>           
                </div>
            `;
            upcomingDaysForcastContainer.innerHTML += weatherInfo;
        }
    });
    setContainer(CONTAINERS.SEARCH_RESULT);
}

// Function to display error messages
function displayError(message) {
    errorContainer.innerHTML = ''; // Clear previous data
    if (message) {
        setContainer(CONTAINERS.ERROR_MESSAGE);
        // if there is any error hide the search result
        errorContainer.innerHTML = `<p class="error">${message}</p>`;
    } else {
        setContainer(null);
    }
}

searchButton.addEventListener('click', async function (event) {
    setContainer(CONTAINERS.LOADER);
    const inputValue = inputbox.value.trim();
    
    if (!inputValue || !inputValue.length) {
        displayError("Please enter a location.");
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

                // Save location to localStorage
                setSearchHistory(locationName);

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
    } finally {
        displayLoader(false);
    }
});

// Add functionality to buttoncurr to get the current location
currentLocationButton.addEventListener('click', async function () {
    setContainer(CONTAINERS.LOADER);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
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
                    // Display data
                    setSearchHistory(locationName);
                    displayWeather(resultforecast, locationName);
                } else {
                    displayError("Unable to retrieve location name.");
                }
            } catch (error) {
                displayError(`Error fetching location data: ${error.message}`);
            }
        }, function (error) {
            displayError(`Error retrieving your location: ${error.message}`);
        });
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
});

clearHistoy.addEventListener('click', function () {
    localStorage.removeItem('locationSearchHistory');
    loadHistory();
});

// Initial load of history
loadHistory();