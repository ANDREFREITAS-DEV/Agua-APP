export const Notifications = {
    requestPermission: async () => {
        if (!("Notification" in window)) return;
        
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            await Notification.requestPermission();
        }
    },

    send: (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: '/assets/icons/icon-192.png',
                vibrate: [200, 100, 200]
            });
        }
    },

    // Simulação de lembrete simples (intervalo)
    startReminder: (intervalHours = 2) => {
        setInterval(() => {
            Notifications.send("Hora de beber água!", "Mantenha-se hidratado para atingir sua meta.");
        }, intervalHours * 60 * 60 * 1000);
    }
};