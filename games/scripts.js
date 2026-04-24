        // Variables globales del juego
        let currentGame = null;
        let gameLoop = null;
        let gameState = 'stopped';
        let canvas = null;
        let ctx = null;
        let score = 0;
        let gameSpeed = 100;
        
        // Plantillas de juegos predefinidas
        const gameTemplates = {
            snake: {
                name: "Snake Clásico",
                description: "Una serpiente que come manzanas y crece",
                init: initSnakeGame,
                update: updateSnakeGame,
                render: renderSnakeGame,
                handleInput: handleSnakeInput
            },
            tetris: {
                name: "Tetris Retro",
                description: "Bloques que caen formando líneas",
                init: initTetrisGame,
                update: updateTetrisGame,
                render: renderTetrisGame,
                handleInput: handleTetrisInput
            },
            pong: {
                name: "Pong Clásico",
                description: "El ping-pong digital original",
                init: initPongGame,
                update: updatePongGame,
                render: renderPongGame,
                handleInput: handlePongInput
            },
            breakout: {
                name: "Breakout",
                description: "Rompe todos los bloques con la pelota",
                init: initBreakoutGame,
                update: updateBreakoutGame,
                render: renderBreakoutGame,
                handleInput: handleBreakoutInput
            },
            asteroids: {
                name: "Asteroids",
                description: "Destruye asteroides en el espacio",
                init: initAsteroidsGame,
                update: updateAsteroidsGame,
                render: renderAsteroidsGame,
                handleInput: handleAsteroidsInput
            },
            pacman: {
                name: "Pac-Man",
                description: "Come puntos y evita los fantasmas",
                init: initPacmanGame,
                update: updatePacmanGame,
                render: renderPacmanGame,
                handleInput: handlePacmanInput
            }
        };

        // Función para establecer prompts rápidos
        function setPrompt(gameType) {
            const prompts = {
                snake: "Quiero un juego de Snake donde la serpiente come manzanas y crece. Añade power-ups especiales y obstáculos que aparezcan aleatoriamente.",
                tetris: "Crea un Tetris clásico con piezas que caen. Incluye efectos visuales cuando se completan líneas y aumenta la velocidad gradualmente.",
                pong: "Haz un Pong clásico con dos paletas y una pelota. La IA debe adaptarse al nivel del jugador.",
                breakout: "Quiero un Breakout donde una pelota rebota y rompe bloques. Algunos bloques deben tener power-ups especiales.",
                asteroids: "Crea un juego de Asteroids con una nave que puede rotar y disparar. Los asteroides se dividen al ser destruidos.",
                pacman: "Haz un Pac-Man donde como puntos en un laberinto mientras evito fantasmas. Incluye power-pellets que me permitan comer fantasmas."
            };
            
            document.getElementById('gamePrompt').value = prompts[gameType];
        }

        // Función principal para generar juegos
        function generateGame() {
            const prompt = document.getElementById('gamePrompt').value.trim();
            
            if (!prompt) {
                alert('Por favor, describe el juego que quieres crear');
                return;
            }
            
            // Mostrar loading
            document.getElementById('loading').style.display = 'block';
            document.getElementById('welcomeMessage').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'none';
            
            // Analizar el prompt y determinar el tipo de juego
            setTimeout(() => {
                const gameType = analyzePrompt(prompt);
                loadGame(gameType, prompt);
            }, 2000);
        }

        // Analizar el prompt para determinar el tipo de juego
        function analyzePrompt(prompt) {
            const lowerPrompt = prompt.toLowerCase();
            
            if (lowerPrompt.includes('serpiente') || lowerPrompt.includes('snake') || lowerPrompt.includes('come') && lowerPrompt.includes('crece')) {
                return 'snake';
            } else if (lowerPrompt.includes('tetris') || lowerPrompt.includes('bloques') && lowerPrompt.includes('caen')) {
                return 'tetris';
            } else if (lowerPrompt.includes('pong') || lowerPrompt.includes('ping') || lowerPrompt.includes('paletas')) {
                return 'pong';
            } else if (lowerPrompt.includes('breakout') || lowerPrompt.includes('rompe') && lowerPrompt.includes('bloques')) {
                return 'breakout';
            } else if (lowerPrompt.includes('asteroids') || lowerPrompt.includes('nave') && lowerPrompt.includes('dispara')) {
                return 'asteroids';
            } else if (lowerPrompt.includes('pacman') || lowerPrompt.includes('pac-man') || lowerPrompt.includes('laberinto')) {
                return 'pacman';
            } else {
                // Si no reconoce el tipo, genera Snake por defecto
                return 'snake';
            }
        }

        // Cargar y configurar el juego
        function loadGame(gameType, prompt) {
            const template = gameTemplates[gameType];
            
            if (!template) {
                alert('Tipo de juego no reconocido');
                return;
            }
            
            // Configurar el juego
            currentGame = template;
            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');
            
            // Actualizar la interfaz
            document.getElementById('gameTitle').textContent = template.name;
            document.getElementById('gameScore').textContent = 'Puntuación: 0';
            
            // Ocultar loading y mostrar juego
            document.getElementById('loading').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';
            
            // Inicializar el juego
            score = 0;
            gameState = 'ready';
            currentGame.init();
            currentGame.render();
            
            // Configurar controles
            setupControls();
        }

        // Configurar controles del juego
        function setupControls() {
            document.addEventListener('keydown', (e) => {
                if (currentGame && gameState === 'playing') {
                    currentGame.handleInput(e.key);
                }
            });
        }

        // Funciones de control del juego
        function startGame() {
            if (!currentGame) return;
            
            if (gameState === 'ready' || gameState === 'paused') {
                gameState = 'playing';
                gameLoop = setInterval(() => {
                    currentGame.update();
                    currentGame.render();
                }, gameSpeed);
            }
        }

        function pauseGame() {
            if (gameState === 'playing') {
                gameState = 'paused';
                clearInterval(gameLoop);
            }
        }

        function resetGame() {
            if (currentGame) {
                gameState = 'ready';
                clearInterval(gameLoop);
                score = 0;
                document.getElementById('gameScore').textContent = 'Puntuación: 0';
                currentGame.init();
                currentGame.render();
            }
        }

        // Actualizar puntuación
        function updateScore(points) {
            score += points;
            document.getElementById('gameScore').textContent = `Puntuación: ${score}`;
        }

        // ===== IMPLEMENTACIÓN DE JUEGOS =====

        // Variables para Snake
        let snake = [];
        let food = {};
        let direction = 'right';
        let gridSize = 20;

        function initSnakeGame() {
            snake = [
                {x: 200, y: 200},
                {x: 180, y: 200},
                {x: 160, y: 200}
            ];
            direction = 'right';
            generateFood();
        }

        function generateFood() {
            food = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
        }

        function updateSnakeGame() {
            const head = {x: snake[0].x, y: snake[0].y};
            
            switch(direction) {
                case 'up': head.y -= gridSize; break;
                case 'down': head.y += gridSize; break;
                case 'left': head.x -= gridSize; break;
                case 'right': head.x += gridSize; break;
            }
            
            // Verificar colisiones con bordes
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                gameState = 'gameOver';
                clearInterval(gameLoop);
                alert('Game Over! Puntuación: ' + score);
                return;
            }
            
            // Verificar colisiones con el cuerpo
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameState = 'gameOver';
                    clearInterval(gameLoop);
                    alert('Game Over! Puntuación: ' + score);
                    return;
                }
            }
            
            snake.unshift(head);
            
            // Verificar si come comida
            if (head.x === food.x && head.y === food.y) {
                updateScore(10);
                generateFood();
            } else {
                snake.pop();
            }
        }

        function renderSnakeGame() {
            // Limpiar canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar serpiente
            ctx.fillStyle = '#00ff88';
            for (let segment of snake) {
                ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
            }
            
            // Dibujar comida
            ctx.fillStyle = '#ff0066';
            ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
        }

        function handleSnakeInput(key) {
            switch(key) {
                case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
                case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
                case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
                case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
            }
        }

        // Variables para Tetris
        let tetrisBoard = [];
        let currentPiece = null;
        let tetrominoTypes = [
            [[1,1,1,1]], // I
            [[1,1],[1,1]], // O
            [[1,1,1],[0,1,0]], // T
            [[1,1,1],[1,0,0]], // L
            [[1,1,1],[0,0,1]], // J
            [[1,1,0],[0,1,1]], // S
            [[0,1,1],[1,1,0]]  // Z
        ];

        function initTetrisGame() {
            tetrisBoard = Array(20).fill().map(() => Array(10).fill(0));
            spawnPiece();
        }

        function spawnPiece() {
            const type = Math.floor(Math.random() * tetrominoTypes.length);
            currentPiece = {
                shape: tetrominoTypes[type],
                x: 4,
                y: 0,
                color: type + 1
            };
        }

        function updateTetrisGame() {
            if (!currentPiece) return;
            
            // Mover pieza hacia abajo
            currentPiece.y++;
            
            // Verificar colisión
            if (checkCollision()) {
                currentPiece.y--;
                placePiece();
                clearLines();
                spawnPiece();
                
                // Verificar game over
                if (checkCollision()) {
                    gameState = 'gameOver';
                    clearInterval(gameLoop);
                    alert('Game Over! Puntuación: ' + score);
                }
            }
        }

        function checkCollision() {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardX = currentPiece.x + x;
                        const boardY = currentPiece.y + y;
                        
                        if (boardX < 0 || boardX >= 10 || boardY >= 20 || 
                            (boardY >= 0 && tetrisBoard[boardY][boardX])) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function placePiece() {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardX = currentPiece.x + x;
                        const boardY = currentPiece.y + y;
                        if (boardY >= 0) {
                            tetrisBoard[boardY][boardX] = currentPiece.color;
                        }
                    }
                }
            }
        }

        function clearLines() {
            let linesCleared = 0;
            for (let y = 19; y >= 0; y--) {
                if (tetrisBoard[y].every(cell => cell !== 0)) {
                    tetrisBoard.splice(y, 1);
                    tetrisBoard.unshift(Array(10).fill(0));
                    linesCleared++;
                    y++; // Verificar la misma línea de nuevo
                }
            }
            if (linesCleared > 0) {
                updateScore(linesCleared * 100);
            }
        }

        function renderTetrisGame() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const cellSize = 20;
            const colors = ['#000', '#ff0066', '#00ff88', '#0066ff', '#ffff00', '#ff8800', '#8800ff', '#00ffff'];
            
            // Dibujar board
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 10; x++) {
                    if (tetrisBoard[y][x]) {
                        ctx.fillStyle = colors[tetrisBoard[y][x]];
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                    }
                }
            }
            
            // Dibujar pieza actual
            if (currentPiece) {
                ctx.fillStyle = colors[currentPiece.color];
                for (let y = 0; y < currentPiece.shape.length; y++) {
                    for (let x = 0; x < currentPiece.shape[y].length; x++) {
                        if (currentPiece.shape[y][x]) {
                            ctx.fillRect(
                                (currentPiece.x + x) * cellSize,
                                (currentPiece.y + y) * cellSize,
                                cellSize - 1,
                                cellSize - 1
                            );
                        }
                    }
                }
            }
        }

        function handleTetrisInput(key) {
            if (!currentPiece) return;
            
            switch(key) {
                case 'ArrowLeft':
                    currentPiece.x--;
                    if (checkCollision()) currentPiece.x++;
                    break;
                case 'ArrowRight':
                    currentPiece.x++;
                    if (checkCollision()) currentPiece.x--;
                    break;
                case 'ArrowDown':
                    currentPiece.y++;
                    if (checkCollision()) currentPiece.y--;
                    break;
                case 'ArrowUp':
                    // Rotar pieza
                    const rotated = rotatePiece(currentPiece.shape);
                    const originalShape = currentPiece.shape;
                    currentPiece.shape = rotated;
                    if (checkCollision()) {
                        currentPiece.shape = originalShape;
                    }
                    break;
            }
        }

        function rotatePiece(shape) {
            const rotated = [];
            for (let i = 0; i < shape[0].length; i++) {
                rotated[i] = [];
                for (let j = shape.length - 1; j >= 0; j--) {
                    rotated[i][shape.length - 1 - j] = shape[j][i];
                }
            }
            return rotated;
        }

        // Variables para Pong
        let paddle1 = {x: 10, y: 150, width: 10, height: 100, speed: 5};
        let paddle2 = {x: 380, y: 150, width: 10, height: 100, speed: 5};
        let pongBall = {x: 200, y: 200, dx: 10, dy: 10, radius: 8};

        function initPongGame() {
            paddle1 = {x: 10, y: 150, width: 10, height: 100, speed: 5};
            paddle2 = {x: 380, y: 150, width: 10, height: 100, speed: 5};
            pongBall = {x: 200, y: 200, dx: 10, dy: 10, radius: 8};
        }

        function updatePongGame() {
            // Mover pelota
            pongBall.x += pongBall.dx;
            pongBall.y += pongBall.dy;
            
            // Rebote en bordes superior e inferior
            if (pongBall.y <= pongBall.radius || pongBall.y >= canvas.height - pongBall.radius) {
                pongBall.dy = -pongBall.dy;
            }
            
            // Colisión con paletas
            if (pongBall.x - pongBall.radius <= paddle1.x + paddle1.width &&
                pongBall.y >= paddle1.y && pongBall.y <= paddle1.y + paddle1.height) {
                pongBall.dx = -pongBall.dx;
                pongBall.x = paddle1.x + paddle1.width + pongBall.radius;
            }
            
            if (pongBall.x + pongBall.radius >= paddle2.x &&
                pongBall.y >= paddle2.y && pongBall.y <= paddle2.y + paddle2.height) {
                pongBall.dx = -pongBall.dx;
                pongBall.x = paddle2.x - pongBall.radius;
            }
            
            // IA para paddle2
            if (pongBall.y > paddle2.y + paddle2.height / 2) {
                paddle2.y += paddle2.speed;
            } else if (pongBall.y < paddle2.y + paddle2.height / 2) {
                paddle2.y -= paddle2.speed;
            }
            
            // Limitar movimiento de paletas
            paddle1.y = Math.max(0, Math.min(canvas.height - paddle1.height, paddle1.y));
            paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));
            
            // Puntuación
            if (pongBall.x < 0) {
                updateScore(10);
                resetPongBall();
            } else if (pongBall.x > canvas.width) {
                resetPongBall();
            }
        }

        function resetPongBall() {
            pongBall.x = canvas.width / 2;
            pongBall.y = canvas.height / 2;
            pongBall.dx = -pongBall.dx;
        }

        function renderPongGame() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Línea central
            ctx.strokeStyle = '#00ff88';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Paletas
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
            ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
            
            // Pelota
            ctx.beginPath();
            ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        function handlePongInput(key) {
            switch(key) {
                case 'ArrowUp':
                    paddle1.y -= paddle1.speed * 2;
                    break;
                case 'ArrowDown':
                    paddle1.y += paddle1.speed * 2;
                    break;
            }
        }

        // Variables para Breakout
        let breakoutPaddle = {x: 150, y: 380, width: 100, height: 10, speed: 6};
        let breakoutBall = {x: 200, y: 300, dx: 3, dy: -3, radius: 8};
        let bricks = [];

        function initBreakoutGame() {
            breakoutPaddle = {x: 150, y: 380, width: 100, height: 10, speed: 6};
            breakoutBall = {x: 200, y: 300, dx: 3, dy: -3, radius: 8};
            
            // Crear ladrillos
            bricks = [];
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 10; col++) {
                    bricks.push({
                        x: col * 40,
                        y: row * 20 + 30,
                        width: 38,
                        height: 18,
                        alive: true,
                        color: `hsl(${row * 45}, 70%, 50%)`
                    });
                }
            }
        }

        function updateBreakoutGame() {
            // Mover pelota
            breakoutBall.x += breakoutBall.dx;
            breakoutBall.y += breakoutBall.dy;
            
            // Rebote en bordes
            if (breakoutBall.x <= breakoutBall.radius || breakoutBall.x >= canvas.width - breakoutBall.radius) {
                breakoutBall.dx = -breakoutBall.dx;
            }
            if (breakoutBall.y <= breakoutBall.radius) {
                breakoutBall.dy = -breakoutBall.dy;
            }
            
            // Colisión con paleta
            if (breakoutBall.y + breakoutBall.radius >= breakoutPaddle.y &&
                breakoutBall.x >= breakoutPaddle.x && breakoutBall.x <= breakoutPaddle.x + breakoutPaddle.width) {
                breakoutBall.dy = -breakoutBall.dy;
                breakoutBall.y = breakoutPaddle.y - breakoutBall.radius;
            }
            
            // Colisión con ladrillos
            for (let brick of bricks) {
                if (brick.alive && 
                    breakoutBall.x >= brick.x && breakoutBall.x <= brick.x + brick.width &&
                    breakoutBall.y >= brick.y && breakoutBall.y <= brick.y + brick.height) {
                    brick.alive = false;
                    breakoutBall.dy = -breakoutBall.dy;
                    updateScore(10);
                    break;
                }
            }
            
            // Game Over
            if (breakoutBall.y > canvas.height) {
                gameState = 'gameOver';
                clearInterval(gameLoop);
                alert('Game Over! Puntuación: ' + score);
            }
            
            // Victory
            if (bricks.every(brick => !brick.alive)) {
                gameState = 'victory';
                clearInterval(gameLoop);
                alert('¡Victoria! Puntuación: ' + score);
            }
        }

        function renderBreakoutGame() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Paleta
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(breakoutPaddle.x, breakoutPaddle.y, breakoutPaddle.width, breakoutPaddle.height);
            
            // Pelota
            ctx.beginPath();
            ctx.arc(breakoutBall.x, breakoutBall.y, breakoutBall.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Ladrillos
            for (let brick of bricks) {
                if (brick.alive) {
                    ctx.fillStyle = brick.color;
                    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                }
            }
        }

        function handleBreakoutInput(key) {
            switch(key) {
                case 'ArrowLeft':
                    breakoutPaddle.x -= breakoutPaddle.speed;
                    breakoutPaddle.x = Math.max(0, breakoutPaddle.x);
                    break;
                case 'ArrowRight':
                    breakoutPaddle.x += breakoutPaddle.speed;
                    breakoutPaddle.x = Math.min(canvas.width - breakoutPaddle.width, breakoutPaddle.x);
                    break;
            }
        }

        // Variables para Asteroids
        let ship = {x: 200, y: 200, angle: 0, dx: 0, dy: 0, size: 10};
        let bullets = [];
        let asteroids = [];

        function initAsteroidsGame() {
            ship = {x: 200, y: 200, angle: 0, dx: 0, dy: 0, size: 10};
            bullets = [];
            asteroids = [];
            
            // Crear asteroides iniciales
            for (let i = 0; i < 5; i++) {
                asteroids.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    size: 30 + Math.random() * 20,
                    angle: Math.random() * Math.PI * 2
                });
            }
        }

        function updateAsteroidsGame() {
            // Actualizar nave
            ship.x += ship.dx;
            ship.y += ship.dy;
            ship.dx *= 0.99;
            ship.dy *= 0.99;
            
            // Envolver pantalla
            if (ship.x < 0) ship.x = canvas.width;
            if (ship.x > canvas.width) ship.x = 0;
            if (ship.y < 0) ship.y = canvas.height;
            if (ship.y > canvas.height) ship.y = 0;
            
            // Actualizar balas
            bullets = bullets.filter(bullet => {
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;
                bullet.life--;
                return bullet.life > 0 && bullet.x >= 0 && bullet.x <= canvas.width && 
                       bullet.y >= 0 && bullet.y <= canvas.height;
            });
            
            // Actualizar asteroides
            for (let asteroid of asteroids) {
                asteroid.x += asteroid.dx;
                asteroid.y += asteroid.dy;
                asteroid.angle += 0.01;
                
                // Envolver pantalla
                if (asteroid.x < 0) asteroid.x = canvas.width;
                if (asteroid.x > canvas.width) asteroid.x = 0;
                if (asteroid.y < 0) asteroid.y = canvas.height;
                if (asteroid.y > canvas.height) asteroid.y = 0;
            }
            
            // Colisiones balas-asteroides
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const bullet = bullets[i];
                    const asteroid = asteroids[j];
                    const dx = bullet.x - asteroid.x;
                    const dy = bullet.y - asteroid.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < asteroid.size) {
                        bullets.splice(i, 1);
                        asteroids.splice(j, 1);
                        updateScore(100);
                        
                        // Dividir asteroide si es grande
                        if (asteroid.size > 20) {
                            for (let k = 0; k < 2; k++) {
                                asteroids.push({
                                    x: asteroid.x,
                                    y: asteroid.y,
                                    dx: (Math.random() - 0.5) * 3,
                                    dy: (Math.random() - 0.5) * 3,
                                    size: asteroid.size / 2,
                                    angle: Math.random() * Math.PI * 2
                                });
                            }
                        }
                        break;
                    }
                }
            }
            
            // Colisiones nave-asteroides
            for (let asteroid of asteroids) {
                const dx = ship.x - asteroid.x;
                const dy = ship.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < asteroid.size + ship.size) {
                    gameState = 'gameOver';
                    clearInterval(gameLoop);
                    alert('Game Over! Puntuación: ' + score);
                    return;
                }
            }
            
            // Generar más asteroides si es necesario
            if (asteroids.length === 0) {
                for (let i = 0; i < 5; i++) {
                    asteroids.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        dx: (Math.random() - 0.5) * 2,
                        dy: (Math.random() - 0.5) * 2,
                        size: 30 + Math.random() * 20,
                        angle: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        function renderAsteroidsGame() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar nave
            ctx.save();
            ctx.translate(ship.x, ship.y);
            ctx.rotate(ship.angle);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-10, -8);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-10, 8);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
            
            // Dibujar balas
            ctx.fillStyle = '#ffff00';
            for (let bullet of bullets) {
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Dibujar asteroides
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            for (let asteroid of asteroids) {
                ctx.save();
                ctx.translate(asteroid.x, asteroid.y);
                ctx.rotate(asteroid.angle);
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = asteroid.size * (0.8 + Math.random() * 0.4);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }

        function handleAsteroidsInput(key) {
            switch(key) {
                case 'ArrowUp':
                    ship.dx += Math.cos(ship.angle) * 0.5;
                    ship.dy += Math.sin(ship.angle) * 0.5;
                    break;
                case 'ArrowLeft':
                    ship.angle -= 0.1;
                    break;
                case 'ArrowRight':
                    ship.angle += 0.1;
                    break;
                case ' ':
                    bullets.push({
                        x: ship.x,
                        y: ship.y,
                        dx: Math.cos(ship.angle) * 5,
                        dy: Math.sin(ship.angle) * 5,
                        life: 60
                    });
                    break;
            }
        }

        // Variables para Pac-Man
        let pacman = {x: 200, y: 200, direction: 0, mouth: 0};
        let dots = [];
        let ghosts = [];
        let maze = [];

        function initPacmanGame() {
            pacman = {x: 200, y: 200, direction: 0, mouth: 0};
            dots = [];
            ghosts = [];
            
            // Crear puntos
            for (let i = 0; i < 50; i++) {
                dots.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    eaten: false
                });
            }
            
            // Crear fantasmas
            for (let i = 0; i < 3; i++) {
                ghosts.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    color: `hsl(${i * 120}, 70%, 50%)`
                });
            }
        }

        function updatePacmanGame() {
            // Actualizar Pac-Man
            const speed = 2;
            switch(pacman.direction) {
                case 0: pacman.x += speed; break; // derecha
                case 1: pacman.y -= speed; break; // arriba
                case 2: pacman.x -= speed; break; // izquierda
                case 3: pacman.y += speed; break; // abajo
            }
            
            // Envolver pantalla
            if (pacman.x < 0) pacman.x = canvas.width;
            if (pacman.x > canvas.width) pacman.x = 0;
            if (pacman.y < 0) pacman.y = canvas.height;
            if (pacman.y > canvas.height) pacman.y = 0;
            
            // Animación de boca
            pacman.mouth = (pacman.mouth + 0.3) % (Math.PI * 2);
            
            // Comer puntos
            for (let dot of dots) {
                if (!dot.eaten) {
                    const dx = pacman.x - dot.x;
                    const dy = pacman.y - dot.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 15) {
                        dot.eaten = true;
                        updateScore(10);
                    }
                }
            }
            
            // Actualizar fantasmas
            for (let ghost of ghosts) {
                ghost.x += ghost.dx;
                ghost.y += ghost.dy;
                
                // Cambiar dirección aleatoriamente
                if (Math.random() < 0.02) {
                    ghost.dx = (Math.random() - 0.5) * 3;
                    ghost.dy = (Math.random() - 0.5) * 3;
                }
                
                // Envolver pantalla
                if (ghost.x < 0) ghost.x = canvas.width;
                if (ghost.x > canvas.width) ghost.x = 0;
                if (ghost.y < 0) ghost.y = canvas.height;
                if (ghost.y > canvas.height) ghost.y = 0;
                
                // Colisión con Pac-Man
                const dx = pacman.x - ghost.x;
                const dy = pacman.y - ghost.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 20) {
                    gameState = 'gameOver';
                    clearInterval(gameLoop);
                    alert('Game Over! Puntuación: ' + score);
                    return;
                }
            }
            
            // Victoria
            if (dots.every(dot => dot.eaten)) {
                gameState = 'victory';
                clearInterval(gameLoop);
                alert('¡Victoria! Puntuación: ' + score);
            }
        }

        function renderPacmanGame() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar puntos
            ctx.fillStyle = '#ffff00';
            for (let dot of dots) {
                if (!dot.eaten) {
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Dibujar Pac-Man
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(pacman.x, pacman.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Boca de Pac-Man
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(pacman.x, pacman.y);
            const mouthAngle = pacman.direction * Math.PI / 2;
            ctx.arc(pacman.x, pacman.y, 12, 
                   mouthAngle - Math.abs(Math.sin(pacman.mouth)) * 0.5, 
                   mouthAngle + Math.abs(Math.sin(pacman.mouth)) * 0.5);
            ctx.fill();
            
            // Dibujar fantasmas
            for (let ghost of ghosts) {
                ctx.fillStyle = ghost.color;
                ctx.beginPath();
                ctx.arc(ghost.x, ghost.y, 10, 0, Math.PI);
                ctx.fill();
                
                // Parte inferior ondulada
                ctx.beginPath();
                ctx.moveTo(ghost.x - 10, ghost.y);
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(ghost.x - 10 + i * 5, ghost.y + (i % 2 === 0 ? 8 : 0));
                }
                ctx.lineTo(ghost.x + 10, ghost.y);
                ctx.fill();
                
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 3, 2, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 3, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function handlePacmanInput(key) {
            switch(key) {
                case 'ArrowRight': pacman.direction = 0; break;
                case 'ArrowUp': pacman.direction = 1; break;
                case 'ArrowLeft': pacman.direction = 2; break;
                case 'ArrowDown': pacman.direction = 3; break;
            }
        }

        // Inicializar la aplicación
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎮 Generador de Juegos Retro inicializado');
        });
        function handleTetrisInput(key) {
            switch (key) {
                case 'ArrowLeft':
                    currentPiece.x--;
                    if (checkTetrisCollision()) currentPiece.x++;
                    break;
                case 'ArrowRight':
                    currentPiece.x++;
                    if (checkTetrisCollision()) currentPiece.x--;
                    break;
                case 'ArrowDown':
                    currentPiece.y++;
                    if (checkTetrisCollision()) currentPiece.y--;
                    break;
                case 'ArrowUp':
                    const rotated = rotate(currentPiece.shape);
                    const original = currentPiece.shape;
                    currentPiece.shape = rotated;
                    if (checkTetrisCollision()) currentPiece.shape = original;
                    break;
            }
        }

        function rotate(matrix) {
            return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
        }
