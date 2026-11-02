const difficultySettings = {
    easy: {
        timeLimit: 40,
        targetScore: 15,
        spawnInterval: 1100,
        dropDuration: 4.5,
        obstacleChance: 0.15,
        milestones: [5, 10]
    },
    normal: {
        timeLimit: 30,
        targetScore: 20,
        spawnInterval: 900,
        dropDuration: 3.5,
        obstacleChance: 0.25,
        milestones: [5, 10, 15]
    },
    hard: {
        timeLimit: 25,
        targetScore: 25,
        spawnInterval: 750,
        dropDuration: 2.7,
        obstacleChance: 0.35,
        milestones: [5, 10, 15, 20]
    }
};

const winMessages = [
    "Amazing work! Every drop counts toward a brighter future.",
    "Mission complete! You made clean water the goal.",
    "You did it! Keep making waves for clean water."
];

const loseMessages = [
    "Every drop counts. Try again and keep making waves!",
    "The mission isn't over. Give it another go!",
    "Keep going—you are one step closer to clean water."
];

const milestoneMessages = [
    "Great start! Keep those clean drops coming!",
    "You're making a real splash!",
    "Fantastic progress—clean water is within reach!",
    "Incredible effort! Keep up the momentum!"
];

let gameRunning = false;
let score = 0;
let timeLeft = 30;
let currentSettings = difficultySettings.normal;
let milestoneTracker = [];
let dropMaker;
let timerInterval;
let milestoneTimeout;
let audioContext;

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const difficultySelect = document.getElementById("difficulty-select");
const scoreVal = document.getElementById("score-val");
const targetVal = document.getElementById("target-val");
const timerVal = document.getElementById("timer-val");
const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const finalScore = document.getElementById("final-score");
const milestonePopup = document.getElementById("milestone-popup");
const gameContainer = document.getElementById("game-container");

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", updateTarget);

function updateTarget() {
    currentSettings = difficultySettings[difficultySelect.value];
    targetVal.textContent = currentSettings.targetScore;
    timerVal.textContent = currentSettings.timeLimit;
}

function startGame() {
    if (gameRunning) return;

    updateTarget();
    gameRunning = true;
    score = 0;
    timeLeft = currentSettings.timeLimit;
    milestoneTracker = [];
    clearTimeout(milestoneTimeout);
    milestonePopup.classList.remove("visible");
    scoreVal.textContent = score;
    timerVal.textContent = timeLeft;
    difficultySelect.disabled = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextConstructor && !audioContext) {
        audioContext = new AudioContextConstructor();
    }

    dropMaker = setInterval(createDrop, currentSettings.spawnInterval);
    timerInterval = setInterval(() => {
        timeLeft = Math.max(0, timeLeft - 1);
        timerVal.textContent = timeLeft;

        if (timeLeft === 0) {
            endGame(score >= currentSettings.targetScore);
        }
    }, 1000);
}

function createDrop() {
    if (!gameRunning) return;

    const drop = document.createElement("button");
    const isObstacle = Math.random() < currentSettings.obstacleChance;
    drop.type = "button";
    drop.className = isObstacle ? "bad-drop" : "water-drop";
    drop.setAttribute(
        "aria-label",
        isObstacle ? "Contaminated water: click to lose 2 points" : "Clean water: click to earn 1 point"
    );

    const size = 55 * (Math.random() * 0.7 + 0.6);
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    const maxLeft = Math.max(0, gameContainer.clientWidth - size);
    drop.style.left = `${Math.random() * maxLeft}px`;
    drop.style.animationDuration = `${currentSettings.dropDuration}s`;
    gameContainer.appendChild(drop);

    drop.addEventListener("click", () => {
        if (!gameRunning) return;

        if (isObstacle) {
            score = Math.max(0, score - 2);
            playSound(180, 0.18, "sawtooth");
            triggerFlash();
        } else {
            score += 1;
            playSound(660, 0.12);
            checkMilestones();
        }

        scoreVal.textContent = score;
        drop.remove();

        if (score >= currentSettings.targetScore) {
            endGame(true);
        }
    });

    drop.addEventListener("animationend", () => drop.remove(), { once: true });
}

function checkMilestones() {
    const milestone = currentSettings.milestones.find(
        threshold => score >= threshold && !milestoneTracker.includes(threshold)
    );
    if (milestone === undefined) return;

    milestoneTracker.push(milestone);
    const messageIndex = milestoneTracker.length - 1;
    milestonePopup.textContent = milestoneMessages[messageIndex % milestoneMessages.length];
    milestonePopup.classList.add("visible");
    playSound(880, 0.2);
    clearTimeout(milestoneTimeout);
    milestoneTimeout = setTimeout(() => {
        milestonePopup.classList.remove("visible");
    }, 1800);
}

function playSound(frequency, duration, waveform = "sine") {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
}

function endGame(won) {
    if (!gameRunning) return;

    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(timerInterval);
    clearTimeout(milestoneTimeout);
    milestonePopup.classList.remove("visible");
    difficultySelect.disabled = false;
    document.querySelectorAll(".water-drop, .bad-drop").forEach(drop => drop.remove());

    finalScore.textContent = score;
    endTitle.textContent = won ? "MISSION SUCCESS" : "TIME EXPIRED";
    endMessage.textContent = pickMessage(won ? winMessages : loseMessages);
    gameOverScreen.classList.remove("hidden");

    if (won && typeof confetti === "function") {
        confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#FFC907", "#003366", "#BF6C46"]
        });
    }
}

function pickMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function resetGame() {
    gameOverScreen.classList.add("hidden");
    startGame();
}

function triggerFlash() {
    gameContainer.classList.add("penalty-flash");
    setTimeout(() => gameContainer.classList.remove("penalty-flash"), 200);
}

updateTarget();
