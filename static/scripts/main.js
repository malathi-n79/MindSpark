// Unsplash API key
const clientID = "&client_id=3ebe01369e49bd4796bdd7a4dc9d184e33817224260491c3ba8cd2066a75a5fe";

// DOM Elements
const backgroundImgContainer = document.querySelector(".background-container");
const changeBtn = document.querySelector("#change-btn");
const credit = document.querySelector("#credit");
const navigate = document.querySelector("#navigate");
const quotes = document.querySelector("#quotes");

// Cache for quotes
let quotesCache = null;

function displayMotivationalQuote() {
  if (!quotes) return;
  
  if (quotesCache) {
    displayRandomQuote(quotesCache);
    return;
  }
  
  fetch('./static/data/quotes.json')
    .then(response => response.json())
    .then(data => {
      quotesCache = data;
      displayRandomQuote(data);
    })
    .catch(error => {
      console.error('Error fetching quotes:', error);
      quotes.innerHTML = `
        <div class="quote-text">"The best way to predict the future is to create it."</div>
        <div class="quote-author">
          <span class="author-dash">—</span> 
          <span class="author-name">Abraham Lincoln</span>
        </div>
      `;
    });
}

function displayRandomQuote(data) {
  const randomIndex = Math.floor(Math.random() * data.length);
  const randomQuote = data[randomIndex];
  
  quotes.innerHTML = `
    <div class="quote-text">"${randomQuote.quoteText}"</div>
    <div class="quote-author">
      <span class="author-dash">—</span> 
      <span class="author-name">${randomQuote.quoteAuthor || 'Unknown'}</span>
    </div>
  `;
}

function topSites() {
  chrome.topSites.get((topVisitedSites) => {
    const url = document.getElementById("urls");
    if (!url) return;
    
    url.innerHTML = '';
    for (var i = 0; i < topVisitedSites.length; i++) {
      var reducedTitle;
      if (("" + topVisitedSites[i].title).length > 24) {
        reducedTitle = ("" + topVisitedSites[i].title).slice(0, 24) + "...";
      } else {
        reducedTitle = topVisitedSites[i].title;
      }
      url.innerHTML += `<a class="dropdown-item" title="${topVisitedSites[i].title}" style="color: black; font-size:12px; text-decoration: none" href="${topVisitedSites[i].url}" target="_blank">${reducedTitle}</a><br>`;
    }
  });
}

function fetchImage() {
  const img = new Image();
  if (backgroundImgContainer) {
    backgroundImgContainer.style.opacity = 0;
  }
  
  img.onload = function () {
    if (backgroundImgContainer) {
      backgroundImgContainer.style.backgroundImage = `url(${this.src})`;
      backgroundImgContainer.style.opacity = 1;
    }
  };

  if (localStorage.getItem("url") === null) {
    img.src = "./static/images/background.jpg";
  } else {
    img.src = localStorage.getItem("url");
    if (credit) {
      credit.innerHTML = `<a target="_blank">${localStorage.getItem("name")}</a>`;
    }
    if (navigate) {
      navigate.innerHTML = `<a target="_blank" style="color: white; font-size:130%;" href="${localStorage.getItem("link")}">See on Unsplash</a>`;
    }
  }
}

function unsplashGetPhotos() {
  if (changeBtn) {
    changeBtn.disabled = true;
    setTimeout(() => {
      changeBtn.disabled = false;
    }, 2000);
  }
  
  if (quotes) {
    quotes.style.opacity = 0;
  }
  
  if (backgroundImgContainer) {
    backgroundImgContainer.style.opacity = 0;
  }
  
  setTimeout(() => {
    fetch(`https://api.unsplash.com/photos/random?query=Nature&orientation=landscape&content_filter=high${clientID}`)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("url", data.urls.regular);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("link", data.links.html);
        
        const img = new Image();
        img.src = data.urls.regular;
        
        img.onload = function() {
          if (backgroundImgContainer) {
            backgroundImgContainer.style.backgroundImage = `url(${this.src})`;
          }
          
          if (credit) {
            credit.innerHTML = `<a target="_blank">${data.user.name}</a>`;
          }
          if (navigate) {
            navigate.innerHTML = `<a target="_blank" style="color: white; font-size:130%;" href="${data.links.html}">See on Unsplash</a>`;
          }
          
          if (quotesCache) {
            displayRandomQuote(quotesCache);
          } else {
            fetch('./static/data/quotes.json')
              .then(response => response.json())
              .then(quoteData => {
                quotesCache = quoteData;
                displayRandomQuote(quoteData);
              });
          }
          
          setTimeout(() => {
            if (backgroundImgContainer) backgroundImgContainer.style.opacity = 1;
            if (quotes) quotes.style.opacity = 1;
          }, 100);
        };
      })
      .catch((err) => {
        console.error(err);
        if (quotesCache) {
          displayRandomQuote(quotesCache);
        }
        if (quotes) quotes.style.opacity = 1;
        if (backgroundImgContainer) backgroundImgContainer.style.opacity = 1;
      });
  }, 500);
}

function init() {
  getTime();
  
  Promise.all([
    new Promise(resolve => {
      fetchImage();
      resolve();
    }),
    new Promise(resolve => {
      displayMotivationalQuote();
      resolve();
    }),
    new Promise(resolve => {
      topSites();
      resolve();
    })
  ]).then(() => {
    console.log("All content loaded");
  });
  
  if (changeBtn) {
    changeBtn.addEventListener("click", () => {
      unsplashGetPhotos();
    });
  }
}

window.onload = function () {
  init();
};

function getTime() {
  var systemDate = new Date();
  var hours = systemDate.getHours();
  var minutes = systemDate.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  var twelve = hours % 12;
  hours = twelve == 0 ? 12 : twelve;
  _hours = checkTimeAddZero(hours);
  _minutes = checkTimeAddZero(minutes);
  
  const timeElement = document.getElementById("current-time");
  if (!timeElement) return;
  
  var timeInDOM = timeElement.innerHTML;
  var timeString = _hours + ":" + _minutes;
  if (timeInDOM !== timeString) {
    timeElement.innerHTML = timeString;
  }
}

setInterval(getTime, 1000);

function checkTimeAddZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getQuotes() {
  displayMotivationalQuote();
}
