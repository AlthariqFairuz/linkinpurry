self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title;
    const body = data.body;
    const icon = "/linkedin.svg"
    const url = data.data.url;

    const notificationOptions = {
        body: body,
        tag: "unique-tag", 
        icon: icon,
        data: {
            url: url, 
        },
    };
    
    event.waitUntil(self.registration.showNotification(title, notificationOptions))
});

self.addEventListener('notificationclick', (event) => {
    const url = event.notification.data.url;
    if (url) event.waitUntil(clients.openWindow(url));
    event.notification.close();
});