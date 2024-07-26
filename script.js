const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 20;
const rows = 20;
const cols = 20;
canvas.width = cols * tileSize;
canvas.height = rows * tileSize;

let playerName = prompt("Enter your name:");
let snake = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
];

let direction = { x: 1, y: 0 };
let obstacles = [];
let food = getRandomFoodPosition();
let specialFood = getRandomFoodPosition();
let powerUps = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let gamePaused = false;
let gameSpeed = 100;
let level = 1;
let specialFoodActive = false;
let specialFoodTimer = 0;
let difficulty = 1;
let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
const maxHistorySize = 5;
let powerUpTimer = 0;
let powerUpActive = false;

document.getElementById('playerName').innerText = playerName;
document.getElementById('highScore').innerText = highScore;
document.getElementById('level').innerText = level;
updateScoreboard();
updateGameHistory();

function getRandomFoodPosition() {
    let foodPosition;
    while (foodPosition == null || snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y) || obstacles.some(obstacle => obstacle.x === foodPosition.x && obstacle.y === foodPosition.y)) {
        foodPosition = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
        };
    }
    return foodPosition;
}

function getRandomPowerUpPosition() {
    let powerUpPosition;
    while (powerUpPosition == null || snake.some(segment => segment.x === powerUpPosition.x && segment.y === powerUpPosition.y) || obstacles.some(obstacle => obstacle.x === powerUpPosition.x && obstacle.y === powerUpPosition.y)) {
        powerUpPosition = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
        };
    }
    return powerUpPosition;
}

function drawGround() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#111');
    gradient.addColorStop(1, '#333');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#0F0';
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    });
}

function drawFood() {
    ctx.fillStyle = '#F00';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
}

function drawSpecialFood() {
    if (specialFoodActive) {
        ctx.fillStyle = '#00F';
        ctx.fillRect(specialFood.x * tileSize, specialFood.y * tileSize, tileSize, tileSize);
    }
}

function drawObstacles() {
    ctx.fillStyle = '#FF0';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * tileSize, obstacle.y * tileSize, tileSize, tileSize);
    });
}

function drawPowerUps() {
    ctx.fillStyle = '#0FF';
    powerUps.forEach(powerUp => {
        ctx.fillRect(powerUp.x * tileSize, powerUp.y * tileSize, tileSize, tileSize);
    });
}

function drawScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = `<h2>Scoreboard</h2><ul>${gameHistory.map((entry, index) => `<li>${index + 1}. ${entry.name}: ${entry.score}</li>`).join('')}</ul>`;
}

function drawGameHistory() {
    const gameHistoryElem = document.getElementById('gameHistory');
    gameHistoryElem.innerHTML = `<h2>Recent Games</h2><ul>${gameHistory.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('')}</ul>`;
}

function updateScoreboard() {
    gameHistory = gameHistory.slice(0, maxHistorySize);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    gameHistory.push({ name: playerName, score: highScore });
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    drawScoreboard();
}

function updateGameHistory() {
    gameHistory = gameHistory.slice(0, maxHistorySize);
    drawGameHistory();
}

function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = getRandomFoodPosition();
        score += difficulty;
        if (score > highScore) {
            updateScoreboard();
        }
        if (gameSpeed > 30) {
            gameSpeed -= 2;
        }
        if (score % 5 === 0) {
            level++;
            difficulty++;
            addObstaclesForLevel();
        }
    } else if (specialFoodActive && head.x === specialFood.x && specialFood.y === head.y) {
        specialFoodActive = false;
        specialFoodTimer = 0;
        score += 5 * difficulty;
        if (score > highScore) {
            updateScoreboard();
        }
    } else {
        snake.pop();
    }
}

function addObstaclesForLevel() {
    obstacles = [];
    for (let i = 0; i < level * 2; i++) {
        addObstacle();
    }
}

function addObstacle() {
    let obstaclePosition;
    while (obstaclePosition == null || snake.some(segment => segment.x === obstaclePosition.x && segment.y === obstaclePosition.y) || obstacles.some(obstacle => obstacle.x === obstaclePosition.x && obstacle.y === obstaclePosition.y)) {
        obstaclePosition = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
        };
    }
    obstacles.push(obstaclePosition);
}

function addPowerUp() {
    let powerUpPosition;
    while (powerUpPosition == null || snake.some(segment => segment.x === powerUpPosition.x && segment.y === powerUpPosition.y) || obstacles.some(obstacle => obstacle.x === powerUpPosition.x && obstacle.y === powerUpPosition.y)) {
        powerUpPosition = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
        };
    }
    powerUps.push(powerUpPosition);
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x === head.x && obstacles[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function update() {
    if (!gameOver && !gamePaused) {
        updateSnake();
        if (checkCollision()) {
            gameOver = true;
        }
        if (specialFoodTimer > 0) {
            specialFoodTimer--;
        } else {
            specialFoodActive = Math.random() < 0.1;
            specialFood = getRandomFoodPosition();
            specialFoodTimer = specialFoodActive ? 50 : 0;
        }
        if (powerUpTimer > 0) {
            powerUpTimer--;
        } else {
            powerUps = [];
            if (Math.random() < 0.1) {
                addPowerUp();
                powerUpActive = true;
                powerUpTimer = 50;
            }
        }
        if (powerUpActive) {
            const head = snake[0];
            powerUps.forEach((powerUp, index) => {
                if (head.x === powerUp.x && head.y === powerUp.y) {
                    powerUps.splice(index, 1);
                    powerUpActive = false;
                    powerUpTimer = 0;
                    score += 10;
                }
            });
        }
    }
}

function draw() {
    drawGround();
    drawSnake();
    drawFood();
    drawSpecialFood();
    drawObstacles();
    drawPowerUps();
    drawScore();
    drawHighScore();
    drawLevel();
    if (gameOver) {
        drawGameOver();
    }
    if (gamePaused && !gameOver) {
        drawPauseScreen();
    }
}

function drawScore() {
    document.getElementById('currentScore').innerText = score;
}

function drawHighScore() {
    document.getElementById('highScore').innerText = highScore;
}

function drawLevel() {
    document.getElementById('level').innerText = level;
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space to Resume', canvas.width / 2, canvas.height / 2 + 40);
}

function resetGame() {
    snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 },
    ];
    direction = { x: 1, y: 0 };
    food = getRandomFoodPosition();
    score = 0;
    gameOver = false;
    gameSpeed = 100;
    level = 1;
    difficulty = 1;
    obstacles = [];
    powerUps = [];
    specialFoodActive = false;
    specialFoodTimer = 0;
    powerUpActive = false;
    powerUpTimer = 0;
    document.getElementById('currentScore').innerText = score;
    document.getElementById('level').innerText = level;
}

function gameLoop() {
    setTimeout(function onTick() {
        update();
        draw();
        gameLoop();
    }, gameSpeed);
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
        case 'Enter':
            if (gameOver) {
                resetGame();
                gameLoop();
            }
            break;
        case ' ':
            if (gameOver) {
                resetGame();
                gameLoop();
            } else {
                gamePaused = !gamePaused;
            }
            break;
        case '+':
            if (!gameOver && !gamePaused) {
                gameSpeed = Math.max(10, gameSpeed - 10);
            }
            break;
        case '-':
            if (!gameOver && !gamePaused) {
                gameSpeed = Math.min(300, gameSpeed + 10);
            }
            break;
    }
});

gameLoop();
