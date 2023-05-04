const baseUrl = 'https://api.openweathermap.org';
const key = 'appid=77bcd7a808e45268113d6c1714cf54bc';
const lsRef = 'city-search-history';

// ************ Query secltors ***************** //
// ******************************************** //
// Search Section
const searchWrapperEl = document.querySelector('.search-section');
const formEl = searchWrapperEl.querySelector('#search-form');
const searchHistoryContainer = searchWrapperEl.querySelector('.search-history');

// Weather Display section
const weatherDisplayEl = document.querySelector('.weather-display');
const weatherDisplayCurrentWrapper = weatherDisplayEl.querySelector(
  '.weather-display__current'
);
const weatherDisplayForecastWrapper = weatherDisplayEl.querySelector(
  '.weather-display__upcomming'
);

// Buttons
const mobileNavButtonEl = document.querySelector('.header-nav-button');
const clearLSBtn = document.querySelector('#clear-history');

let isLoading = false;
let searchHistory = JSON.parse(localStorage.getItem(lsRef)) ?? [
  'Portland, United States',
];

// ************ Functions ********************* //
// ******************************************** //
const getCountryName = (id) =>
  new Intl.DisplayNames(['en'], { type: 'region' }).of(id);

const updateSearchHistory = () => {
  searchHistoryContainer.innerHTML = searchHistory
    .map(
      (city) => `
        <div class="history-btn-wrapper" style="position:relative;">
          <button
            class="search-history-button"
            data-city=${city.replaceAll(/[' ']/gi, '-').replace(',-', '__')} 
            style="
              display: block;
              width: 100%;
              padding-right: 1.25rem;
              text-align: start;"
          >
            ${city}
          </button>
          <span 
            class="remove-history-button"
            style="
              position: absolute;
              top: 50%;
              right: 0.75rem;
              font-size: 14px;
              transform: translateY(-50%);
              cursor: pointer;
              color: #222222;
            "
          >
            &#10005;
          </span>
        </div>
        `
    )
    .join('');
};

const setLS = (city) => {
  if (searchHistory.includes(city)) return;
  const updatedHistory = [...searchHistory, city];
  localStorage.setItem(lsRef, JSON.stringify(updatedHistory));
  searchHistory = updatedHistory;
  updateSearchHistory();
};

const removeItemFromLs = (city) => {
  const updatedHistory = searchHistory.filter((c) => c.trim() !== city.trim());
  localStorage.setItem(lsRef, JSON.stringify(updatedHistory));
  searchHistory = updatedHistory;
  updateSearchHistory();
};

const displayCurrentWeather = (data, name) =>
  (weatherDisplayCurrentWrapper.innerHTML = `
    <h2>${data.name} ${name !== data.name ? '(' + name + ')' : ''}</h2>
    <p>
      <b>Temp:</b> ${data.main.temp}
    </p>
    <img src="https://openweathermap.org/img/wn/${
      data.weather[0].icon
    }@2x.png"/>
`);

const displayFiveDayForecast = (data) =>
  (weatherDisplayForecastWrapper.innerHTML = data.list
    .filter((_, index) => index % 8 === 0)
    .map(
      (spanShot, index) => `
          <div 
            style="
              background-color: hsl(179, 86%, ${44 - index * 3}%);
              box-shadow: inset 5px 5px 14px 7px #2222222b, 5px 5px 10px 3px hsla(179, 86%, ${
                44 - index * 3
              }%, 0.${10 + index * 2});
            "
          >
            <h3>${spanShot.dt_txt.split(' ')[0].replaceAll(/-/gi, '/')}</h3>
            <p>
              <b>Temp:</b> ${spanShot.main.temp}
            </p>
            <img src="https://openweathermap.org/img/wn/${
              spanShot.weather[0].icon
            }@2x.png"/>
          </div>
        `
    )
    .join(''));

const getWeatherData = async (city) => {
  const getSpecificWeatherData = async (lat, lon, type) =>
    await fetch(
      `${baseUrl}/data/2.5/${type}?lat=${lat}&lon=${lon}&units=imperial&${key}`
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

  try {
    if (isLoading) return;

    isLoading = true;
    const url = `${baseUrl}/geo/1.0/direct?q=${city}&${key}`;
    const [{ lat, lon, country, name }] = await fetch(url).then((res) =>
      res.json()
    );

    const [currentWeatherData, fiveDayData] = await Promise.all([
      getSpecificWeatherData(lat, lon, 'weather'),
      getSpecificWeatherData(lat, lon, 'forecast'),
    ]);

    setLS(`${name}, ${getCountryName(country)}`);
    displayCurrentWeather(currentWeatherData, name);
    displayFiveDayForecast(fiveDayData);
  } catch (err) {
    console.error(err);
    alert('error on request');
  } finally {
    isLoading = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  const inputEl = event.target.querySelector('#search-input');
  if (!inputEl.value) return;
  getWeatherData(inputEl.value);
  inputEl.value = '';
};

const handleSearchHistoryBtnClick = (event) => {
  if (event.target.classList.value.includes('search-history-button'))
    getWeatherData(
      event.target.dataset.city.replace('__', ',').replaceAll(/-/gi, ' ')
    );
  if (event.target.classList.value.includes('remove-history-button'))
    removeItemFromLs(event.target.parentNode.children[0].textContent);
};

const handleClearLS = () => {
  const shouldDelete = confirm('Are you sure you want to clear your history?');
  if (shouldDelete) {
    localStorage.removeItem(lsRef);
    searchHistory = [];
    updateSearchHistory();
  }
};

let mobileNavOpen = false;

const handleMobileNavClick = () => {
  const serchSection = document.querySelector('.search-section-container');
  serchSection.classList[mobileNavOpen ? 'remove' : 'add']('open');
  mobileNavOpen = !mobileNavOpen;
};

const init = () => {
  document.addEventListener('click', handleSearchHistoryBtnClick);
  formEl.addEventListener('submit', handleFormSubmit);
  clearLSBtn.addEventListener('click', handleClearLS);
  mobileNavButtonEl.addEventListener('click', handleMobileNavClick);
  getWeatherData(searchHistory[searchHistory.length - 1]);
  updateSearchHistory();
};

window.addEventListener('DOMContentLoaded', init);
