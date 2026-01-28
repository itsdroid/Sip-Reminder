chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SHOW_NOTIFICATION") {
        chrome.notifications.create({
            type: "basic",
            title: request.title,
            message: request.message,
            priority: 2
        });
    }
});