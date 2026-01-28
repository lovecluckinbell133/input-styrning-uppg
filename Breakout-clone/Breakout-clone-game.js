import Input, { Keys, MouseButtons } from './input.js';
import Button from './button.js';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext("2d");
const input = new Input(canvas);

const button1 = new Button(input, { text: 'Start Game', x: canvas.width / 2 - 75, y:250, width: 150, height: 100, fillColor:"#2599cf", hoverFillColor: "#3dbbf1" });
const button2 = new Button(input, { text: 'Try again?', x: canvas.width / 2 - 75, y:250, width: 150, height: 100, fillColor:"#2599cf", hoverFillColor: "#3dbbf1" });

let greetingText = {text: "Brick-Buster", x: canvas.width / 2 - 100, y: 150, color: "white", fillColor:"grey"};
let currentScene = "menu";
let lastTime = performance.now();

let gameoverText = {text: "Game over", x: canvas.width / 2 - 200, y: 150, color: "white", fillColor:"grey"};



  let gamedata = {
    x: canvas.width /2, 
    y:canvas.height / 2,
    text: 0.00,
    timer: 0,
    score: 0
    };

      let velocity = {
      x:150,
      y:100
    }

    const acceleration = {
    x:1600,
    y:900
}

const friction = 0.99;

  let targets = [];

let targetWidth = 50;
let targetHeight = 25;
let spacing = 10;
let targetsPerRow = 8;
let rows = 3;
let startY = 80;
let rowSpacing = 25;

for (let r = 0; r < rows; r++) {
    let y = startY + r * (targetHeight + rowSpacing);
    let startX = 40;
    for (let i = 0; i < targetsPerRow; i++) {
        let x = startX + i * (targetWidth + spacing);
        targets.push({ x: x, y: y, width: targetWidth, height: targetHeight });
    }
}
  

  let ball = {
     x: 200, 
    y: 350,
    r: 15,
  };
  const maxHorizontalSpeed = 250;

  let ballVelocity = {
    x: 250,
    y: 250
  };

    let player = {
    x: 200, 
    y: 580,
    height: 25,
    width: 150,
    };

  const originalPlayer = { ...player };
  const originalBall = { ...ball };
  const boxWidth = canvas.width;
  const boxHeight = 50;
  const boxX = (canvas.width / 2) - (boxWidth / 2);
  const boxY = (25) - (boxHeight / 2);
  const originalTargets = [ ...targets ];

gameLoop(performance.now());


function gameLoop(currentTime) {
const deltaTime = (currentTime - lastTime) / 1000; // sekunder
ctx.clearRect(0, 0, canvas.width, canvas.height);

lastTime = currentTime;

input.update();
update(deltaTime); // uppdatera objekt
render(); // rita objekt på canvas

requestAnimationFrame(gameLoop);
}
  function updateMenu() {
      if (button1.clicked()) {
    currentScene = "game";
    console.log('Knapp1 klickades!')
    console.log(currentScene)
 }
}

function updateGame(){

 if (targets.length == 0) {
currentScene = "gameover";
};
}

function updateGameOver() { 
  gameoverText.text = "Game over. You got " + gamedata.score + " Points!";

    if (button1.clicked()) {
      currentScene = "game";
      resetGame();
return;
  }
}

function resetGame() {
      player = { ...originalPlayer };
    gamedata = { x: canvas.width /2, y: canvas.height / 2, text: 0.00, timer: 0, score: 0 };
    velocity = { x: 0, y: 0 };
    targets = [ ...originalTargets ];
    ball = { ...originalBall };
}

function clamp(min, max, value) {
        if (value < min){
            return min;
        } else if(value > max){
            return max;
        } else {
            return value;
        }
    }

function playerBallCollision(player, ball) {
    const closestX = clamp(player.x, player.x + player.width, ball.x);
    const closestY = clamp(player.y, player.y + player.height, ball.y);
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return (dx * dx + dy * dy) < (ball.r * ball.r);
}

function targetBallCollision(target, ball) {
    const closestX = clamp(target.x, target.x + target.width, ball.x);
    const closestY = clamp(target.y, target.y + target.height, ball.y);
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return (dx * dx + dy * dy) < (ball.r * ball.r);
}

function update(deltaTime) {

  if (currentScene === "menu") {
    updateMenu();
    return;
  }

  if (currentScene === "gameover") {
    updateGameOver();
    return;
  }


  updateGame();

  if (input.getKey(Keys.D) && player.x + player.width < canvas.width) {
    velocity.x += acceleration.x * deltaTime;
  }

  if (input.getKey(Keys.A) && player.x > 0) {
    velocity.x -= acceleration.x * deltaTime;
  }


  player.x += velocity.x * deltaTime;

  velocity.x *= Math.pow(1 - friction, deltaTime);


  ball.x += ballVelocity.x * deltaTime;
  ball.y += ballVelocity.y * deltaTime;


  if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) {
    ballVelocity.x *= -1;
  }

  if (ball.y - ball.r < 55) {
    ballVelocity.y *= -1;
  }

  if (ball.y + ball.r > canvas.height) {
    currentScene = "gameover";
    return;
  }

  if (playerBallCollision(player, ball) && ballVelocity.y > 0) {

    let paddleCenter = player.x + player.width / 2;
    let ballCenter = ball.x + ball.r;

    let hitPos = (ballCenter - paddleCenter) / (player.width / 2);
    hitPos = Math.max(-1, Math.min(1, hitPos));

    ballVelocity.x = hitPos * maxHorizontalSpeed;
    ballVelocity.y = -Math.abs(ballVelocity.y);

    console.log("Bounce!");
  }

  console.log(velocity);

  for (let i = targets.length - 1; i >= 0; i--) {
    if (targetBallCollision(targets[i], ball)) {

      ballVelocity.y *= -1;
      targets.splice(i, 1);
      gamedata.score++;
      break;
    }
  }


  if (gamedata.timer >= 0) {
    gamedata.text = gamedata.timer.toFixed(1);
    gamedata.timer += deltaTime;
  }
}


function render() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);

   if (currentScene === "menu") drawMenu(ctx);
  else if (currentScene === "game") drawGame(ctx);
  else if (currentScene === "gameover") drawGameOver(ctx);

  function drawMenu() {
 button1.draw(ctx);

 ctx.fillText(greetingText.text, greetingText.x, greetingText.y);
 ctx.font = "bold 36px Arial";
 ctx.fillStyle = greetingText.color;
 ctx.textBaseline = "middle";

 ctx.fillText(greetingText.text, greetingText.x, greetingText.y);
 ctx.font = "bold 36px Arial";
 ctx.fillStyle = "#ffff";
 ctx.textBaseline = "middle";
 }

 }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5261ce";
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, 50);

      ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";

  const text = gamedata.text;
  const textMetrics = ctx.measureText(text);  
  const textWidth = textMetrics.width;

    const textX = 180 + (200 / 2) - (textWidth / 2);
  const textY = 5 + (50 / 2);

  ctx.fillText(text, textX,textY);

    ctx.fillStyle = "#67a6ed";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x, player.y, player.width, player.height);


      ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffd800";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#3e3523";
    ctx.stroke();
    ctx.closePath();
  

  targets.forEach(target => {
  ctx.fillStyle = "#fc441b";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#3a0a05";
  ctx.fillRect(target.x, target.y, target.width, target.height);
  ctx.strokeRect(target.x, target.y, target.width, target.height);
  });
  };



  function drawGameOver() {
    if (targets.length == 0) {
      gameoverText.text = "You won! Time: " + gamedata.timer.toFixed(2) + " seconds";
    }

     button2.draw(ctx);
     ctx.font = "bold 30px Arial";
      ctx.fillText(gameoverText.text, gameoverText.x, gameoverText.y);
 ctx.fillStyle = gameoverText.color;
 ctx.textBaseline = "middle";
};