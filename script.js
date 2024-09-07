const inputbox = document.getElementById('searchbox');

inputbox.addEventListener('click', function() {
    const inputValue = inputbox.value;

    // Construct the URL with the API key
    const url = 'https://places.googleapis.com/v1/places:autocomplete?key=AIzaSyC3-p7T1PVLt99V7KoLCmBUapxCtUjUHkQav';

    // Construct the data object
    const data = {
        input: inputValue,
        includedRegionCodes: [
            "US", "IN", "CN", "JP", "DE", "GB", "FR", "IT", "CA", "AU", "BR", "RU", "ZA", "KR", "MX"
        ],
        languageCode: "es",
        sessionToken: "your-unique-session-token"
    };

    // Set up request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            'Origin': 'http://127.0.0.1:5500',
            'Referer': 'http://127.0.0.1:5500/',
            'Sec-CH-UA': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
        },
        body: JSON.stringify(data)
    };

    // Make the request using fetch
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
});
