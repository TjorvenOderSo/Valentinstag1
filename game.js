const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GRAVITY = 1.0;
const JUMP = -11;

let mouseX = canvas.width / 2;

const player = {
  x: canvas.width / 2,
  y: canvas.height - 150,
  r: 18,
  vy: 0
};

let platforms = [];
let hearts = [];
let score = 0;
let gameOver = false;

// Maussteuerung
document.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

// Plattformen erzeugen
function createPlatforms() {
  platforms = [];
  let y = canvas.height - 50;

  for (let i = 0; i < 10; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 100),
      y: y,
      w: 100,
      h: 15
    });

    // Herz auf jeder 2. Plattform
    if (i % 2 === 0) {
      hearts.push({
        x: platforms[i].x + 40,
        y: platforms[i].y - 20,
        r: 10,
        collected: false
      });
    }

    y -= 80;
  }
}

createPlatforms();

// Spiel-Loop
function update() {
  if (gameOver) return;

  // Spielerbewegung
  player.vy += GRAVITY;
  player.y += player.vy;

  // Maus folgen
  player.x += (mouseX - player.x) * 0.2;

  // Plattform-Kollision
  platforms.forEach(p => {
    if (
      player.vy > 0 &&
      player.x + player.r > p.x &&
      player.x - player.r < p.x + p.w &&
      player.y + player.r > p.y &&
      player.y + player.r < p.y + p.h
    ) {
      player.vy = JUMP;
    }
  });

  // Herzen sammeln
  hearts.forEach(h => {
    if (!h.collected) {
      const dx = player.x - h.x;
      const dy = player.y - h.y;
      if (Math.sqrt(dx * dx + dy * dy) < player.r + h.r) {
        h.collected = true;
        score++;
      }
    }
  });

  // Kamera nach oben
  if (player.y < canvas.height / 2) {
    const diff = canvas.height / 2 - player.y;
    player.y = canvas.height / 2;

    platforms.forEach(p => p.y += diff);
    hearts.forEach(h => h.y += diff);

    // Neue Plattform oben
    if (platforms[0].y > 0) {
      platforms.unshift({
        x: Math.random() * (canvas.width - 100),
        y: platforms[0].y - 80,
        w: 100,
        h: 15
      });

      hearts.unshift({
        x: platforms[0].x + 40,
        y: platforms[0].y - 20,
        r: 10,
        collected: false
      });
    }
  }

  // Tod
  if (player.y > canvas.height) {
    gameOver = true;
    setTimeout(() => location.reload(), 1500);
  }
}

// Zeichnen
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Plattformen
  ctx.fillStyle = "#ff69b4";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  // Herzen
  ctx.fillStyle = "red";
  hearts.forEach(h => {
    if (!h.collected) {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Spieler
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // Score
  ctx.fillStyle = "#000";
  ctx.fillText("❤️ " + score, 20, 30);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
