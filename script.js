const baseUrl="https://api.openweathermap.org",key="appid=77bcd7a808e45268113d6c1714cf54bc",lsRef="city-search-history";let mobileNavOpen=!1;const searchWrapperEl=document.querySelector(".search-section"),formEl=searchWrapperEl.querySelector("#search-form"),searchHistoryContainer=searchWrapperEl.querySelector(".search-history"),serchSection=document.querySelector(".search-section-container"),weatherDisplayEl=document.querySelector(".weather-display"),weatherDisplayCurrentWrapper=weatherDisplayEl.querySelector(".weather-display__current"),weatherDisplayForecastWrapper=weatherDisplayEl.querySelector(".weather-display__upcomming"),mobileNavButtonEl=document.querySelector(".header-nav-button"),clearLSBtn=document.querySelector("#clear-history");let isLoading=!1,searchHistory=JSON.parse(localStorage.getItem(lsRef))??["Portland, United States",];const getCountryName=e=>new Intl.DisplayNames(["en"],{type:"region"}).of(e),setLS=e=>{if(searchHistory.includes(e))return;let t=[...searchHistory,e];localStorage.setItem(lsRef,JSON.stringify(t)),searchHistory=t,updateSearchHistory()},removeItemFromLs=e=>{let t=searchHistory.filter(t=>t.trim()!==e.trim());localStorage.setItem(lsRef,JSON.stringify(t)),searchHistory=t,updateSearchHistory()},handleClearLS=()=>{let e=confirm("Are you sure you want to clear your history?");e&&(localStorage.removeItem(lsRef),searchHistory=[],updateSearchHistory())},updateSearchHistory=()=>{searchHistoryContainer.innerHTML=searchHistory.map(e=>`
        <div class="history-btn-wrapper" style="position:relative;">
          <button
            class="search-history-button"
            data-city=${e.replaceAll(/[' ']/gi,"-").replace(",-","__")} 
            style="
              display: block;
              width: 100%;
              padding-right: 1.25rem;
              text-align: start;"
          >
            ${e}
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
        `).join("")},displayCurrentWeather=(e,t)=>weatherDisplayCurrentWrapper.innerHTML=`
    <h2>${e.name}${t!==e.name?"("+t+"), ":", "} ${getCountryName(e.sys.country)}</h2>
    <p>
      <b>Temp:</b>${e.main.temp}
    </p>
    <img src="https://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png"/>
`,displayFiveDayForecast=e=>weatherDisplayForecastWrapper.innerHTML=e.list.filter((e,t)=>t%8==0).map((e,t)=>`
          <div 
            style="
              background-color: hsl(179, 86%, ${44-2*t}%);
              box-shadow: inset 5px 5px 14px 7px #2222222b, 5px 5px 10px 3px hsla(179, 86%, ${44-3*t}%, 0.${10+2*t});
            "
          >
            <h3>${e.dt_txt.split(" ")[0].replaceAll(/-/gi,"/")}</h3>
            <p>
              <b>Temp:</b> ${e.main.temp}
            </p>
            <img src="https://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png"/>
          </div>
        `).join(""),getWeatherData=async e=>{let t=async(e,t,r)=>await fetch(`${baseUrl}/data/2.5/${r}?lat=${e}&lon=${t}&units=imperial&${key}`).then(e=>e.json()).catch(e=>console.error(e));try{if(isLoading)return;isLoading=!0;let[{lat:r,lon:a,country:s,name:i}]=await fetch(`${baseUrl}/geo/1.0/direct?q=${e}&${key}`).then(e=>e.json()),[o,l]=await Promise.all([t(r,a,"weather"),t(r,a,"forecast"),]);setLS(`${i}, ${getCountryName(s)}`),displayCurrentWeather(o,i),displayFiveDayForecast(l)}catch(n){alert("error on request: "+n)}finally{isLoading=!1,handleMobileNavClick()}},handleFormSubmit=e=>{e.preventDefault();let t=e.target.querySelector("#search-input");t.value&&(getWeatherData(t.value),t.value="")},handleSearchHistoryBtnClick=e=>{e.target.classList.value.includes("search-history-button")&&getWeatherData(e.target.dataset.city.replace("__",",").replaceAll(/-/gi," ")),e.target.classList.value.includes("remove-history-button")&&removeItemFromLs(e.target.parentNode.children[0].textContent)},handleMobileNavClick=()=>{serchSection.classList[mobileNavOpen?"remove":"add"]("open"),mobileNavOpen=!mobileNavOpen},init=()=>{document.addEventListener("click",handleSearchHistoryBtnClick),formEl.addEventListener("submit",handleFormSubmit),clearLSBtn.addEventListener("click",handleClearLS),mobileNavButtonEl.addEventListener("click",handleMobileNavClick),getWeatherData(searchHistory[searchHistory.length-1]),updateSearchHistory()};window.addEventListener("DOMContentLoaded",init);