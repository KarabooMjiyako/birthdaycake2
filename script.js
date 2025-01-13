document.addEventListener("DOMContentLoaded", function() {
    let user = prompt("Write your first name:");
    while (!user || user.trim().length < 2) {
        user = prompt("Please write your first name:");
    }
    document.title = `Happy Birthday ${user}!`;
    document.querySelector("h1").textContent = `Happy Birthday ${user}!`;

    const mic = document.getElementById("mic");
    const cursor = document.getElementById("cursor");
    const flame = document.getElementById("flame");

    if (!mic || !cursor || !flame) {
        console.error("Required elements are missing.");
        return;
    }

    const flameRect = flame.getBoundingClientRect();
    let flameOpacity = 1;

    mic.addEventListener("click", function() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const micSource = audioContext.createMediaStreamSource(stream);
                micSource.connect(analyser);
                analyser.fftSize = 256;
                const data = new Uint8Array(analyser.frequencyBinCount);

                function detectBlow() {
                    analyser.getByteFrequencyData(data);
                    const average = data.reduce((a, b) => a + b) / data.length;
                    if (average > 110) {
                        flameOpacity = Math.max(0, flameOpacity - 0.05);
                        flame.style.opacity = flameOpacity;
                    }
                    requestAnimationFrame(detectBlow);
                }

                detectBlow();
            })
            .catch(err => console.error("Microphone access error:", err));
    });

    cursor.addEventListener("click", function() {
        document.addEventListener("mousemove", function(event) {
            const { clientX: x, clientY: y } = event;
            const inRadius = (
                x >= flameRect.left - 500 &&
                x <= flameRect.right + 500 &&
                y >= flameRect.top - 500 &&
                y <= flameRect.bottom + 500
            );
            if (inRadius) {
                flameOpacity = Math.max(0, flameOpacity - 0.01);
                flame.style.opacity = flameOpacity;
            }
        });
    });
});
