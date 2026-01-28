chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "hydrationAlarm") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png", 
            title: "Hydration Reminder",
            message: "💧 Time to drink water!",
            priority: 2
        });
    }
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "SET_ALARM") {
        chrome.alarms.create("hydrationAlarm", {
            periodInMinutes: request.minutes
        });
    }
});