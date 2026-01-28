const TimeDiv = document.getElementById("date-time-div");

function showDateTime() {
    const now = new Date();
    return now.toLocaleString(); 
}

console.log(showDateTime());
TimeDiv.innerText = showDateTime();
