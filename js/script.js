//API Variables
var API_KEY = '8465a1e1f57bb056a199f44824facdf1';
const KEY_HISTORY = 'search-history';

//Query Selectors
var searchFormEl = document.querySelector('#searchForm');
var historyButtonsEl = document.querySelector('#historyButtons');
var cityInputEl = document.querySelector('#city');
var weatherContainerEl = document.querySelector('#weatherContainer');
var forecastContainerEl = document.querySelector('#forecastContainer');

const city = {
  name: null,
  forecast: false,
};

const cityWeather = {
  date: "",
  hour: "",
  temp: 0,
  wind: 0,
  humidity: 0,
  icon: "",
  iconalt: "",
};

var formSubmit = function (event) {
  event.preventDefault();

  city.name = cityInputEl.value.trim();  

  if (city.name) {
    getCityWeather(city);

    weatherContainerEl.textContent = '';
    forecastContainerEl.textContent = '';
    cityInputEl.value = '';
    
    var storage = readStorage(KEY_HISTORY);
    if(storage.length < 10){
      storage.push(city.name);
    }else{
      storage.shift();
      storage.push(city.name);
    }    
    saveToStorage(KEY_HISTORY, storage);

    displayHistoryButtons();
  } else {
    alert('Please enter a City name');
  }
};

function readStorage(key) {
  var data = localStorage.getItem(key);
  if (data) { data = JSON.parse(data) }
  else { data = [] }
  return data;
};

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};

function displayHistoryButtons() {
  historyButtonsEl.textContent = '';
  var storage = readStorage(KEY_HISTORY);

  for (var x in storage){
    var buttonEl = document.createElement('button');
    buttonEl.classList = 'btn history-btn';
    buttonEl.setAttribute('data-language',storage[x]);
    buttonEl.textContent = storage[x];

    historyButtonsEl.appendChild(buttonEl);
  }
};

var getCityWeather = function (cityObj) {

    var baseURL = 'https://api.openweathermap.org/data/2.5/';
    var options = 
      '?q=' + cityObj.name      
      + '&units=' + 'imperial'
      + '&appid=' + API_KEY;
    var weatherURL = baseURL + 'weather' + options;
    var forecastURL = baseURL + 'forecast' + options;

    fetch(weatherURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {        
          cityObj.forecast = false;
          displayCityWeather(data, cityObj);          
        });
      } else {
        weatherContainerEl.innerHTML = '<h2>No city with that name found.</h2>';
      }
    })
    .catch(function (error) { alert('Unable to connect to OpenWeather'); });

    fetch(forecastURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {        
          cityObj.forecast = true;
          displayCityForecast(data, cityObj);          
        });
      }
    })
    .catch(function (error) { alert('Unable to connect to OpenWeather'); });

};

var displayCityWeather = function (weatherObj, cityObj) {

  cityWeather.date = dayjs.unix(weatherObj.dt).format("MM/DD/YYYY");
  cityWeather.temp = weatherObj.main.temp;
  cityWeather.wind = weatherObj.wind.speed;
  cityWeather.humidity = weatherObj.main.humidity;
  cityWeather.icon = weatherObj.weather[0].icon;
  cityWeather.icon = "http://openweathermap.org/img/wn/" + cityWeather.icon + "@2x.png";
  cityWeather.iconalt = weatherObj.weather[0].description;

  createHTML(cityWeather, cityObj);
    
}

var displayCityForecast = function (weatherObj, cityObj) {

  var headerEl = document.createElement('h3');
  headerEl.textContent = "5-Day Forecast (all times Noon UTC):";
  var divRowEl = document.createElement('div');
  divRowEl.classList = 'row';    
  forecastContainerEl.appendChild(headerEl);
  forecastContainerEl.appendChild(divRowEl);

  for (var i = 0; i < weatherObj.list.length; i++) {
    
    cityWeather.hour = weatherObj.list[i].dt_txt;
    cityWeather.hour = cityWeather.hour.split(' ')[1];
    cityWeather.date = dayjs.unix(weatherObj.list[i].dt).format("MM/DD/YYYY");

    if(cityWeather.hour === "12:00:00"){      

      cityWeather.temp = weatherObj.list[i].main.temp;
      cityWeather.wind = weatherObj.list[i].wind.speed;
      cityWeather.humidity = weatherObj.list[i].main.humidity;
      cityWeather.icon = weatherObj.list[i].weather[0].icon
      cityWeather.icon = "http://openweathermap.org/img/wn/" + cityWeather.icon + ".png";
      cityWeather.iconalt = weatherObj.list[i].weather[0].description;

      createHTML(cityWeather, cityObj); 
    }
  }
};

var createHTML = function (weatherObj, cityObj) {
  var titleEl = document.createElement('h2');
  var titleElOptions = 
    "<img "
    + "src='" + weatherObj.icon + "' "
    + "alt='" + weatherObj.iconalt + "'"
    + ">";
  if(cityObj.forecast){
    titleEl.innerHTML = 
      " (" + weatherObj.date + ") "
      + titleElOptions;
  }else{
    titleEl.innerHTML = 
      cityObj.name
      + " (" + weatherObj.date + ") "
      + titleElOptions;
  }        

  var tempEl = document.createElement('p');
  tempEl.innerHTML =
    "Temp: " + weatherObj.temp + " &#176;F";    

  var windEl = document.createElement('p');
  windEl.innerHTML = 
    "Wind: " + weatherObj.wind + " MPH";    

  var humidityEl = document.createElement('p');
  humidityEl.innerHTML = 
    "Humidity: " + weatherObj.humidity + " %";  

  if(!cityObj.forecast){    
    weatherContainerEl.appendChild(titleEl);
    weatherContainerEl.appendChild(tempEl);
    weatherContainerEl.appendChild(windEl);
    weatherContainerEl.appendChild(humidityEl);
  }else{
    
    var cardEl = document.createElement('div');
    cardEl.classList = 'card col-md-6 col-lg-4';
    var cardBodyEl = document.createElement('div');
    cardBodyEl.classList = 'card-body';

    cardBodyEl.appendChild(titleEl);
    cardBodyEl.appendChild(tempEl);
    cardBodyEl.appendChild(windEl);
    cardBodyEl.appendChild(humidityEl);

    cardEl.appendChild(cardBodyEl);

    var forecastContainerRowEl = document.querySelector('#forecastContainer').children[1];
    forecastContainerRowEl.appendChild(cardEl);
  }
}

searchFormEl.addEventListener('submit', formSubmit);

historyButtonsEl.addEventListener('click', function (event) {
    city.name = event.target.getAttribute('data-language');
  
    if (city.name) {
      getCityWeather(city); 
  
      weatherContainerEl.textContent = '';
      forecastContainerEl.textContent = '';
    }
  });

displayHistoryButtons();