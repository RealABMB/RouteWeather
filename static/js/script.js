const titleButton = document.getElementsByClassName('primary-button')


function loadImprove(){
    document.getElementById("improve-popup").hidden = false
    document.getElementById("improve-overlay").hidden = false
   
}

function closeImprovePopup(){
    document.getElementById("improve-popup").hidden = true
    document.getElementById("improve-overlay").hidden = true
 }


const instructionsPopup = document.createElement("div")
instructionsPopup.innerHTML = `
    <div class="popup-container">
    <p class="instructions-window-title">How to use</p>

    <div class="instruction">
      <img class="instructions-image" src="static/images/EnterOriginDest.png">
      <div class="instructions-text">Enter the route of your road trip. Origin in the top box and destination in the bottom box.</div>
    </div>

    <div class="instruction">
      <img class="instructions-image" src="static/images/RouteLineScreenshot.png">
      <div class="instructions-text">A route with all the cities along the way will be displayed. Purple waypoints represent all the cities. Green waypoints represent cities that are equally distributed along the route.</div>
    </div>

    <div class="instruction">
      <img class="instructions-image" src="static/images/originWeather.png">
      <div class="instructions-text">Weather information on the origin, destination and green waypoints will be displayed below.</div>
    </div>

    <div class="instruction">
      <img class="instructions-image" src="static/images/ChangeRoute.png">
      <div class="instructions-text">To change the route so you hit waypoints you want, simply drag a point on the blue line to the city you would like to go to on the way.</div>
    </div>

    <button class="third-button instructions-next-button" onclick="loadInstructionsNext()">Next</button>
  </div>
  <div class="overlay"></div>
  `

document.body.appendChild(instructionsPopup)
instructionsPopup.hidden = true

function loadInstructions(){
    instructionsPopupNext.hidden = true
    instructionsPopup.hidden = false
}


function closeInstructions(){
    instructionsPopupNext.hidden = true
}


const instructionsPopupNext = document.createElement("div")
instructionsPopupNext.innerHTML = 
` <div class="popup-container">
<p class="instructions-window-title">How to use</p>

<div class="instruction">
  <img class="instructions-image" src="static/images/GetWeather.png">
  <div class="instructions-text">To see the full weather data for any waypoint on the map, double tap the waypoint marker. To see the full weather data for the cities already shown, double click the surrounding box.</div>
</div>

<div class="instruction">
  <img class="instructions-image" src="static/images/WeatherButton.png">
  <div class="instructions-text">To see weather data make sure the button says “Switch to POI search”, clicking the button will change it to POI search and clicking it again will switch to weater search.</div>
</div>

<div class="instruction">
  <img class="instructions-image" src="static/images/PoiSearch.png">
  <div class="instructions-text">If you wish to see the surrounding POIs for a city, set the button to POI search, select a POI type in the drop down below and double tap the marker of the city you would like.</div>
</div>

<div class="instruction">
  <img class="instructions-image" src="static/images/GreenPoi.png">
  <div class="instructions-text">Green markers represent POIs,</div>
</div>

<div id="instructions-button-container">
  <button class="third-button" id="instructions-back-button" onclick="loadInstructions()">Back</button>
  <button class="third-button instructions-next-button" onclick="closeInstructions()">Close</button>
</div> 
</div>
<div class="overlay"></div>`
document.body.appendChild(instructionsPopupNext)
instructionsPopupNext.hidden = true

function loadInstructionsNext(){
   instructionsPopup.hidden = true
   instructionsPopupNext.hidden = false
}

function loadReport(){
    document.getElementById("report-popup").hidden = false
    document.getElementById("report-overlay").hidden = false
}

function closeReportPopup(){
    document.getElementById("report-popup").hidden = true
    document.getElementById("report-overlay").hidden = true
}


var polyline; //Polyline reader
let geocoderList = []; //Data from polyline
let orgPoint = []; //Origin point coordinates
let destPoint = []; //Destination point coordinates
let latPoints = []; //Polyline latitude points
let lonPoints = []; //Polyline longitude points
let latWayPoints = []; //Lat points of cities along the route
let lonWayPoints = []; //Lon points of cities along the route
let wayPointMarkers = []; //Markers added to the map
let exactWayPoints = []; //Merged lat and lon points of cities along the route
let endSort = []; //Origin and destination point longitude points
let elementList = []; //All cloned HTML elements 
let cityNames = []; //Names of waypoint cities
let endSortLat = []; //Sorted array of destination and origin lats
let newTabPlaceNames = []; //Place names for weather search new tab
var tab = null // Boolean for newtab
var weatherSearch = true // Boolean for weatehr search
let poiMarkers = [] //POI placing markers
var originAdded = false
var destAdded = false
var clearMarkers = false
var POI = null

const time = new Date(); //Date for time

//List of days to pick from to display
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

//Get day, hour, ampm
var day = time.getDay();
var hour = time.getHours();
const ampm = hour >= 12 ? 'PM' : 'AM'

//Variable to determine is am or pm should be used
var ampmHourly = null

//Variable to determine hour to display
var currenthour = hour

//Set hour to 12 hour clock
hour = (hour % 12) || 12;

//Variable to determine if alert message for poi has already been sent
var alertmsg = true

const selected = document.querySelector(".selected"); //POI options selected
const optionsContainer = document.querySelector(".options-container"); //POi options container
const searchBox = document.querySelector(".search-box input"); //POI options search box
var POI = null;


const optionsList = document.querySelectorAll(".option"); //POI options
const button = document.getElementById('switch-button') //Switch button
button.disabled = true //Disable button at start

const container = document.getElementsByClassName("container") //Waypoints weather item container
const containerOD = document.getElementsByClassName("containerOD") //Origin and destination weather item container
const forecast = document.getElementsByClassName("future-forecast") 
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

//Openweathermap api key
const API_KEY = '007bc901960cea6e7f996fde36d76ed7';

//Mapbox api key
mapboxgl.accessToken =
    "pk.eyJ1IjoibGlscGVzaCIsImEiOiJjbDFvN2oxY2MwNDZpM2p1aXFlZ3M1bXZxIn0.-gV7jGrALXS7PCVi3qjfsw"

//Get position current position
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
})

//Setup map using current position
function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude])
}

//Setup map if position is not found
function errorLocation() {
    setupMap([-2.24, 53.48])
}

//Add to container and add styling 
function setupMap(center) {
    map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: 15
    })

    map.on('load', function () {
        newTab = false
    })


    //Add map navigation control
    var nav = new mapboxgl.NavigationControl()
    map.addControl(nav)

    //Add mapbox directions for driving only
    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        profile: 'mapbox/driving',
        controls: {
            profileSwitcher: false
        }
    })
    map.addControl(directions, "top-left")

    //When route is generated...
    directions.on('route', async (event) => {
        //Enable switch button
        button.disabled = false

        //Check if weather items need to be deleted and delete
        if (elementList.length !== 0) {
            for (let a = 0; a < elementList.length; a++) {
                forecast[0].parentNode.removeChild(forecast[0])
            }
        }

        //Reset variables
        latPoints = []
        lonPoints = []
        latWayPoints = []
        lonWayPoints = []
        exactWayPoints = []
        endSort = []
        endSortLat = []
        orgPoint = [];
        destPoint = [];
        elementList = [];
        finalWayPoints = [];
        newTabPlaceNames = [];
        cityNames = [];
        newTab = false;

        //Get origin point and store
        orgPoint.push(directions.getOrigin())

        //Get destination point and store
        destPoint.push(directions.getDestination())

        console.log(orgPoint, destPoint)

        //Push lon and lat of origin and destination into seperate arrays to be sorted
        endSort.push(orgPoint['0'].geometry.coordinates[0], (destPoint['0'].geometry.coordinates[0]))
        endSortLat.push(orgPoint['0'].geometry.coordinates[1], (destPoint['0'].geometry.coordinates[1]))

        //Sort by smallest to largest
        endSort.sort(function(c, d) {
            return c - d
        });
        endSortLat.sort(function(c, d) {
            return c - d
        });

               //Clear all currently placed markers 
    if (wayPointMarkers.length !== 0) {
        for (var l = wayPointMarkers.length - 1; l >= 0; l--) {
            wayPointMarkers[l].remove()
        }
    }

    if (poiMarkers.length !== 0) {
        for (var l = poiMarkers.length - 1; l >= 0; l--) {
            poiMarkers[l].remove()
            clearMarkers = false
        }
    }

        //See if mapbox is able to generate a route
        try {
            //Store polyline
            geocoderList = polyline.decode(event.route[0].geometry)
                  //Check if route is large enough to calculate weather using sorted lat lng arrays
        if ((endSort[1] - endSort[0]) < 1 && (endSortLat[1] - endSortLat[0]) < 1) {
            alert('Route is too small to calculate weather.')
        } else {
            if (orgPoint.length === 1 && destPoint.length === 1) {
                //Get weather data for origin
                getWeatherData()
                //Get weather data for destination
                getWeatherData2()
                //Find evenly spaced waypoints of map
                addWayPoints()
            }
        }
        } catch (err) {
          if (orgPoint.length === 1 && destPoint.length === 1) {
                //Get weather data for origin
                getWeatherData()
                //Get weather data for destination
                getWeatherData2()
          }
            //Display error
            alert("There is no drivable route between these two places.");
        }

        setInterval(12)
    })
}


function getWeatherData() {
    //Set latitude and longitude of origin point
    let latitude = (orgPoint['0'].geometry.coordinates[1])
    let longitude = (orgPoint['0'].geometry.coordinates[0])

    markers = new mapboxgl.Marker({
        color: "#3F37C9",
        draggable: false,
    })
    markers.setLngLat([longitude, latitude])
        .addTo(map);
    
    //Push markers to an array to be deleted later
    wayPointMarkers.push(markers)

    //Fetch weather from openweather map api
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {
        //Function to show the data received for origin 
        console.log(data)
        showWeatherData(data);
    })
}

function showWeatherData(data) {
    //Create a div
    let element = document.createElement('div')

    //Set properties 
    element.className = 'future-forecast'
    element.id = 'future_forecast'

    //Add to the origin and destination container
    containerOD[0].appendChild(element);

    //Order element so it appears first
    element.style.order = 0

    //Push to an array to be deleted
    elementList.push(element)

    //Variable for html to be added
    var otherDayForcast = ''

    //Add html
    otherDayForcast += `
  <div class="city-container" id="city-container"> 
    <div class ="city-type">Origin</div>
  </div>
<div class="weather-forecast" id="weather-forecast">
  `
    //For each day add html element
    data.daily.forEach((day) => {
        otherDayForcast += `
      <div class="weather-forecast-item">
          <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
          <div class="temp">Night: ${day.temp.night}&#176;C</div>
          <div class="temp">Day: ${day.temp.day}&#176;C</div>
          <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
          <div class="temp">Humidity: ${day.humidity}</div>
          <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
      </div>
      `
    })

    //Set the html
    element.innerHTML = otherDayForcast;


    element.addEventListener('dblclick', () => {
        //Get day, hour, ampm
var day = time.getDay();
var hour = time.getHours();
const ampm = hour >= 12 ? 'PM' : 'AM'

//Variable to determine is am or pm should be used
var ampmHourly = null

//Variable to determine hour to display
var currenthour = hour

//Set hour to 12 hour clock
hour = (hour % 12) || 12;

       if (newTab === true && tab.closed === true) {
           //Reset variables
           newTab = false
           originAdded = false
           destAdded = false
           newTabPlaceNames = []
       }
   
       if (weatherSearch === true) {
           if (newTab === false & originAdded === false){
               //Open a new tab
               tab = window.open("", "");
               //Create a div
               var newContainer = tab.document.createElement('div')
               //Set div class to style
               newContainer.className = "container-new-tab"
   
                //Get city weather including hourly
                
                  //Variable for html
                  var otherDayForcast = ''
   
                  //Add html to the variable
                  otherDayForcast += `
   <html lang="en">
   <head>
   <link rel="stylesheet" href="static/css/main.css">
   <script src="script.js"></script>
   <title>RouteWeather Hourly</title>
   <h1>Weather Tab</h1>
   <h5 id="weather-tab-sub">Weather for all desired places will be posted here. If you close this tab, then all of the previous data displayed will be cleared.</h5>
   <div class="container-new-tab">
   <div class="city-container-new" id="city-container-new"> 
   <div class="city-name-new">Origin</div>
   <div class ="forecast-type-new">7 Day Forecast</div>
   </div>
   <div id="daily-weather-new">
   `                 //For each day add html element
                  data.daily.forEach((day) => {
                      otherDayForcast += `
                      <div class="weather-forecast-item-new ">
                      <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                      <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                      <div class="temp">Day: ${day.temp.day}&#176;C</div>
                      <div class="temp">Night: ${day.temp.night}&#176;C</div>
                      <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                      <div class="temp">Humidity: ${day.humidity}%</div>
                      <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
                  </div> 
   `
                  })
                  otherDayForcast+= ` </div> 
                  <div class="city-container-new" id="city-container-new"></div> 
                  <div class ="forecast-type-new">Hourly Forecast</div>
                  <div class="hourly-weather-new"> 
                  `
   
                  //For each hour (48) add html element
                  for (let y = 0; y < (data.hourly.length); y++) {
                      //If the hour is the current hour
                      if (y == 0) {
                          otherDayForcast += `
    
    <div class="weather-hourly-forecast-item-new">
    <div class="day">${days[day]}</div>
    <div class="hour"><span>${hour} ${ampm}</span></div>
    <img src="http://openweathermap.org/img/wn//${data.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
    <div class="temp">Temp:  ${data.hourly[0].temp}&#176;C</div>
    <div class="temp">Feels-Like: ${Math.round(data.hourly[0].feels_like)}&#176;C</div>
    <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
    </div>
    
    `                    
                      //If the hour is after the current hour open
                      } else {
                          //Take the currenthour and add 1 until 24
                          if (currenthour <= 24) {
                              currenthour += 1
                              //Once 24 hours has been reached, show next day
                              if (currenthour == 24) {
                                  day += 1
                                  if (day == 7) {
                                      day = 0
                                  }
                              }
   
                              //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                              if (currenthour > 24 && currenthour < 48) {
                                  currenthour = currenthour - 24
                              }
                          }
                          
                          //Get the ampm depending on the hour
                          if (currenthour >= 12 && currenthour < 24) {
                              ampmHourly = 'PM'
                          } else {
                              ampmHourly = 'AM'
                          }
   
                          //Create a variable to show the current hour in a 12 hour format
                          currenthourdisplay = (currenthour % 12) || 12;
   
                          //Add html for the hours to the variable
                          otherDayForcast += `
    <div class="weather-hourly-forecast-item-new">
    <div class="day">${days[day]}</div>
    <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
    <img src="http://openweathermap.org/img/wn/${data.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
    <div class="temp">Temp:  ${data.hourly[y].temp}&#176;C</div>
    <div class="temp">Feels-Like: ${Math.round(data.hourly[y].feels_like)}&#176;C</div>
    <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
    </div>
    `
                      }
                  }
   
                  otherDayForcast += `</div>`
   
                  //Add the html to the newtab
                  tab.document.write(otherDayForcast)
   
              //Show that newtab has been opened
              newTab = true
              originAdded = true
   
   
               
           } else if(newTab === true && originAdded === false){
               //Create a div
               var newContainer = tab.document.createElement('div')
               //Set div class to style
               newContainer.className = "container-new-tab"
   
                //Get city weather including hourly
                
                  //Variable for html
                  var otherDayForcast = ''
   
                  //Add html to the variable
                  otherDayForcast += `
   <div class="container-new-tab">
   <div class="city-container-new" id="city-container-new"> 
   <div class="city-name-new">Origin</div>
   <div class ="forecast-type-new">7 Day Forecast</div>
   </div>
   <div id="daily-weather-new">
   `                 //For each day add html element
                  data.daily.forEach((day) => {
                      otherDayForcast += `
                      <div class="weather-forecast-item-new ">
                      <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                      <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                      <div class="temp">Day: ${day.temp.day}&#176;C</div>
                      <div class="temp">Night: ${day.temp.night}&#176;C</div>
                      <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                      <div class="temp">Humidity: ${day.humidity}%</div>
                      <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
                  </div> 
   `
                  })
                  otherDayForcast+= ` </div> 
                  <div class="city-container-new" id="city-container-new"></div> 
                  <div class ="forecast-type-new">Hourly Forecast</div>
                  <div class="hourly-weather-new"> 
                  `
   
                  //For each hour (48) add html element
                  for (let y = 0; y < (data.hourly.length); y++) {
                      //If the hour is the current hour
                      if (y == 0) {
                          otherDayForcast += `
    
    <div class="weather-hourly-forecast-item-new">
    <div class="day">${days[day]}</div>
    <div class="hour"><span>${hour} ${ampm}</span></div>
    <img src="http://openweathermap.org/img/wn//${data.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
    <div class="temp">Temp:  ${data.hourly[0].temp}&#176;C</div>
    <div class="temp">Feels-Like: ${Math.round(data.hourly[0].feels_like)}&#176;C</div>
    <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
    </div>
    
    `                    
                      //If the hour is after the current hour open
                      } else {
                          //Take the currenthour and add 1 until 24
                          if (currenthour <= 24) {
                              currenthour += 1
                              //Once 24 hours has been reached, show next day
                              if (currenthour == 24) {
                                  day += 1
                                  if (day == 7) {
                                      day = 0
                                  }
                              }
   
                              //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                              if (currenthour > 24 && currenthour < 48) {
                                  currenthour = currenthour - 24
                              }
                          }
                          
                          //Get the ampm depending on the hour
                          if (currenthour >= 12 && currenthour < 24) {
                              ampmHourly = 'PM'
                          } else {
                              ampmHourly = 'AM'
                          }
   
                          //Create a variable to show the current hour in a 12 hour format
                          currenthourdisplay = (currenthour % 12) || 12;
   
                          //Add html for the hours to the variable
                          otherDayForcast += `
    <div class="weather-hourly-forecast-item-new">
    <div class="day">${days[day]}</div>
    <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
    <img src="http://openweathermap.org/img/wn/${data.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
    <div class="temp">Temp:  ${data.hourly[y].temp}&#176;C</div>
    <div class="temp">Feels-Like: ${Math.round(data.hourly[y].feels_like)}&#176;C</div>
    <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
    </div>
    `
                      }
                  }
   
                  otherDayForcast += `</div>`
   
                   //Add the html to the pre-exisiting newtab
                   tab.document.body.innerHTML += otherDayForcast;
                   originAdded = true
   
           }
       } else {
           //If the user inputed something into the poi searchbox
           if (POI !== null) {
            clearMarkers = true
               //Fetch a list of nearby pois of that type using mapbox geocoder
               fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${POI}.json?type=poi&proximity=${orgPoint['0'].geometry.coordinates[0]},${orgPoint['0'].geometry.coordinates[1]}&access_token=${mapboxgl.accessToken}`).then(res => res.json()).then(data => {
                   
                   //For each poi returned, add an orange marker to the pax
                   for (let d = 0; d < (data.features.length); d++) {
                       markers2 = new mapboxgl.Marker({
                           color: "#99FFDE",
                           draggable: false
                       })
                       markers2.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                           .addTo(map);
                       //Push to an array to be deleted later
                       poiMarkers.push(markers2)
   
                       //Add event listen for on hover
                       markers2.getElement().addEventListener('mouseenter', () => {
                           //Create a popup with the details of the poi
                           poiMarker = new mapboxgl.Popup({
                               closeOnclick: false
                           })
                           poiMarker.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                           poiMarker.setHTML(`<p>${data.features[d].place_name}</p>`)
   
                               .addTo(map);
                       })
                       //Add an event listen for on hover off
                       markers2.getElement().addEventListener('mouseleave', () => {
                           //Remove the popup
                           poiMarker.remove()
                       })
                   }
   
               })
           //If the user did not select a poi
           } else {
               console.log('yes')
               //If alert message is needed (not already been shown)
               if (alertmsg === true) {
                   console.log('on')
                   //Show alert message
                   alert("Please select a POI type to look for.")
               } else{console.log('off')}
   
           }
   
       }
   })
   
}


function getWeatherData2() {
    //Set latitude and longitude of destination point
    let latitude = (destPoint['0'].geometry.coordinates[1])
    let longitude = (destPoint['0'].geometry.coordinates[0])

    markers = new mapboxgl.Marker({
        color: "#3F37C9",
        draggable: false,
    })
    markers.setLngLat([longitude, latitude])
        .addTo(map);
    
    //Push markers to an array to be deleted later
    wayPointMarkers.push(markers)

    //Fetch weather from openweather map api
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {
        //Function to show the data received 
        showWeatherData2(data);
    })

}

function showWeatherData2(data) {
    //Create a div 
    let element = document.createElement('div')

     //Set properties 
    element.className = 'future-forecast'
    element.id = 'future_forecast'

    //Add to the origin and destination container
    containerOD[0].appendChild(element);

    //Order element so it appears second 
    element.style.order = 2

    //Push to an array to be deleted
    elementList.push(element)

    //Variable for html to be added
    var otherDayForcast = ''

    //Add html
    otherDayForcast += `
  <div class="city-container" id="city-container"> 
    <div class ="city-type">Destination</div>
  </div>
  <div class="weather-forecast" id="weather-forecast">
  `
    //For each day add html element
    data.daily.forEach((day) => {
        otherDayForcast += `
      <div class="weather-forecast-item">
          <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
          <div class="temp">Night: ${day.temp.night}&#176;C</div>
          <div class="temp">Day: ${day.temp.day}&#176;C</div>
          <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
          <div class="temp">Humidity: ${day.humidity}</div>
          <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
      </div>
      `
    })

    //Set the html
    element.innerHTML = otherDayForcast;

 element.addEventListener('dblclick', () => {
    //Get day, hour, ampm
var day = time.getDay();
var hour = time.getHours();
const ampm = hour >= 12 ? 'PM' : 'AM'

//Variable to determine is am or pm should be used
var ampmHourly = null

//Variable to determine hour to display
var currenthour = hour

//Set hour to 12 hour clock
hour = (hour % 12) || 12;

    if (newTab === true && tab.closed === true) {
        //Reset variables
        newTab = false
        destAdded = false
        originAdded = false
        newTabPlaceNames = []
    }

    if (weatherSearch === true) {
        if (newTab === false & destAdded === false){
            //Open a new tab
            tab = window.open("", "");
            //Create a div
            var newContainer = tab.document.createElement('div')
            //Set div class to style
            newContainer.className = "container-new-tab"

             //Get city weather including hourly
             
               //Variable for html
               var otherDayForcast = ''

               //Add html to the variable
               otherDayForcast += `
<html lang="en">
<head>
<link rel="stylesheet" href="static/css/main.css">
<script src="script.js"></script>
<title>RouteWeather Hourly</title>
<h1>Weather Tab</h1>
<h5 id="weather-tab-sub">Weather for all desired places will be posted here. If you close this tab, then all of the previous data displayed will be cleared.</h5>
<div class="container-new-tab">
<div class="city-container-new" id="city-container-new"> 
<div class="city-name-new">Destination</div>
<div class ="forecast-type-new">7 Day Forecast</div>
</div>
<div id="daily-weather-new">
`                 //For each day add html element
               data.daily.forEach((day) => {
                   otherDayForcast += `
                   <div class="weather-forecast-item-new ">
                   <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                   <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                   <div class="temp">Day: ${day.temp.day}&#176;C</div>
                   <div class="temp">Night: ${day.temp.night}&#176;C</div>
                   <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                   <div class="temp">Humidity: ${day.humidity}%</div>
                   <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
               </div> 
`
               })
               otherDayForcast+= ` </div> 
               <div class="city-container-new" id="city-container-new"></div> 
               <div class ="forecast-type-new">Hourly Forecast</div>
               <div class="hourly-weather-new"> 
               `

               //For each hour (48) add html element
               for (let y = 0; y < (data.hourly.length); y++) {
                   //If the hour is the current hour
                   if (y == 0) {
                       otherDayForcast += `
 
 <div class="weather-hourly-forecast-item-new">
 <div class="day">${days[day]}</div>
 <div class="hour"><span>${hour} ${ampm}</span></div>
 <img src="http://openweathermap.org/img/wn//${data.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
 <div class="temp">Temp:  ${data.hourly[0].temp}&#176;C</div>
 <div class="temp">Feels-Like: ${Math.round(data.hourly[0].feels_like)}&#176;C</div>
 <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
 </div>
 
 `                    
                   //If the hour is after the current hour open
                   } else {
                       //Take the currenthour and add 1 until 24
                       if (currenthour <= 24) {
                           currenthour += 1
                           //Once 24 hours has been reached, show next day
                           if (currenthour == 24) {
                               day += 1
                               if (day == 7) {
                                   day = 0
                               }
                           }

                           //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                           if (currenthour > 24 && currenthour < 48) {
                               currenthour = currenthour - 24
                           }
                       }
                       
                       //Get the ampm depending on the hour
                       if (currenthour >= 12 && currenthour < 24) {
                           ampmHourly = 'PM'
                       } else {
                           ampmHourly = 'AM'
                       }

                       //Create a variable to show the current hour in a 12 hour format
                       currenthourdisplay = (currenthour % 12) || 12;

                       //Add html for the hours to the variable
                       otherDayForcast += `
 <div class="weather-hourly-forecast-item-new">
 <div class="day">${days[day]}</div>
 <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
 <img src="http://openweathermap.org/img/wn/${data.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
 <div class="temp">Temp:  ${data.hourly[y].temp}&#176;C</div>
 <div class="temp">Feels-Like: ${Math.round(data.hourly[y].feels_like)}&#176;C</div>
 <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
 </div>
 `
                   }
               }

               otherDayForcast += `</div>`

               //Add the html to the newtab
               tab.document.write(otherDayForcast)

           //Show that newtab has been opened
           newTab = true
           destAdded = true
            
        } else if(newTab === true && destAdded === false){
            //Create a div
            var newContainer = tab.document.createElement('div')
            //Set div class to style
            newContainer.className = "container-new-tab"

             //Get city weather including hourly
             
               //Variable for html
               var otherDayForcast = ''

               //Add html to the variable
               otherDayForcast += `
<div class="container-new-tab">
<div class="city-container-new" id="city-container-new"> 
<div class="city-name-new">Destination</div>
<div class ="forecast-type-new">7 Day Forecast</div>
</div>
<div id="daily-weather-new">
`                 //For each day add html element
               data.daily.forEach((day) => {
                   otherDayForcast += `
                   <div class="weather-forecast-item-new ">
                   <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                   <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                   <div class="temp">Day: ${day.temp.day}&#176;C</div>
                   <div class="temp">Night: ${day.temp.night}&#176;C</div>
                   <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                   <div class="temp">Humidity: ${day.humidity}%</div>
                   <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
               </div> 
`
               })
               otherDayForcast+= ` </div> 
               <div class="city-container-new" id="city-container-new"></div> 
               <div class ="forecast-type-new">Hourly Forecast</div>
               <div class="hourly-weather-new"> 
               `

               //For each hour (48) add html element
               for (let y = 0; y < (data.hourly.length); y++) {
                   //If the hour is the current hour
                   if (y == 0) {
                       otherDayForcast += `
 
 <div class="weather-hourly-forecast-item-new">
 <div class="day">${days[day]}</div>
 <div class="hour"><span>${hour} ${ampm}</span></div>
 <img src="http://openweathermap.org/img/wn//${data.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
 <div class="temp">Temp:  ${data.hourly[0].temp}&#176;C</div>
 <div class="temp">Feels-Like: ${Math.round(data.hourly[0].feels_like)}&#176;C</div>
 <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
 </div>
 
 `                    
                   //If the hour is after the current hour open
                   } else {
                       //Take the currenthour and add 1 until 24
                       if (currenthour <= 24) {
                           currenthour += 1
                           //Once 24 hours has been reached, show next day
                           if (currenthour == 24) {
                               day += 1
                               if (day == 7) {
                                   day = 0
                               }
                           }

                           //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                           if (currenthour > 24 && currenthour < 48) {
                               currenthour = currenthour - 24
                           }
                       }
                       
                       //Get the ampm depending on the hour
                       if (currenthour >= 12 && currenthour < 24) {
                           ampmHourly = 'PM'
                       } else {
                           ampmHourly = 'AM'
                       }

                       //Create a variable to show the current hour in a 12 hour format
                       currenthourdisplay = (currenthour % 12) || 12;

                       //Add html for the hours to the variable
                       otherDayForcast += `
 <div class="weather-hourly-forecast-item-new">
 <div class="day">${days[day]}</div>
 <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
 <img src="http://openweathermap.org/img/wn/${data.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
 <div class="temp">Temp:  ${data.hourly[y].temp}&#176;C</div>
 <div class="temp">Feels-Like: ${Math.round(data.hourly[y].feels_like)}&#176;C</div>
 <div class="temp">POP: ${Math.round(data.hourly[y].pop * 100)}%</div>
 </div>
 `
                   }
               }

               otherDayForcast += `</div>`

                //Add the html to the pre-exisiting newtab
                tab.document.body.innerHTML += otherDayForcast;
                destAdded = true

        }
    } else {
        //If the user inputed something into the poi searchbox
        if (POI !== null) {

            clearMarkers = true
            //Fetch a list of nearby pois of that type using mapbox geocoder
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${POI}.json?type=poi&proximity=${destPoint['0'].geometry.coordinates[0]},${destPoint['0'].geometry.coordinates[1]}&access_token=${mapboxgl.accessToken}`).then(res => res.json()).then(data => {
                
                //For each poi returned, add an orange marker to the pax
                for (let d = 0; d < (data.features.length); d++) {
                    markers2 = new mapboxgl.Marker({
                        color: "#99FFDE",
                        draggable: false
                    })
                    markers2.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                        .addTo(map);
                    //Push to an array to be deleted later
                    poiMarkers.push(markers2)

                    //Add event listen for on hover
                    markers2.getElement().addEventListener('mouseenter', () => {
                        //Create a popup with the details of the poi
                        poiMarker = new mapboxgl.Popup({
                            closeOnclick: false
                        })
                        poiMarker.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                        poiMarker.setHTML(`<p>${data.features[d].place_name}</p>`)

                            .addTo(map);
                    })
                    //Add an event listen for on hover off
                    markers2.getElement().addEventListener('mouseleave', () => {
                        //Remove the popup
                        poiMarker.remove()
                    })
                }

            })
        //If the user did not select a poi
        } else {
            console.log('yes')
            //If alert message is needed (not already been shown)
            if (alertmsg === true) {
                console.log('on')
                //Show alert message
                alert("Please select a POI type to look for.")
            } else{console.log('off')}

        }

    }
})
}


function addWayPoints() {
   
    //Get the lat and lng for each point in the polyline
    for (let i = 0; i < geocoderList.length; i++) {
        latPoints.push(geocoderList[i][0]);
        lonPoints.push(geocoderList[i][1])
    }

    //Loop through the list of cities in other js file
    for (let j = 0; j < cities.length; j++) {

        //Loop through lat and lng points
        for (let v = 0; v < latPoints.length; v++) {
            //Check if any lat points on polyline are within 0.08 degrees of a city 
            if (latPoints[v] >= (cities[j].lat - 0.08) && latPoints[v] <= (cities[j].lat + 0.08)) {
                //Check if any lng points on polyline are within 0.08 degrees of a city
                if (lonPoints[v] >= (cities[j].lng - 0.08) && lonPoints[v] <= (cities[j].lng + 0.08)) {
                    //Push to an array if it is not already there
                    if (latWayPoints.includes(cities[j].lat) && lonWayPoints.includes(cities[j].lng)) {
                    } else {
                        //Push lat
                        latWayPoints.push(cities[j].lat)
                        //Push lng
                        lonWayPoints.push(cities[j].lng)
                        //Push city name
                        cityNames.push(cities[j].city)
                    }
                }
            }

        }
    }

     //Push all the previously attained waypoints info into one array
     for (let g = 0; g < latWayPoints.length; g++) {
        exactWayPoints.push({
            lon: lonWayPoints[g],
            lat: latWayPoints[g],
            city: cityNames[g]
        })
    }

    //For each city found, add a blue marker to the map
    for (let w = 0; w < latWayPoints.length; w++) {
        markers = new mapboxgl.Marker({
            color: "#3F37C9",
            draggable: false,
        })
        markers.setLngLat([lonWayPoints[w], latWayPoints[w]])
            .addTo(map);
        
        //Push markers to an array to be deleted later
        wayPointMarkers.push(markers)

      
        //Add double click event for weather and poi search
        markers.getElement().addEventListener('dblclick', () => {
            
           
            map.once('dblclick', (e) => {
 
                console.log(e)
                //Get day, hour, ampm
var day = time.getDay();
var hour = time.getHours();
const ampm = hour >= 12 ? 'PM' : 'AM'

//Variable to determine is am or pm should be used
var ampmHourly = null

//Variable to determine hour to display
var currenthour = hour

//Set hour to 12 hour clock
hour = (hour % 12) || 12;
              var currentCityName
              var currentCityLat
              var currentCityLon
              
                //Loop through the markers to see which one has been clicked
                for (let d = 0; d < exactWayPoints.length; d++) {
                    var closest = exactWayPoints[0].lon
                    var current = exactWayPoints[0]
                    //Check the lat and lng for the marker and check which city is closest to it
                    for (let y = 0; y < exactWayPoints.length; y++) {
                        if (Math.abs(exactWayPoints[y].lon - e.lngLat.lng) < Math.abs(closest - e.lngLat.lng)) {
                            var closest = exactWayPoints[y].lon
                            var current = exactWayPoints[y]
                          currentCityLon = exactWayPoints[y].lon  
                          currentCityLat = exactWayPoints[y].lat
                          currentCityName = exactWayPoints[y].city
      
                        }
                    }
                }

              console.log(currentCityLon, currentCityLat, currentCityName)

             

                //If a newtab for weather info was opened then closed
                if (newTab === true && tab.closed === true) {
                    //Reset variables
                    newTab = false
                    newTabPlaceNames = []
                    originAdded = false
                    destAdded = false
                }

                //If weather search is selected instead of POI search
                if (weatherSearch === true) {

                    //Perform if the city is not already there
                    if (newTabPlaceNames.includes(currentCityName)) {} else {
                        //Push the city to an array to keep track of
                        newTabPlaceNames.push(currentCityName)

                        //If a newtab has not been opened
                        if (newTab === false) {
                            //Open a new tab
                            tab = window.open("", "");
                            //Create a div
                            var newContainer = tab.document.createElement('div')
                            //Set div class to style
                            newContainer.className = "container-new-tab"

                            //Get city weather including hourly
                            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${currentCityLat}&lon=${currentCityLon}&exclude=minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(fullwayPointData => {
                                setInterval(12)
                                //Variable for html
                                var otherDayForcast = ''

                                //Add html to the variable
                                otherDayForcast += `
                <html lang="en">
                <head>
                <link rel="stylesheet" href="static/css/main.css">
                <script src="script.js"></script>
                <title>RouteWeather Hourly</title>
                <h1>Weather Tab</h1>
                <h5 id="weather-tab-sub">Weather for all desired places will be posted here. If you close this tab, then all of the previous data displayed will be cleared.</h5>
                <div class="container-new-tab">
                <div class="city-container-new" id="city-container-new"> 
                <div class="city-name-new">${currentCityName}</div>
                <div class ="forecast-type-new">7 Day Forecast</div>
                </div>
              <div id="daily-weather-new">
              `                 //For each day add html element
                                fullwayPointData.daily.forEach((day) => {
                                    otherDayForcast += `
                                    <div class="weather-forecast-item-new ">
                                    <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                                    <div class="temp">Day: ${day.temp.day}&#176;C</div>
                                    <div class="temp">Night: ${day.temp.night}&#176;C</div>
                                    <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                                    <div class="temp">Humidity: ${day.humidity}%</div>
                                    <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
                                </div> 
              `
                                })
                                otherDayForcast+= ` </div> 
                                <div class="city-container-new" id="city-container-new"></div> 
                                <div class ="forecast-type-new">Hourly Forecast</div>
                                <div class="hourly-weather-new"> 
                                `

                                //For each hour (48) add html element
                                for (let y = 0; y < (fullwayPointData.hourly.length); y++) {
                                    //If the hour is the current hour
                                    if (y == 0) {
                                        otherDayForcast += `
                  
                  <div class="weather-hourly-forecast-item-new">
                  <div class="day">${days[day]}</div>
                  <div class="hour"><span>${hour} ${ampm}</span></div>
                  <img src="http://openweathermap.org/img/wn//${fullwayPointData.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                  <div class="temp">Temp:  ${fullwayPointData.hourly[0].temp}&#176;C</div>
                  <div class="temp">Feels-Like: ${Math.round(fullwayPointData.hourly[0].feels_like)}&#176;C</div>
                  <div class="temp">POP: ${Math.round(fullwayPointData.hourly[y].pop * 100)}%</div>
                  </div>
                  
                  `                    
                                    //If the hour is after the current hour open
                                    } else {
                                        //Take the currenthour and add 1 until 24
                                        if (currenthour <= 24) {
                                            currenthour += 1
                                            //Once 24 hours has been reached, show next day
                                            if (currenthour == 24) {
                                                day += 1
                                                if (day == 7) {
                                                    day = 0
                                                }
                                            }

                                            //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                                            if (currenthour > 24 && currenthour < 48) {
                                                currenthour = currenthour - 24
                                            }
                                        }
                                        
                                        //Get the ampm depending on the hour
                                        if (currenthour >= 12 && currenthour < 24) {
                                            ampmHourly = 'PM'
                                        } else {
                                            ampmHourly = 'AM'
                                        }

                                        //Create a variable to show the current hour in a 12 hour format
                                        currenthourdisplay = (currenthour % 12) || 12;

                                        //Add html for the hours to the variable
                                        otherDayForcast += `
                  <div class="weather-hourly-forecast-item-new">
                  <div class="day">${days[day]}</div>
                  <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
                  <img src="http://openweathermap.org/img/wn/${fullwayPointData.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                  <div class="temp">Temp:  ${fullwayPointData.hourly[y].temp}&#176;C</div>
                  <div class="temp">Feels-Like: ${Math.round(fullwayPointData.hourly[y].feels_like)}&#176;C</div>
                  <div class="temp">POP: ${Math.round(fullwayPointData.hourly[y].pop * 100)}%</div>
                  </div>
                  `
                                    }
                                }

                                otherDayForcast += `</div>`

                                //Add the html to the newtab
                                tab.document.write(otherDayForcast)
                            })
                            //Show that newtab has been opened
                            newTab = true
                        
                        //If newtab has been opened
                        } else if (newTab = true) {
                            //Fetch waypoint weather
                            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${currentCityLat}&lon=${currentCityLon}&exclude=minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(fullwayPointData => {
                                setInterval(12)
                                console.log(fullwayPointData)
                                //Variable to store html
                                var otherDayForcast = ''
                                //Add html 
                                otherDayForcast += `
                                <div class="container-new-tab">
                                <div class="city-container-new" id="city-container-new"> 
                                <div class="city-name-new">${currentCityName}</div>
                                <div class ="forecast-type-new">7 Day Forecast</div>
                                </div>
                              <div id="daily-weather-new">
              `                 
                                //For each day create html element
                                fullwayPointData.daily.forEach((day) => {
                                    otherDayForcast += `
                                    <div class="weather-forecast-item-new ">
                                    <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                                    <div class="temp">Day: ${day.temp.day}&#176;C</div>
                                    <div class="temp">Night: ${day.temp.night}&#176;C</div>
                                    <div class="temp">POP: ${Math.round(day.pop * 100)}%</div>
                                    <div class="temp">Humidity: ${day.humidity}%</div>
                                    <div class="temp">Wind: ${Math.round(day.wind_gust)} Km/h</div>
                                </div> 
              `
                                })

                                otherDayForcast+= ` </div> 
                                <div class="city-container-new" id="city-container-new"></div> 
                                <div class ="forecast-type-new">Hourly Forecast</div>
                                <div class="hourly-weather-new"> 
                                `
                                ////For each hour (48) add html element
                                for (let y = 0; y < (fullwayPointData.hourly.length); y++) {
                                    //If it is current hour
                                    if (y == 0) {
                                        otherDayForcast += `
                                        <div class="weather-hourly-forecast-item-new">
                                        <div class="day">${days[day]}</div>
                                        <div class="hour"><span>${hour} ${ampm}</span></div>
                                        <img src="http://openweathermap.org/img/wn//${fullwayPointData.hourly[0].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                                        <div class="temp">Temp:  ${fullwayPointData.hourly[0].temp}&#176;C</div>
                                        <div class="temp">Feels-Like: ${Math.round(fullwayPointData.hourly[0].feels_like)}&#176;C</div>
                                        <div class="temp">POP: ${Math.round(fullwayPointData.hourly[y].pop * 100)}%</div>
                                        </div>
                  
                  `                 
                                    //If it is a hour after the current hour
                                    } else {
                                        //Take the currenthour and add 1 until 24
                                        if (currenthour <= 24) {
                                            currenthour += 1
                                            //Once 24 hours has been reached, show next day
                                            if (currenthour == 24) {
                                                day += 1
                                                if (day == 7) {
                                                    day = 0
                                                }
                                            }
                                            
                                            //For the second day (once it is above 24 hours), subtract the hours for the first day to make sure hours can be added above
                                            if (currenthour > 24 && currenthour < 48) {
                                                currenthour = currenthour - 24
                                            }
                                        }
                                        
                                        //Get the ampm depending on the hour
                                        if (currenthour >= 12 && currenthour < 24) {
                                            console.log(current)
                                            ampmHourly = 'PM'
                                        } else {
                                            ampmHourly = 'AM'
                                        }

                                        //Create a variable to show the current hour in a 12 hour format
                                        currenthourdisplay = (currenthour % 12) || 12;

                                         //Add html for the hours to the variable
                                        otherDayForcast += `
                                        <div class="weather-hourly-forecast-item-new">
                                        <div class="day">${days[day]}</div>
                                        <div class="hour"><span>${currenthourdisplay} ${ampmHourly}</span></div>
                                        <img src="http://openweathermap.org/img/wn/${fullwayPointData.hourly[y].weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                                        <div class="temp">Temp:  ${fullwayPointData.hourly[y].temp}&#176;C</div>
                                        <div class="temp">Feels-Like: ${Math.round(fullwayPointData.hourly[y].feels_like)}&#176;C</div>
                                        <div class="temp">POP: ${Math.round(fullwayPointData.hourly[y].pop * 100)}%</div>
                                        </div>
                  
                  `
                                    }
                                }
                                //Add the html to the pre-exisiting newtab
                                tab.document.body.innerHTML += otherDayForcast;
                            })
                        }

                    }
                //If button is switched to poi search
                } else {
                    //If the user inputed something into the poi searchbox
                    if (POI !== null) {

                        clearMarkers = true
                        //Fetch a list of nearby pois of that type using mapbox geocoder
                        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${POI}.json?type=poi&proximity=${currentCityLon},${currentCityLat}&access_token=${mapboxgl.accessToken}`).then(res => res.json()).then(data => {
                            console.log(data)
                            //For each poi returned, add an green marker to the map
                            for (let d = 0; d < (data.features.length); d++) {
                                markers2 = new mapboxgl.Marker({
                                    color: "#99FFDE",
                                    draggable: false
                                })
                                markers2.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                                    .addTo(map);
                                //Push to an array to be deleted later
                                poiMarkers.push(markers2)

                                //Add event listen for on hover
                                markers2.getElement().addEventListener('mouseenter', () => {
                                    //Create a popup with the details of the poi
                                    poiMarker = new mapboxgl.Popup({
                                        closeOnclick: false
                                    })
                                    poiMarker.setLngLat([data.features[d].center[0], data.features[d].center[1]])
                                    poiMarker.setHTML(`<p>${data.features[d].place_name}</p>`)

                                        .addTo(map);
                                })
                                //Add an event listen for on hover off
                                markers2.getElement().addEventListener('mouseleave', () => {
                                    //Remove the popup
                                    poiMarker.remove()
                                })
                            }

                        })
                    //If the user did not select a poi
                    } else {
                        console.log('yes')
                        //If alert message is needed (not already been shown)
                        if (alertmsg === true) {
                            console.log('on')
                            //Show alert message
                            alert("Please select a POI type to look for.")
                        } else{console.log('off')}

                    }


                }




            })
        });
    }
}


//For the poi search box
selected.addEventListener("click", () => {
    optionsContainer.classList.toggle("active");

    searchBox.value = "";
    filterList("");

    if (optionsContainer.classList.contains("active")) {
        searchBox.focus();
    }
});

optionsList.forEach(o => {
    o.addEventListener("click", () => {
        alertmsg = false
        selected.innerHTML = o.querySelector("label").innerHTML;
        POI = o.querySelector("label").innerHTML;
        POI = POI.toLowerCase()
        optionsContainer.classList.remove("active");
    });
});

searchBox.addEventListener("keyup", function(e) {
    filterList(e.target.value);
});

const filterList = searchTerm => {
    searchTerm = searchTerm.toLowerCase();
    optionsList.forEach(option => {
        let label = option.firstElementChild.nextElementSibling.innerText.toLowerCase();
        if (label.indexOf(searchTerm) != -1) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        }
    });
};

//On button click...
function switchSearch() {
    //If weathersearch is on
    if (weatherSearch === true) {
        //Turn it off
        weatherSearch = false
        //Change the text
        button.innerHTML = 'Switch to weather search'
    //If weathersearch is off
    } else if (weatherSearch == false) {
        //Turn it on
        weatherSearch = true
        //Change the text
        button.innerHTML = 'Switch to POI search'
    }

}

function clearMapMarkers(){
     //Clear all poi markers 
    
     if (poiMarkers.length !== 0 && clearMarkers == true) {
        for (var l = poiMarkers.length - 1; l >= 0; l--) {
            poiMarkers[l].remove() 
        }
        clearMarkers = false
    } else if(clearMarkers == false){
        alert("No POI markers were added.")
    }
}