const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 20;
const rows = 20;
const cols = 20;
canvas.width = cols * tileSize;
canvas.height = rows * tileSize;

let snake = [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
];

let direction = { x: 1, y: 0 };
let food = getRandomFoodPosition();
let score = 0;
let highScore = 0;
let gameOver = false;
let gamePaused = false;
let gameSpeed = 100;

function getRandomFoodPosition() {
    let foodPosition;
    while (foodPosition == null || snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y)) {
        foodPosition = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
        };
    }
    return foodPosition;
}

function drawGround() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#0F0';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    });
}

function drawFood() {
    ctx.fillStyle = '#F00';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
}

function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = getRandomFoodPosition();
        score++;
        if (score > highScore) {
            highScore = score;
        }
        if (gameSpeed > 50) {
            gameSpeed -= 5;
        }
    } else {
        snake.pop();
    }
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

    return false;
}

function update() {
    if (!gameOver && !gamePaused) {
        updateSnake();
        if (checkCollision()) {
            gameOver = true;
        }
    }
}

function draw() {
    drawGround();
    drawSnake();
    drawFood();
    drawScore();
    drawHighScore();
    if (gameOver) {
        drawGameOver();
    }
    if (gamePaused && !gameOver) {
        drawPauseScreen();
    }
}

function drawScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function drawHighScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('High Score: ' + highScore, 10, 40);
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
            if (gameOver) resetGame();
            break;
        case ' ':
            if (!gameOver) gamePaused = !gamePaused;
            break;
    }
});

resetGame();
gameLoop();
