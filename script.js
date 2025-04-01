"use strict";

const mainContainer = document.querySelector("main");
const searchBox = document.getElementById("search");
const suggestionBox = document.querySelector(".suggestions");
const cityName = document.querySelector(".city-name");

const dayNameEl = document.querySelector(".day-name");
const dateEl = document.querySelector(".date-name");

const currentTempEl = document.querySelector(".current-temp");
const iconDayEl = document.querySelector(".icon-day");
const iconNightEl = document.querySelector(".icon-night");

const currentTempIconEl = [
  ...document.querySelectorAll(".current-temp-icon i"),
];

const currentTempMaxEl = document.querySelector(".temp-max");
const currentTempMinEl = document.querySelector(".temp-min");
const currentPrecipitationsEl = document.querySelector(".precipitations");
const currentWindSpeedEl = document.querySelector(".wind-speed");
const currentSunriseEl = document.querySelector(".sunrise");
const currentSunsetEl = document.querySelector(".sunset");
const nextDayIcons = [...document.querySelectorAll(".next-day-icon i")];
const rowRightEl = document.querySelector(".row-right");

let locations = [];
let dataCode;
let debounceTimeout; // avoiding to many calls
setTimeout(() => {
  mainContainer.classList.remove("hide");
}, 500);
searchBox.addEventListener("input", function (e) {
  e.preventDefault();
  if (searchBox.value.length >= 4) {
    // avoid to many fetch rquests , function execute after 500ms
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async function () {
      console.log("function Call");

      await getLocations(); // return locations array
      if (locations.length !== 0) {
        suggestionBox.classList.remove("hide");
      } else {
        alert("No location found, please try again in 30 seconds");
      }
    }, 500);
  }
});

suggestionBox.addEventListener("click", function (e) {
  const indexNumber = +e.target.dataset.index;
  if (!(indexNumber <= 4)) return;
  searchBox.value = "";
  suggestionBox.classList.add("hide");
  cityName.textContent = locations[indexNumber].name;
  getWeather(locations[indexNumber].lat, locations[indexNumber].long);
});

async function getLocations() {
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/autocomplete?q=${searchBox.value}&tag=place:city,place:village,place:county&limit=5&key=pk.60b3dc8041e095fc4adb1fbe87f466bb`
    );
    const data = await response.json();

    if (Array.from(suggestionBox.children).length != 0) {
      Array.from(suggestionBox.children).forEach((li) => {
        li.remove();
      });
    }

    data.forEach((suggestion, i) => {
      const suggestionItem = document.createElement("li");
      if (i >= 4) return;
      locations[i] = {
        lat: +suggestion.lat,
        long: +suggestion.lon,
        name: suggestion.address.name,
      };
      suggestionItem.innerHTML = `${suggestion.display_name} - ${suggestion.type}`;
      suggestionItem.setAttribute("data-index", i);
      suggestionBox.appendChild(suggestionItem);
    });
    return locations;
  } catch (err) {
    console.log(err);
  }
}

async function getWeather(lat, long) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,is_day,precipitation,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
    );
    const data = await response.json();

    // -----change Time -----

    const time = data.current.time; //
    const date = new Date(time);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = days[date.getDay()];
    const dateToDisplay = `${date.getDate()}-${
      months[date.getMonth()]
    }-${date.getFullYear()}`;

    dayNameEl.textContent = day;
    dateEl.textContent = dateToDisplay;

    // -----------------Current Temp ---------------------------------------
    function iconSet(i = 0) {
      let weatherCode = data.daily.weather_code[i];
      if (weatherCode < 44) {
        dataCode = 1;
      } else if (weatherCode >= 44 && weatherCode <= 58) {
        dataCode = 2;
      } else if (weatherCode >= 61 && weatherCode <= 68) {
        dataCode = 3;
      } else if (
        (weatherCode >= 71 && weatherCode <= 78) ||
        (weatherCode >= 85 && weatherCode <= 86)
      ) {
        dataCode = 4;
      } else if (weatherCode >= 79 && weatherCode <= 83) {
        dataCode = 5;
      } else if (weatherCode >= 95 && weatherCode <= 100) {
        dataCode = 6;
      }
      return dataCode;
    }
    iconSet();

    currentTempIconEl.forEach((icon) => {
      icon.classList.add("hide");
      if (dataCode == icon.dataset.code) {
        icon.classList.remove("hide");
      }
    });

    currentTempEl.textContent = `${data.current.temperature_2m}${data.current_units.temperature_2m}`;
    if (data.current.is_day === 0) {
      iconNightEl.classList.remove("hide");
      iconDayEl.classList.add("hide");
    }
    if (data.current.is_day === 1) {
      iconNightEl.classList.add("hide");
      iconDayEl.classList.remove("hide");
    }

    // -----------------Current Temp ---------------------------------------
    currentTempMaxEl.textContent = `${data.daily.temperature_2m_max[0]} ${data.daily_units.temperature_2m_max}`;
    currentTempMinEl.textContent = `${data.daily.temperature_2m_min[0]} ${data.daily_units.temperature_2m_min}`;
    currentPrecipitationsEl.textContent = `${data.daily.precipitation_probability_max[0]} ${data.daily_units.precipitation_probability_max}`;
    currentWindSpeedEl.textContent = `${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`;

    const sunrise = new Date(data.daily.sunrise[0]);
    currentSunriseEl.textContent = `${sunrise.getHours()}:${sunrise.getMinutes()}`;

    const sunset = new Date(data.daily.sunset[0]);
    currentSunsetEl.textContent = `${sunset.getHours()}:${sunset.getMinutes()}`;

    // -----------NEXT DAYS ------------------------

    const icons = {
      code1: '<i class="fa-solid fa-sun" data-code="1"></i>',
      code2: '<i class="fa-solid fa-smog " data-code="2"></i>',
      code3: '<i class="fa-solid fa-cloud-showers-heavy" data-code="3"></i>',
      code4: '<i class="fa-solid fa-snowflake" data-code="4"></i>',
      code5: '<i class="fa-solid fa-cloud-showers-water" data-code="5"></i>',
      code6: '<i class="fa-solid fa-cloud-bolt" data-code="6"></i>',
    };

    rowRightEl.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
      const nextDate = days[new Date(data.daily.time[i]).getDay()];
      const nextDayContainer = document.createElement("div");
      nextDayContainer.classList.add("next-day-container");
      nextDayContainer.innerHTML = `
              <div class="next-day-wrapper">
                    <div class="next-day-icon">
                      ${icons[`code${iconSet(i)}`]}
                    </div>
                    <p class="next-day-name">${nextDate}</p>
                  </div>
                  <div class="next-day-description-wrapper">
                    <div class="next-day-left">
                      <div class="row-container">
                        <p class="next-day-description">Max Temp:</p>
                        <p class="next-day-max-value next-day-values">${
                          data.daily.temperature_2m_max[i] ??
                          "data not available"
                        } ${data.daily_units.temperature_2m_max}</p>
                      </div>
                      <div class="row-container">
                        <p class="next-day-description">Min Temp:</p>
                        <p class="next-day-min-value next-day-values">${
                          data.daily.temperature_2m_min[i]
                        } ${data.daily_units.temperature_2m_min}</p>
                      </div>
                    </div>
                    <div class="next-day-right">
                      <div class="row-container">
                        <p class="next-day-description">Precipitations:</p>
                        <p class="next-day-prec-value next-day-values">${
                          data.daily.precipitation_probability_max[i]
                        } ${data.daily_units.precipitation_probability_max}</p>
                      </div>
                      <div class="row-container">
                        <p class="next-day-description">Wind Speed:</p>
                        <p class="next-day-wind-value next-day-values">${
                          data.daily.wind_speed_10m_max[i]
                        } ${data.daily_units.wind_speed_10m_max}</p>
                      </div>
                    </div>
                  </div>
                  `;
      rowRightEl.appendChild(nextDayContainer);
    }

    // --------------End of try block---
  } catch (err) {
    console.log(err);
  }
}

// getWeather(47.62, 26.25);

function getGeolocation() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  async function success(pos) {
    try {
      const crd = pos.coords;
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=pk.60b3dc8041e095fc4adb1fbe87f466bb&lat=${crd.latitude}&lon=${crd.longitude}&format=json&`
      );
      const data = await response.json();
      cityName.textContent = data.address.city;
      console.log(
        `Current data from local geolocation taken from browser ${data.address.city}`
      );
      getWeather(crd.latitude, crd.longitude);
    } catch (err) {
      console.error(err);
    }
  }

  function error(err) {
    console.warn(`ERROR(${err.code}: ${err.message})`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}
setTimeout(getGeolocation, 3000);

async function getIPLocation() {
  try {
    const response = await fetch("https://ipinfo.io?token=29bfe30cfcd014");
    const data = await response.json();
    const [lat, long] = data.loc.split(",").map((el) => parseFloat(el));
    cityName.textContent = data.city;
    console.log(`Data taken from your IP`);

    getWeather(lat, long);
  } catch (err) {
    console.error(err);
  }
}

getIPLocation();
