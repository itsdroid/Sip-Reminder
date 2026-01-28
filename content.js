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
    if (!minutes) return;

    const now = Date.now();
    const durationMs = minutes * 60 * 1000;

    let startTime = localStorage.getItem('timerStartTime');
    let savedMinutes = localStorage.getItem('selectedInterval');

    if (!startTime || savedMinutes != minutes) {
        startTime = now;
        localStorage.setItem('timerStartTime', startTime);
        localStorage.setItem('selectedInterval', minutes);

        chrome.runtime.sendMessage({ type: "SET_ALARM", minutes: parseInt(minutes) });
    }

    const statusText = document.querySelector('.status-text');

    countdownTimer = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const remainingMs = durationMs - (elapsed % durationMs);

        const totalSeconds = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        statusText.innerText = `NEXT: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (totalSeconds <= 0) {
            statusText.innerText = "TIME TO DRINK!";
            alert("💧 Time to hydrate!");
        }
    }, 1000);
}


const savedInterval = localStorage.getItem('selectedInterval');
if (savedInterval) {
    drinkInput.value = ""; // Clear input but keep timer
    weightInput.value = localStorage.getItem('userWeight') || "";
    document.getElementById('interval').value = savedInterval;
    startTimer(savedInterval);
} else {
    startTimer(document.getElementById('interval').value);
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

        if (percentage < 25) reminderText.innerText = "Way to go! Keep sipping.";
        else if (percentage < 50) reminderText.innerText = "Almost halfway there!";
        else if (percentage < 80) reminderText.innerText = "You're doing great, almost done!";
        else if (percentage < 100) reminderText.innerText = "Just a bit more!";
        else reminderText.innerText = "Hydration Complete! 💧";
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