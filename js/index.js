const API_URL = 'https://shinii-extension-l0xoq2p35-yukios-projects-13ff26f7.vercel.app/api/stream';


let timeStampEndStream = null ;
let TitleLastStream = null ;
let LinkVODLastStream = null ; 
let isStreamLive = false ; 
let previousStreamState = false ; 
let currentStreamTitle = null ; 
let viewerCount = null ; 
let redLedInterval = null;
let counterInterval = null;


function NotificationSound() {
  const audio = document.getElementById('notification-sound') ; 
  if(audio) {
    audio.currentTime = 0 ; // < = Son à 0s au cas où 
    audio.play().catch(e=> console.log('Erreur audio :' , e)) ; 
  }
}

function showNotification() {
  if(Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    new Notification('Shinii est en direct !' , {
      body : currentStreamTitle || 'Viens en stream chef ! ' , 
      icon : 'assets/images/Shinii.png' , 
      tag: 'shini-stream-' + Date.now() 
    });
  }
}

function updateCompteur() {
  
  if(isStreamLive) {
    if (!redLedInterval) {
      const led = document.getElementById("red");
      led.style.display = "block";
      redLedInterval = setInterval(() => {
        led.classList.toggle("on");
      }, 1000);
    }
    const paragraphe = document.getElementById("paragraphe");
    paragraphe.textContent = "Shinii est actuellement :";
    
    const chrono = document.getElementById("chrono");
    chrono.textContent=`EN DIRECT` ; 
    chrono.style.color = "#ff0000" ; 

    const titre = document.getElementById("titre");
    titre.innerHTML = `<a href="https://www.twitch.tv/shinii" target="_blank" style="color: inherit; text-decoration: none;">${currentStreamTitle}</a>`;

    const count = document.getElementById("count") ; 
    count.innerHTML = `${viewerCount}` ;
   
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = null;
    }
    return ;
}

  if(!timeStampEndStream) {
    return;
  }

  const paragraphe = document.getElementById("paragraphe");
  paragraphe.textContent = "Temps ecoule depuis le dernier stream :";

  updateCounterDisplay();

  const titre = document.getElementById("titre");
  titre.innerHTML = `<a href="${LinkVODLastStream}" target="_blank" style="color: inherit; text-decoration: none;">${TitleLastStream}</a>`;

  if (!counterInterval) {
    startCounterTimer();
  }
}

function updateCounterDisplay() {
  if (!timeStampEndStream || isStreamLive) return;
  
  const DateNow = Date.now();
  const Compteur = DateNow - timeStampEndStream;
  const CompteurSecondes = Math.floor((Compteur / 1000) % 60);
  const CompteurMinutes = Math.floor((Compteur / (1000*60)) % 60);
  const CompteurHeures = Math.floor((Compteur/(1000*60*60))%24);
  const CompteurJours = Math.floor((Compteur / (1000 * 60 * 60 * 24)));

  const chrono = document.getElementById("chrono");
  chrono.style.color = "";
  if (CompteurJours > 0) {
    chrono.textContent = `${CompteurJours} jours (${CompteurHeures}h ${CompteurMinutes}m ${CompteurSecondes}s)`;
  } else {
    chrono.textContent = `${CompteurHeures}h ${CompteurMinutes}m ${CompteurSecondes}s`;
  }
}

function startCounterTimer() {
  counterInterval = setInterval(updateCounterDisplay, 1000);
}

async function fetchShiniStreams() { 
  try {
  
    const res = await fetch(API_URL);
    const data = await res.json();
    
    previousStreamState = isStreamLive ;
    isStreamLive = data.isStreamLive;
    currentStreamTitle = data.currentStreamTitle;
    viewerCount = data.viewerCount;
    timeStampEndStream = data.timeStampEndStream;
    TitleLastStream = data.TitleLastStream;
    LinkVODLastStream = data.LinkVODLastStream;

    if(!previousStreamState && isStreamLive) { 
      console.log('Tu loupes le stream du siècle chez Shinii !') ; 
      NotificationSound() ; 
      showNotification() ;
    }
    
    if (!isStreamLive && redLedInterval) {
      clearInterval(redLedInterval);
      redLedInterval = null;
      const led = document.getElementById("red");
      led.style.display = "none";
      led.classList.remove("on");
    }
    
    updateCompteur();
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API:', error);
  }
}


document.addEventListener('DOMContentLoaded', function() {
  const led = document.getElementById("red");
  led.style.display = "none";
  
  fetchShiniStreams();
  setInterval(fetchShiniStreams, 10000);
});