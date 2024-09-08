const inputbox = document.getElementById('searchbox');
const button = document.getElementById('searchbutton');

button.addEventListener('click', function() {
    const inputValue = inputbox.value;
    
    async function fetchData() {
        try {
            const response = await fetch(`http://api.weatherapi.com/v1/search.json?key=a9ff57f2e6394ba296282142240609&q=${inputValue}`);
            const result = await response.json();
            let name;
            if (result.length > 0) {  // Check if the array has at least one element
                name = result[0].name; // Access the 'name' property of the first element
            } else {
                console.log("No results found.");
            }
           try{
                const responseforecast = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=a9ff57f2e6394ba296282142240609&q=${name}&days=5&aqi=yes&alerts=yes`)
                const resultforecast = await responseforecast.json();
                console.log(resultforecast);
            }
            catch(error){
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    }

    fetchData();  // Call the function to fetch data
});
