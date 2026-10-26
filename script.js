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

    // Reset variables & UI states
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
    
    // 25% chance to spawn an obstacle (bad drop) for the Challenge LevelUp
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
            // Penalty for hitting bad drop
            score = Math.max(0, score - 2);
            triggerFlash('#ff003c');
        } else {
            // Reward for clean water drop
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

    // Clean up any remaining falling elements on screen
    document.querySelectorAll(".water-drop, .bad-drop").forEach(el => el.remove());

    // Show Game Over / Results Screen
    finalScore.textContent = score;
    if (won) {
        endTitle.textContent = "MISSION SUCCESS";
        endMessage.innerHTML = `Supplies secured! Final Score: <span id="final-score">${score}</span>`;
        
        // Celebrate Wins LevelUp (Confetti effect)
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#ff003c', '#ffffff', '#8b8b9e']
            });
        }
    } else {
        endTitle.textContent = "MISSION FAILED";
        endMessage.innerHTML = `Time expired. Final Score: <span id="final-score">${score}</span>`;
    }

    gameOverScreen.classList.remove("hidden");
}

function resetGame() {
    gameOverScreen.classList.add("hidden");
    startGame();
}

// Visual flash feedback helper when clicking bad drops
function triggerFlash(color) {
    gameContainer.style.borderColor = color;
    setTimeout(() => {
        gameContainer.style.borderColor = "var(--neon-red)";
    }, 200);
}