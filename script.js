const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start-btn");

const gridSize = 15;
const tileCount = canvas.width / gridSize;

let snake = [];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameInterval;
let speed = 200; // tempo em ms
let lastTouchX = null;
let lastTouchY = null;

function resetGame() {
  snake = [{ x: 7, y: 7 }];
  direction = { x: 0, y: 0 };
  score = 0;
  speed = 200;
  scoreEl.textContent = `Pontos: ${score}`;
  placeFood();
}

function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  // evita spawn no corpo da cobra
  if (snake.some(part => part.x === food.x && part.y === food.y)) {
    placeFood();
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // desenha comida
  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // desenha cobra
  ctx.fillStyle = "#0f0";
  snake.forEach(part => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  });
}

function update() {
  if (direction.x === 0 && direction.y === 0) return; // não mexe se sem direção

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // colisão nas paredes ou na própria cobra
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(part => part.x === head.x && part.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  // comeu comida
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = `Pontos: ${score}`;

    // acelera a cobra a cada comida
    speed = Math.max(50, speed - 5);
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);

    placeFood();
  } else {
    snake.pop(); // remove cauda se não comeu
  }
}

function gameLoop() {
  update();
  draw();
}

function endGame() {
  clearInterval(gameInterval);
  alert(`Fim de jogo! Sua pontuação: ${score}`);
  startBtn.style.display = "block";
}

function startGame() {
  resetGame();
  startBtn.style.display = "none";
  direction = { x: 1, y: 0 };
  gameInterval = setInterval(gameLoop, speed);
}

// Controle por toque: swipe para mudar direção
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  lastTouchX = touch.clientX;
  lastTouchY = touch.clientY;
});

canvas.addEventListener("touchmove", (e) => {
  if (lastTouchX === null || lastTouchY === null) return;

  const touch = e.touches[0];
  const dx = touch.clientX - lastTouchX;
  const dy = touch.clientY - lastTouchY;

  const threshold = 30;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > threshold && direction.x !== -1) {
      direction = { x: 1, y: 0 };
    } else if (dx < -threshold && direction.x !== 1) {
      direction = { x: -1, y: 0 };
    }
  } else {
    if (dy > threshold && direction.y !== -1) {
      direction = { x: 0, y: 1 };
    } else if (dy < -threshold && direction.y !== 1) {
      direction = { x: 0, y: -1 };
    }
  }

  lastTouchX = null;
  lastTouchY = null;

  e.preventDefault();
}, { passive: false });

// Controle por teclado (setas)
window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "ArrowUp":
      if (direction.y !== 1) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) direction = { x: 1, y: 0 };
      break;
  }
});

startBtn.addEventListener("click", startGame);

// Joystick: eventos de clique nos botões
document.querySelectorAll(".joy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.getAttribute("data-dir");

    switch (dir) {
      case "up":
        if (direction.y !== 1) direction = { x: 0, y: -1 };
        break;
      case "down":
        if (direction.y !== -1) direction = { x: 0, y: 1 };
        break;
      case "left":
        if (direction.x !== 1) direction = { x: -1, y: 0 };
        break;
      case "right":
        if (direction.x !== -1) direction = { x: 1, y: 0 };
        break;
    }
  });
});

