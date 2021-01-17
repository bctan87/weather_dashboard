function start() {

    // OpenWeather API Key
    let apiKey = "991bed0f19c582d528c3f6f90605ec42";

    // APIs
    let api1 = "https://api.openweathermap.org/data/2.5/weather?q="
    let api2 = "https://api.openweathermap.org/data/2.5/onecall?lat="
    let api3 = "https://api.openweathermap.org/data/2.5/forecast?q="
    
    // Search input + button
    let userSearch = document.getElementById("user-input");
    let searchButton = document.getElementById("user-search");
    
    // Display elements
    let citynameField = document.getElementById("city-name");
    let weatherIcon = document.getElementById("weather-icon");
    let temperatureField = document.getElementById("temperature-field");
    let humidityField  = document.getElementById("humidity-field");
    let windspeedField = document.getElementById("windspeed-field");
    let uvindexField = document.getElementById("uvindex-field");
    
    // Saves user searches into an empty array
    let saveField = document.getElementById("history-field");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);

    // This checks the user input
    searchButton.addEventListener("click",function() {
        let searchTerm = userSearch.value;

        if (userSearch.value === "") {
            alert("Please enter a valid city name");
            return;

        // else, proceed to save
        } else {
            callOpenWeather(searchTerm);
            searchHistory.push(searchTerm);
            localStorage.setItem("search",JSON.stringify(searchHistory));
            displayHistory();
        }

    })

    function displayHistory() {
        saveField.innerHTML = "";
        for (let i=0; i<searchHistory.length; i++) {
            let pastSearch = document.createElement("input");
            pastSearch.setAttribute("type","text");
            pastSearch.setAttribute("readonly",true);
            pastSearch.setAttribute("class", "form-control d-block bg-white");
            pastSearch.setAttribute("value", searchHistory[i]);
            pastSearch.addEventListener("click",function() {
                callOpenWeather(pastSearch.value);
            })
            saveField.append(pastSearch);
        }
    }

    displayHistory();
    if (searchHistory.length > 0) {
        callOpenWeather(searchHistory[searchHistory.length - 1]);
    }

    // Search starts here
    function callOpenWeather(cityName) {

        let call1 = api1 + cityName + "&units=imperial" + "&appid=" + apiKey;
        
        fetch (call1)

        .then(function(response){
            return response.json();
        })

        .then(function(response) {

            // Determine the searchDate using MomentJS
            let searchDate = moment().add(10, 'days').calendar();
            console.log = (searchDate);

            // Display City Name and searchDate
            citynameField.innerHTML = response.name + "(" + searchDate + ")";
            
            // Display the Weather Icon
            let weatherThumb = response.weather[0].icon;
            weatherIcon.setAttribute("src","https://openweathermap.org/img/wn/" + weatherThumb + "@2x.png");

            // Display Temperature
            temperatureField.innerHTML = "Temperature: "+ response.main.temp + "&#176F";

            // Display Humidity
            humidityField.innerHTML = "Humidity: "+ response.main.humidity + "%";

            // Display Wind Speed
            windspeedField.innerHTML = "Wind Speed: "+ response.wind.speed + " MPH";

            // Make another API call to fetch UV data
            // Start by setting up two required variables
            let lat = response.coord.lat;
            let lon = response.coord.lon;

            let call2 = api2 + lat + "&lon=" + lon + "&exclude=hourly,daily" + "&appid=" + apiKey;

            return fetch (call2);

        })

        // Log the UV Data
        .then(function(response2) {
            return response2.json();
        })

        .then(function(response2) {
            let uvBadge = document.createElement("span");

            // This determines the bg color of the badge
            if (response2.current.uvi >= "6") {
                uvBadge.setAttribute("class","bg-danger");
            } else if (response2.current.uvi >= "3") {
                uvBadge.setAttribute("class","bg-warning");
            } else {
                uvBadge.setAttribute("class","bg-success");
            }

            uvBadge.innerHTML = response2.current.uvi;
            uvindexField.innerHTML = "UV Index: ";
            uvindexField.append(uvBadge);

            // Make another API call to fetch the 5-Day forecast
            let call3 = api3 + cityName + "&units=imperial" + "&appid=" + apiKey;

            return fetch (call3);

        })
        .then(function(response3) {
            return response3.json()

        })

        // Log the 5-Day forecast Data
        .then(function(response3) {
            let fiveForecast = document.querySelectorAll(".fivedaybadge");

            // For loop to get the number of forecast
            for (i=0; i<fiveForecast.length; i++) {
                fiveForecast[i].innerHTML = "";
                let fivedayCount = i*8 + 4;

                // Get the date format for each forecast
                let fivedayDate = new Date(response3.list[fivedayCount].dt * 1000);
                let fivedayMonth = fivedayDate.getMonth() + 1;
                let fivedayDay = fivedayDate.getDate();
                let fivedayYear = fivedayDate.getFullYear();

                // Populate the HTML
                let fivedayDateEl = document.createElement("p");
                fivedayDateEl.setAttribute("class","mt-3 mb-0 fs-4 forecast-date");
                fivedayDateEl.innerHTML = fivedayMonth + "/" + fivedayDay + "/" + fivedayYear;
                fiveForecast[i].append(fivedayDateEl);

                // Populate the Forecast imgs
                let forecastWeatherEl = document.createElement("img");
                forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response3.list[fivedayCount].weather[0].icon + "@2x.png");
                forecastWeatherEl.setAttribute("alt",response3.list[fivedayCount].weather[0].description);
                fiveForecast[i].append(forecastWeatherEl);

                // Populate the Temperature
                let forecastTempEl = document.createElement("p");
                forecastTempEl.innerHTML = "Temp:" + response3.list[fivedayCount].main.temp + " &#176F";
                fiveForecast[i].append(forecastTempEl);

                // Populate the Humidity
                let forecastHumidityEl = document.createElement("p");
                forecastHumidityEl.innerHTML = "Humidity: " + response3.list[fivedayCount].main.humidity + "%";
                fiveForecast[i].append(forecastHumidityEl);
            }

        })

    }

}

start(); 