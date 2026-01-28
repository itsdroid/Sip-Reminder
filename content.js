let countdownTimer;
const weightInput = document.getElementById('weightInput');
const drinkInput = document.getElementById('drinkInput');
const countBtn = document.getElementById('Count-button');
const progressBar = document.querySelector('.progress-bar');
const trackPercent = document.getElementById('track-percent');
const reqStatus = document.getElementById('WateReqStatus');
const reminderText = document.getElementById('reminder');

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
    };
    document.getElementById('date-time-div').innerText = now.toLocaleString('en-US', options);
}

function startTimer(minutes) {
    if (countdownTimer) clearInterval(countdownTimer);
    let totalSeconds = minutes * 60;
    const statusText = document.querySelector('.status-text');

    countdownTimer = setInterval(() => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        statusText.innerText = `NEXT: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (totalSeconds <= 0) {
            clearInterval(countdownTimer);
            statusText.innerText = "TIME TO DRINK!";
            alert("💧 Time to hydrate!");
        }

        totalSeconds--;
    }, 1000);
}

document.getElementById('interval').addEventListener('change', (e) => {
    const selectedMinutes = parseInt(e.target.value);
    startTimer(selectedMinutes);
});

setInterval(updateDateTime, 1000); 
updateDateTime(); 
startTimer(document.getElementById('interval').value); 

let totalDrank = 0;
let dailyGoal = 2000; 

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastSavedDate = localStorage.getItem('lastResetDate');

    if (lastSavedDate !== today) {
        totalDrank = 0;
        localStorage.setItem('totalDrank', 0);
        localStorage.setItem('lastResetDate', today);
    } else {
        totalDrank = parseFloat(localStorage.getItem('totalDrank')) || 0;
    }
    
    const savedWeight = localStorage.getItem('userWeight');
    if (savedWeight) {
        weightInput.value = savedWeight;
        updateUI();
    }
}

function updateUI() {
    const weight = parseFloat(weightInput.value) || 0;
    if (weight > 0) {
        dailyGoal = weight * 35;
        const percentage = Math.min((totalDrank / dailyGoal) * 100, 100);

        progressBar.style.width = percentage + "%";
        trackPercent.innerText = `${Math.round(percentage)}%`;
        reqStatus.innerText = `Your goal: ${dailyGoal.toFixed(0)} mL | Drank: ${totalDrank} mL`;

        let message = "";
        if (percentage < 25) message = "Way to go! Keep sipping.";
        else if (percentage < 50) message = "Almost halfway there!";
        else if (percentage < 80) message = "You're doing great, almost done!";
        else if (percentage < 100) message = "Just a bit more!";
        else message = "Hydration Complete! 💧";

        reminderText.innerText = message;

        // Send to background script to show system notification
        chrome.runtime.sendMessage({
            type: "SHOW_NOTIFICATION",
            message: message,
            title: `Hydration: ${Math.round(percentage)}%`
        });
    }
}

function updateHydration() {
    const weight = parseFloat(weightInput.value);
    const addedWater = parseFloat(drinkInput.value) || 0;

    if (weight > 0) {
        totalDrank += addedWater;
        localStorage.setItem('totalDrank', totalDrank);
        localStorage.setItem('userWeight', weight);
        
        updateUI();
        drinkInput.value = "";
    } else {
        alert("Please enter a valid weight.");
    }
}

countBtn.addEventListener('click', updateHydration);

checkDailyReset();