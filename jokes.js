ModAPI.require("player");

var toggled = false;
var fetchingJoke = false;
const JOKE_FETCH_INTERVAL = 10000; // 30 seconds in milliseconds
var lastJokeTime = 0;

ModAPI.addEventListener("update", () => {
    if (toggled && !fetchingJoke && canSendJoke()) {
        fetchingJoke = true;

        fetchJokeAndSend().then(() => {
            fetchingJoke = false;
        });
    }
});

ModAPI.addEventListener("sendchatmessage", (e) => {
    if (e.message.startsWith(".joke")) {
        toggled = !toggled;

        if (!toggled) {
            lastJokeTime = 0;
            fetchingJoke = false;
        }
    }
});

function canSendJoke() {
    return (Date.now() - lastJokeTime >= JOKE_FETCH_INTERVAL);
}

function fetchJokeAndSend() {
    return new Promise((resolve, reject) => {
        fetch("https://icanhazdadjoke.com/", {
            headers: {
                "Accept": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            const joke = data.joke;
            ModAPI.player.sendChatMessage({ message: joke });
            lastJokeTime = Date.now();
            resolve();
        })
        .catch(error => {
            console.error("Error fetching joke:", error);
            reject(error);
        });
    });
}
