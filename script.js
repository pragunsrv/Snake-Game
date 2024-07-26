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
    updateSnake();
    if (checkCollision()) {
        resetGame();
    }
}

function draw() {
    drawGround();
    drawSnake();
    drawFood();
    drawScore();
}

function drawScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
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
}

function gameLoop() {
    setTimeout(function onTick() {
        update();
        draw();
        gameLoop();
    }, 100);
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
    }
});

resetGame();
gameLoop();
