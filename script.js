document.addEventListener("DOMContentLoaded", function() {
    // Prompt user for first name
    let user = prompt("Write your first name:");
    while (!user || user.length < 2) {
        user = prompt("Please write your first name (at least 2 characters):");
    }

    document.title = `Happy Birthday ${user}!`;
    document.querySelector("h1").textContent = `Happy Birthday ${user}!`;

    // Constant variables
    const mic = document.getElementById("mic");
    const cursor = document.getElementById("cursor");
    const flame = document.getElementById("flame");
    const cursorInstructions = document.getElementById("cursorInstructions");
    const micInstructions = document.getElementById("micInstructions");
    micInstructions.style.display = "none";
    cursorInstructions.style.display = "none";
    const instructionsContainer = document.querySelector(".instructions-container");

    // Blow detection variables
    let audioContext;
    let micStream;
    let analyser;
    let blowThreshold = 110;
    let flameOpacity = 1;
    let isMicInitialized = false;

    // Function to start blow detection
    function startBlowDetection() {
        if (isMicInitialized) return;
        isMicInitialized = true;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                audioContext = new AudioContext();
                micStream = stream;
                const microphone = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                microphone.connect(analyser);
                listenForBlow();
            })
            .catch(function(err) {
                console.error("Error accessing microphone:", err);
            });
    }

    // Listen for blow function
    function listenForBlow() {
        const buffer = analyser.frequencyBinCount;
        const data = new Uint8Array(buffer);

        function detectBlow() {
            analyser.getByteFrequencyData(data);

            let sum = 0;
            for (let i = 0; i < buffer; i++) {
                sum += data[i];
            }
            const averageAmplitude = sum / buffer;

            if (averageAmplitude > blowThreshold) {
                flameOpacity -= 0.05;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                    document.getElementById("gift").style.display = "block";
                }
                flame.style.opacity = flameOpacity;
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    }

    // Cursor movement logic
    cursor.addEventListener("click", function() {
        cursorInstructions.style.display = "block";
        micInstructions.style.display = "none";
        instructionsContainer.style.display = "none";

        let prevX = null, prevY = null, prevTime = null;
        const flameRadius = 500;

        document.addEventListener("mousemove", function(event) {
            const x = event.clientX;
            const y = event.clientY;

            if (!flame) return;

            const inFlameRadius = (
                x >= flame.offsetLeft - flameRadius &&
                x <= flame.offsetLeft + flame.offsetWidth + flameRadius &&
                y >= flame.offsetTop - flameRadius &&
                y <= flame.offsetTop + flame.offsetHeight + flameRadius
            );

            if (inFlameRadius) {
                let speed = 0;
                if (prevX !== null && prevY !== null && prevTime !== null) {
                    const timeElapsed = performance.now() - prevTime;
                    speed = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2)) / timeElapsed;
                }

                flameOpacity -= speed * 0.01;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                    document.getElementById("gift").style.display = "block";
                }
                flame.style.opacity = flameOpacity;
            }

            prevX = x;
            prevY = y;
            prevTime = performance.now();
        });
    });

    // Microphone button click handler
    mic.addEventListener("click", function() {
        micInstructions.style.display = "block";
        cursorInstructions.style.display = "none";
        instructionsContainer.style.display = "none";
        startBlowDetection();
    });

    // Cleanup resources on page unload
    window.addEventListener("beforeunload", function() {
        if (audioContext) {
            audioContext.close();
            micStream.getTracks().forEach(track => track.stop());
        }
    });
});
