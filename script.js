// Theme Logic - Dropdown
const themeSelect = document.getElementById('theme-select');
const html = document.documentElement;

// Function to set theme
function setTheme(themeName) {
    html.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
    if (themeSelect) themeSelect.value = themeName;
}

// Event Listeners for Switcher
if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });
}

// Init: Check local storage or default to empty
const savedTheme = localStorage.getItem('selected-theme');
if (savedTheme) {
    setTheme(savedTheme);
}

// --- Tic Tac Toe Logic ---
const tttBoard = document.getElementById('ttt-board');
if (tttBoard) {
    const cells = Array.from(document.querySelectorAll('.ttt-cell'));
    const statusText = document.getElementById('ttt-status');
    const resetBtn = document.getElementById('ttt-reset');
    const diffSelect = document.getElementById('difficulty-select');

    // Stats Elements
    const playedEl = document.getElementById('stat-played');
    const wonEl = document.getElementById('stat-won');
    const lostEl = document.getElementById('stat-lost');
    const wrEl = document.getElementById('stat-wr');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let difficulty = 'easy';

    // Stats State - Load from LocalStorage
    let played = parseInt(localStorage.getItem('ttt-played')) || 0;
    let won = parseInt(localStorage.getItem('ttt-won')) || 0;
    let lost = parseInt(localStorage.getItem('ttt-lost')) || 0;

    // Initial UI Update
    updateUI();

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function updateStats(result) {
        played++;
        if (result === 'win') won++;
        if (result === 'loss') lost++;

        // Save to LocalStorage
        localStorage.setItem('ttt-played', played);
        localStorage.setItem('ttt-won', won);
        localStorage.setItem('ttt-lost', lost);

        updateUI();
    }

    function updateUI() {
        if (!playedEl || !wonEl || !lostEl || !wrEl) return;

        playedEl.textContent = played;
        wonEl.textContent = won;
        lostEl.textContent = lost;

        const wr = played === 0 ? 0 : ((won / played) * 100).toFixed(1);
        wrEl.textContent = wr + '%';
    }

    function handleCellClick(e) {
        const index = e.target.getAttribute('data-index');
        if (board[index] !== '' || !gameActive || currentPlayer === 'O') return;

        makeMove(index, 'X');

        if (gameActive) {
            currentPlayer = 'O';
            statusText.textContent = "AI is thinking...";
            setTimeout(aiMove, 500); // Artificial delay
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        let winningLine = [];

        for (let i = 0; i < 8; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                winningLine = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            if (currentPlayer === 'X') {
                statusText.textContent = "You Win!";
                updateStats('win');
            } else {
                statusText.textContent = "AI Wins!";
                updateStats('loss');
            }
            gameActive = false;
            setTimeout(restartGame, 1500);
            return;
        }

        if (!board.includes('')) {
            statusText.textContent = "It's a Draw!";
            updateStats('draw');
            gameActive = false;
            setTimeout(restartGame, 1500);
            return;
        }

        // Switch turn if game continues
        /* currentPlayer logic is handled in control flow (Human -> AI) */
    }

    function aiMove() {
        if (!gameActive) return;

        difficulty = diffSelect.value;
        let index;

        if (difficulty === 'easy') {
            index = getRandomMove();
        } else if (difficulty === 'medium') {
            index = getBestMove(2); // Limited depth
        } else if (difficulty === 'hard') {
            index = Math.random() < 0.2 ? getRandomMove() : getBestMove(Infinity); // 80% perfect
        } else {
            index = getBestMove(Infinity); // Perfect
        }

        makeMove(index, 'O');
        if (gameActive) {
            currentPlayer = 'X';
            statusText.textContent = "Your Turn";
        }
    }

    function getRandomMove() {
        const available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    // Minimax Algorithm
    function getBestMove(depthLimit) {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false, depthLimit);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    const scores = { X: -10, O: 10, tie: 0 };

    function minimax(currentBoard, depth, isMaximizing, depthLimit) {
        // Base cases
        let result = checkWinner(currentBoard);
        if (result !== null) return scores[result];
        if (depth >= depthLimit) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = 'O';
                    let score = minimax(currentBoard, depth + 1, false, depthLimit);
                    currentBoard[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = 'X';
                    let score = minimax(currentBoard, depth + 1, true, depthLimit);
                    currentBoard[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function checkWinner(b) {
        for (let i = 0; i < 8; i++) {
            const [a, b_idx, c] = winningConditions[i];
            if (b[a] && b[a] === b[b_idx] && b[a] === b[c]) {
                return b[a];
            }
        }
        if (!b.includes('')) return 'tie';
        return null;
    }

    function restartGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        statusText.textContent = "Your Turn";
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', restartGame);
    diffSelect.addEventListener('change', restartGame);
}


// --- Standard Portfolio Logic ---

// DOM Elements
const navbar = document.getElementById('navbar');
const reveals = document.querySelectorAll('.reveal');
const slideLefts = document.querySelectorAll('.slide-in-left');
const slideRights = document.querySelectorAll('.slide-in-right');

// Navbar Scroll
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.padding = '10px 0'; // Compact
        } else {
            navbar.style.padding = '20px 0'; // Expanded
        }
    });
}

// Scroll Reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));
slideLefts.forEach(el => revealObserver.observe(el));
slideRights.forEach(el => revealObserver.observe(el));

// BMI Calculator
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const bmiDisplay = document.getElementById('bmi-display');
const bmiCategory = document.getElementById('bmi-category');

function calculateBMI() {
    if (!heightInput || !weightInput) return;

    const h = parseInt(heightInput.value);
    const w = parseInt(weightInput.value);

    document.getElementById('height-val').textContent = h;
    document.getElementById('weight-val').textContent = w;

    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    if (bmiDisplay) bmiDisplay.textContent = bmi;

    if (bmiCategory) {
        if (bmi < 18.5) {
            bmiCategory.className = "bmi-category category-underweight";
            bmiCategory.textContent = "Underweight";
            updateVisuals('underweight', bmi);
        } else if (bmi < 25) {
            bmiCategory.className = "bmi-category category-normal";
            bmiCategory.textContent = "Normal Weight";
            updateVisuals('normal', bmi);
        } else if (bmi < 30) {
            bmiCategory.className = "bmi-category category-overweight";
            bmiCategory.textContent = "Overweight";
            updateVisuals('overweight', bmi);
        } else {
            bmiCategory.className = "bmi-category category-obese";
            bmiCategory.textContent = "Obese";
            updateVisuals('obese', bmi);
        }
    }
}

function updateVisuals(category, bmi) {
    const img = document.getElementById('bmi-image');
    if (img) img.src = `images/bmi_${category}.png`; // Assumes images are named bmi_underweight.png etc.
}

if (heightInput) heightInput.addEventListener('input', calculateBMI);
if (weightInput) weightInput.addEventListener('input', calculateBMI);

// Canvas
const canvasPlaceholder = document.querySelector('.canvas-placeholder');
if (canvasPlaceholder) {
    canvasPlaceholder.innerHTML = '<canvas id="particleCanvas"></canvas>';
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
        canvas.width = canvasPlaceholder.offsetWidth;
        canvas.height = canvasPlaceholder.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const mouse = { x: null, y: null };
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    const particlesArray = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 60) {
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle);
                    this.y -= Math.sin(angle);
                }
            }
        }
        draw() {
            // Using computed style to match current theme
            const style = getComputedStyle(document.body);
            // Default to dark color if not found (e.g. standard theme)
            let color = style.getPropertyValue('--text-color').trim();

            // Check if game mode for neon green
            if (document.documentElement.getAttribute('data-theme') === 'game') {
                color = '#00ff41';
            }

            ctx.fillStyle = color || '#000';
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Quick fix for particle color update on theme change
    const originalDraw = Particle.prototype.draw;

    for (let i = 0; i < 40; i++) particlesArray.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}
