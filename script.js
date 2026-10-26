// Game State Variables
let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropMaker;
let timerInterval;

const targetScore = 15; // Score required to win

// DOM Elements
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const scoreVal = document.getElementById("score-val");
const timerVal = document.getElementById("timer-val");
const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const finalScore = document.getElementById("final-score");
const gameContainer = document.getElementById("game-container");

// Event Listeners
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

function startGame() {
    if (gameRunning) return;

    // Reset state variables & UI
    gameRunning = true;
    score = 0;
    timeLeft = 30;
    scoreVal.textContent = score;
    timerVal.textContent = timeLeft;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    // Spawn elements every 900ms
    dropMaker = setInterval(createDrop, 900);

    // Run game countdown timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timerVal.textContent = timeLeft;

        if (score >= targetScore) {
            endGame(true);
        } else if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function createDrop() {
    if (!gameRunning) return;

    const drop = document.createElement("div");
    
    // 25% chance to spawn a contaminated drop (Challenge / Obstacle LevelUp)
    const isObstacle = Math.random() < 0.25;
    
    if (isObstacle) {
        drop.className = "bad-drop";
    } else {
        drop.className = "water-drop";
    }

    // Varied sizing
    const initialSize = 55;
    const sizeMultiplier = Math.random() * 0.7 + 0.6;
    const size = initialSize * sizeMultiplier;
    drop.style.width = drop.style.height = `${size}px`;

    // Random horizontal positioning inside container bounds
    const gameWidth = gameContainer.offsetWidth;
    const xPosition = Math.random() * (gameWidth - 60);
    drop.style.left = xPosition + "px";

    // Fall speed (3.5 seconds)
    drop.style.animationDuration = "3.5s";

    gameContainer.appendChild(drop);

    // Click Interaction Handling
    drop.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        if (!gameRunning) return;

        if (isObstacle) {
            // Penalty for clicking dirty water
            score = Math.max(0, score - 2);
            triggerFlash('#BF6C46');
        } else {
            // Reward for collecting clean water
            score += 1;
        }
        
        scoreVal.textContent = score;
        drop.remove();

        // Check instant win condition
        if (score >= targetScore) {
            endGame(true);
        }
    });

    // Remove drop automatically when animation finishes
    drop.addEventListener("animationend", () => {
        drop.remove();
    });
}

function endGame(won) {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(timerInterval);

    // Clean up active falling items
    document.querySelectorAll(".water-drop, .bad-drop").forEach(el => el.remove());

    // Show Game Over / Results Screen
    finalScore.textContent = score;
    if (won) {
        endTitle.textContent = "MISSION SUCCESS";
        endMessage.innerHTML = `Clean water supplied! Final Score: <span id="final-score">${score}</span>`;
        
        // Celebrate Wins LevelUp (Confetti effect using official brand accent colors)
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 130,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#FFC907', '#003366', '#BF6C46']
            });
        }
    } else {
        endTitle.textContent = "TIME EXPIRED";
        endMessage.innerHTML = `Keep fighting for clean water. Final Score: <span id="final-score">${score}</span>`;
    }

    gameOverScreen.classList.remove("hidden");
}

function resetGame() {
    gameOverScreen.classList.add("hidden");
    startGame();
}

// Visual flash feedback helper when clicking obstacles
function triggerFlash(color) {
    gameContainer.style.borderColor = color;
    setTimeout(() => {
        gameContainer.style.borderColor = "var(--cw-blue)";
    }, 200);
}