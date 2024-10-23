// 遊戲參數
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 480; // 畫布寬度
canvas.height = 320; // 畫布高度

let paddleWidth = 75;
let paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

let brickRowCount = 5; // 磚塊行數
let brickColumnCount = 6; // 磚塊列數
let brickWidth = (canvas.width / brickColumnCount) - 10; // 計算磚塊寬度
let brickHeight = 20; // 磚塊高度
let brickPadding = 10; // 磚塊之間的間距
let brickOffsetTop = 30; // 磚塊距上邊的距離
let brickOffsetLeft = 5; // 磚塊距左邊的距離

let score = 0;
let lives = 3;
let level = 1;
let difficulty = 'easy';
let gameRunning = false;

let bricks = [];

// 初始化磚塊
function initBricks() {
    bricks = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[r][c] = { x: 0, y: 0, status: 1 };
        }
    }
}

initBricks();

// 音樂和音效
const bgMusic = document.getElementById('bgMusic');
const hitSound = document.getElementById('hitSound');

// 監聽鍵盤事件
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// 碰撞檢測
function collisionDetection() {
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    document.getElementById('scoreBoard').innerHTML = `分數: ${score}`;
                    hitSound.play();
                    if (score === brickRowCount * brickColumnCount) {
                        levelComplete(); // 關卡完成
                    }
                }
            }
        }
    }
}

// 關卡完成
function levelComplete() {
    gameRunning = false; // 停止遊戲
    document.getElementById('nextLevelScreen').style.display = 'block'; // 顯示下一關選項
}

// 遊戲主循環
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // 擋板的移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // 碰撞邊界檢測
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx; // 碰到左右邊界
    }
    if (y + dy < ballRadius) {
        dy = -dy; // 碰到上邊界
    } else if (y + dy > canvas.height - ballRadius) {
        // 生命減少
        lives--;
        document.getElementById('livesBoard').innerHTML = `生命: ${lives}`;
        if (lives === 0) {
            gameOver(); // 遊戲結束
        } else {
            resetBall(); // 重置球的位置
        }
    }

    // 碰到擋板的反彈邏輯
    if (y + dy > canvas.height - paddleHeight - ballRadius && x > paddleX && x < paddleX + paddleWidth) {
        let ballCenter = x - (paddleX + paddleWidth / 2);
        let angle = ballCenter / (paddleWidth / 2); // 計算相對位置以獲取反彈角度
        dx = 2 * angle; // 根據位置調整球的水平方向
        dy = -dy; // 反彈
    }

    // 更新球的位置
    x += dx;
    y += dy;

    // 當遊戲正在進行時才持續繪製
    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

// 繪製磚塊
function drawBricks() {
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            if (bricks[r][c].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;
                ctx.fillStyle = '#0095DD';
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight); // 使用正確的寬高
            }
        }
    }
}

// 繪製球
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow'; // 球的顏色
    ctx.fill();
    ctx.closePath();
}

// 繪製擋板
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// 遊戲結束
function gameOver() {
    gameRunning = false; // 停止遊戲
    document.getElementById('finalScore').innerHTML = `你的分數: ${score}`;
    document.getElementById('gameOverScreen').style.display = 'block'; // 顯示遊戲結束畫面
}

// 重置球的位置
function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
}

// 開始遊戲
function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    gameRunning = true;
    score = 0;
    lives = 3;
    level = 1;
    initBricks();
    document.getElementById('scoreBoard').innerHTML = `分數: ${score}`;
    document.getElementById('livesBoard').innerHTML = `生命: ${lives}`;
    document.getElementById('levelBoard').innerHTML = `關卡: ${level}`;
    document.getElementById('difficultySelection').style.display = 'none';
    document.getElementById('gameCanvasContainer').style.display = 'block';
    bgMusic.play(); // 開始音樂
    draw(); // 開始遊戲循環
}

// 重新開始遊戲
function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    startGame(difficulty); // 重新開始選擇的難度
}

// 前往下一關
function nextLevel() {
    level++;
    score = 0; // 重置分數
    initBricks(); // 初始化磚塊
    document.getElementById('levelBoard').innerHTML = `關卡: ${level}`;
    document.getElementById('nextLevelScreen').style.display = 'none'; // 隱藏下一關畫面
    draw(); // 開始新一關
}
