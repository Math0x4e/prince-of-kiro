// Game Configuration
const CONFIG = {
    gravity: 0.7,
    jumpPower: 12,
    moveSpeed: 5,
    friction: 0.85,
    maxLives: 3,
    scorePerSecond: 100
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Storage Manager - Persistent save system
const StorageManager = {
    STORAGE_KEYS: {
        HIGH_SCORE: 'princeOfKiro_highScore',
        SCORE_HISTORY: 'princeOfKiro_scoreHistory'
    },
    
    // Check if LocalStorage is available
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Save a completed game session
    saveScore(time, score, level, date = new Date().toISOString()) {
        if (!this.isAvailable()) {
            console.warn('LocalStorage unavailable - score not saved');
            return false;
        }
        
        try {
            const history = this.loadScoreHistory();
            const newEntry = {
                time: time,
                score: score,
                level: level,
                date: date,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            };
            
            history.push(newEntry);
            
            // Sort chronologically by date
            history.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            localStorage.setItem(this.STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history));
            
            // Update high score if this is better
            this.updateHighScore(time);
            
            return true;
        } catch (e) {
            console.error('Error saving score:', e);
            return false;
        }
    },
    
    // Load high score (best/lowest time)
    loadHighScore() {
        if (!this.isAvailable()) {
            return null;
        }
        
        try {
            const highScore = localStorage.getItem(this.STORAGE_KEYS.HIGH_SCORE);
            return highScore ? parseFloat(highScore) : null;
        } catch (e) {
            console.error('Error loading high score:', e);
            return null;
        }
    },
    
    // Load all score history
    loadScoreHistory() {
        if (!this.isAvailable()) {
            return [];
        }
        
        try {
            const history = localStorage.getItem(this.STORAGE_KEYS.SCORE_HISTORY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Error loading score history:', e);
            return [];
        }
    },
    
    // Update high score if new time is better (lower)
    updateHighScore(time) {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            const currentHighScore = this.loadHighScore();
            
            // Update if no high score exists or new time is better (lower)
            if (currentHighScore === null || time < currentHighScore) {
                localStorage.setItem(this.STORAGE_KEYS.HIGH_SCORE, time.toString());
                return true; // New high score achieved
            }
            
            return false; // Not a new high score
        } catch (e) {
            console.error('Error updating high score:', e);
            return false;
        }
    },
    
    // Clear all saved data (for testing/reset)
    clearAll() {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            localStorage.removeItem(this.STORAGE_KEYS.HIGH_SCORE);
            localStorage.removeItem(this.STORAGE_KEYS.SCORE_HISTORY);
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }
};

// Effect Generators

// Create a trail particle at the specified position
function createTrailParticle(x, y) {
    return {
        x: x,
        y: y,
        velocityX: 0,
        velocityY: 0,
        life: 0,
        maxLife: 30,           // 30 frames (~0.5 seconds at 60 FPS)
        size: 8,
        color: '#790ECB',      // Kiro purple
        type: 'trail',
        opacity: 0.6
    };
}

// Particle System - Unified engine for all visual effects
const ParticleSystem = {
    particles: [],
    maxParticles: 500,
    
    // Add a particle or array of particles to the system
    add(particle) {
        if (Array.isArray(particle)) {
            particle.forEach(p => this.add(p));
            return;
        }
        
        // Enforce particle limit - remove oldest particles if at max
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }
        
        this.particles.push(particle);
    },
    
    // Update all particles (aging, movement, lifecycle management)
    update(deltaTime = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Age the particle
            p.life += deltaTime;
            
            // Update position based on velocity
            p.x += p.velocityX;
            p.y += p.velocityY;
            
            // Type-specific updates
            if (p.type === 'trail') {
                // Trail particles fade out over time
                p.opacity = Math.max(0, 0.6 * (1 - p.life / p.maxLife));
            } else if (p.type === 'explosion') {
                // Explosion particles shrink and fade
                const lifeRatio = p.life / p.maxLife;
                p.opacity = Math.max(0, 1 - lifeRatio);
                p.size = Math.max(0, p.size * (1 - lifeRatio * 0.05));
            } else if (p.type === 'sparkle') {
                // Sparkle particles pulse with sinusoidal animation
                const pulseValue = Math.sin(p.pulsePhase + p.life * 0.1);
                p.opacity = 0.5 + pulseValue * 0.5;
                p.scale = 0.8 + pulseValue * 0.4;
                p.y += p.velocityY; // Slow upward drift
            } else if (p.type === 'confetti') {
                // Confetti particles fall with gravity and rotate
                p.velocityY += 0.1; // Gravity
                p.rotation += p.rotationSpeed;
            }
            
            // Remove particles that have exceeded their lifetime
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Remove particles that have moved outside canvas boundaries
            if (p.x < -50 || p.x > canvas.width + 50 || 
                p.y < -50 || p.y > canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // Render all particles to the canvas
    render(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            
            if (p.type === 'trail') {
                // Draw trail as a circle
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'explosion') {
                // Draw explosion particle as a circle
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'sparkle') {
                // Draw sparkle as a star shape with pulsing scale
                const scale = p.scale || 1;
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.scale(scale, scale);
                
                // Draw 4-pointed star
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI / 2);
                    const outerRadius = p.size * 2;
                    const innerRadius = p.size * 0.5;
                    
                    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
                    ctx.lineTo(
                        Math.cos(angle + Math.PI / 4) * innerRadius,
                        Math.sin(angle + Math.PI / 4) * innerRadius
                    );
                }
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'confetti') {
                // Draw confetti as a rotated rectangle
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            
            ctx.restore();
        });
    },
    
    // Clear all particles (useful for level transitions)
    clear() {
        this.particles = [];
    }
};

// Game State
let gameState = {
    currentLevel: 1,
    lives: CONFIG.maxLives,
    score: 0,
    startTime: Date.now(),
    elapsedTime: 0,
    isPaused: false,
    gameOver: false,
    highScore: null,
    isNewHighScore: false
};

// Player Object
const player = {
    x: 50,
    y: 0,
    width: 28,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    isGrounded: false,
    jumpsRemaining: 2,
    direction: 1, // 1 = right, -1 = left
    color: '#ffffff'
};

// Input Handling
const keys = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false
};

// Kiro Logo State
let kiroLogo = null;
const kiroInstances = [];

// Load Kiro Logo
const kiroImage = new Image();
kiroImage.src = 'static/kiro-logo.png';
kiroImage.onload = () => {
    kiroLogo = kiroImage;
};

// Level Definitions
const levels = [
    {
        // Level 1 - Tutorial
        platforms: [
            { x: 0, y: 560, width: 800, height: 40 }, // Ground
            { x: 150, y: 480, width: 120, height: 20 },
            { x: 320, y: 400, width: 100, height: 20 },
            { x: 500, y: 320, width: 120, height: 20 },
            { x: 680, y: 240, width: 120, height: 20 }
        ],
        traps: [
            { x: 280, y: 540, width: 30, height: 20, type: 'spike' },
            { x: 450, y: 540, width: 30, height: 20, type: 'spike' }
        ],
        extraLives: [
            { x: 700, y: 200, width: 20, height: 20, collected: false }
        ],
        kiroSpots: [
            { x: 400, y: 100, width: 80, height: 80, triggerX: 320, active: true },
            { x: 600, y: 450, width: 60, height: 60, triggerX: 500, active: true }
        ],
        exit: { x: 750, y: 200, width: 40, height: 40 }
    },
    {
        // Level 2 - Find the Princess
        platforms: [
            { x: 0, y: 560, width: 200, height: 40 },
            { x: 250, y: 560, width: 550, height: 40 },
            { x: 100, y: 480, width: 100, height: 20 },
            { x: 280, y: 420, width: 80, height: 20 },
            { x: 420, y: 360, width: 100, height: 20 },
            { x: 580, y: 300, width: 80, height: 20 },
            { x: 700, y: 240, width: 100, height: 20 },
            { x: 400, y: 180, width: 120, height: 20 }
        ],
        traps: [
            { x: 210, y: 540, width: 30, height: 20, type: 'spike' },
            { x: 370, y: 540, width: 40, height: 20, type: 'fire' },
            { x: 550, y: 540, width: 30, height: 20, type: 'spike' }
        ],
        extraLives: [
            { x: 120, y: 440, width: 20, height: 20, collected: false }
        ],
        kiroSpots: [
            { x: 150, y: 200, width: 70, height: 70, triggerX: 100, active: true },
            { x: 500, y: 80, width: 80, height: 80, triggerX: 420, active: true },
            { x: 650, y: 400, width: 60, height: 60, triggerX: 580, active: true }
        ],
        exit: null,
        princess: { x: 430, y: 120, width: 30, height: 50 }
    }
];

let currentLevelData = null;

// Initialize Game
function initGame() {
    loadLevel(gameState.currentLevel);
    gameState.startTime = Date.now();
    
    // Load high score from storage
    gameState.highScore = StorageManager.loadHighScore();
    updateHUD();
    
    // Show notification if LocalStorage is unavailable
    if (!StorageManager.isAvailable()) {
        console.warn('LocalStorage is unavailable. Scores will not be saved.');
    }
    
    gameLoop();
}

// Load Level
function loadLevel(levelNum) {
    currentLevelData = JSON.parse(JSON.stringify(levels[levelNum - 1]));
    player.x = 50;
    player.y = 0;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumpsRemaining = 2;
    
    // Reset Kiro instances
    kiroInstances.length = 0;
    if (currentLevelData.kiroSpots) {
        currentLevelData.kiroSpots.forEach(spot => {
            spot.active = true;
            spot.opacity = 0.6;
            spot.fleeing = false;
            spot.fleeVelocity = 0;
            // Initialize position tracking for trail particles
            spot.lastX = spot.x;
            spot.lastY = spot.y;
            spot.trailTimer = 0;
        });
    }
}

// Input Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !keys.jumpPressed) {
        keys.jump = true;
        keys.jumpPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
        keys.jump = false;
        keys.jumpPressed = false;
    }
});

// Update Player
function updatePlayer() {
    // Horizontal Movement with Inertia
    if (keys.left) {
        player.velocityX -= 0.8;
        player.direction = -1;
    }
    if (keys.right) {
        player.velocityX += 0.8;
        player.direction = 1;
    }
    
    // Apply friction
    player.velocityX *= CONFIG.friction;
    
    // Clamp velocity
    player.velocityX = Math.max(-CONFIG.moveSpeed, Math.min(CONFIG.moveSpeed, player.velocityX));
    
    // Apply gravity
    player.velocityY += CONFIG.gravity;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Check collisions
    const wasGrounded = player.isGrounded;
    player.isGrounded = false;
    checkPlatformCollisions();
    
    // Reset jumps when landing (2 jumps total: ground + air)
    if (player.isGrounded && !wasGrounded) {
        player.jumpsRemaining = 2;
    }
    
    // Double Jump
    if (keys.jump && player.jumpsRemaining > 0) {
        player.velocityY = -CONFIG.jumpPower;
        player.jumpsRemaining--;
        keys.jump = false; // Prevent holding jump
    }
    checkTrapCollisions();
    checkCollectibles();
    checkKiroTriggers();
    checkLevelComplete();
    
    // Boundary check
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Fall death
    if (player.y > canvas.height) {
        playerDeath();
    }
}

// Platform Collision Detection
function checkPlatformCollisions() {
    currentLevelData.platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
            
            // Landing on top
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isGrounded = true;
            }
            // Hitting from below
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Side collision
            else {
                if (player.velocityX > 0) {
                    player.x = platform.x - player.width;
                } else {
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
            }
        }
    });
}

// Trap Collision Detection
function checkTrapCollisions() {
    currentLevelData.traps.forEach(trap => {
        if (player.x + player.width > trap.x &&
            player.x < trap.x + trap.width &&
            player.y + player.height > trap.y &&
            player.y < trap.y + trap.height) {
            playerDeath();
        }
    });
}

// Check Collectibles
function checkCollectibles() {
    currentLevelData.extraLives.forEach(life => {
        if (!life.collected &&
            player.x + player.width > life.x &&
            player.x < life.x + life.width &&
            player.y + player.height > life.y &&
            player.y < life.y + life.height) {
            life.collected = true;
            gameState.lives = Math.min(gameState.lives + 1, 5);
            updateHUD();
        }
    });
}

// Check Kiro Triggers
function checkKiroTriggers() {
    if (!currentLevelData.kiroSpots) return;
    
    currentLevelData.kiroSpots.forEach(spot => {
        if (spot.active && !spot.fleeing) {
            const distance = Math.abs(player.x - spot.triggerX);
            if (distance < 80) {
                spot.fleeing = true;
                spot.fleeVelocity = player.x < spot.triggerX ? 3 : -3;
            }
        }
        
        if (spot.fleeing) {
            // Check if position has changed (movement detection)
            const hasMovedX = spot.x !== spot.lastX;
            const hasMovedY = spot.y !== spot.lastY;
            
            if (hasMovedX || hasMovedY) {
                // Generate trail particles at the center of the Kiro logo
                // Only generate every few frames to avoid too many particles
                spot.trailTimer++;
                if (spot.trailTimer >= 3) { // Generate trail every 3 frames
                    const centerX = spot.x + spot.width / 2;
                    const centerY = spot.y + spot.height / 2;
                    ParticleSystem.add(createTrailParticle(centerX, centerY));
                    spot.trailTimer = 0;
                }
                
                // Update last position
                spot.lastX = spot.x;
                spot.lastY = spot.y;
            }
            
            spot.x += spot.fleeVelocity;
            spot.y -= 2;
            spot.opacity -= 0.02;
            if (spot.opacity <= 0) {
                spot.active = false;
            }
        }
    });
}

// Check Level Complete
function checkLevelComplete() {
    // Check exit
    if (currentLevelData.exit) {
        const exit = currentLevelData.exit;
        if (player.x + player.width > exit.x &&
            player.x < exit.x + exit.width &&
            player.y + player.height > exit.y &&
            player.y < exit.y + exit.height) {
            levelComplete();
        }
    }
    
    // Check princess
    if (currentLevelData.princess) {
        const princess = currentLevelData.princess;
        if (player.x + player.width > princess.x &&
            player.x < princess.x + princess.width &&
            player.y + player.height > princess.y &&
            player.y < princess.y + princess.height) {
            gameWin();
        }
    }
}

// Player Death
function playerDeath() {
    gameState.lives--;
    updateHUD();
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        loadLevel(gameState.currentLevel);
    }
}

// Level Complete
function levelComplete() {
    gameState.isPaused = true;
    gameState.currentLevel++;
    if (gameState.currentLevel > levels.length) {
        gameWin();
    } else {
        showMessage('Level Complete!', 'Prepare for the next challenge...', () => {
            gameState.isPaused = false;
            loadLevel(gameState.currentLevel);
            updateHUD();
        });
    }
}

// Game Win
function gameWin() {
    gameState.isPaused = true;
    const finalTime = parseFloat(((Date.now() - gameState.startTime) / 1000).toFixed(1));
    const timeBonus = Math.max(0, 10000 - Math.floor(finalTime * CONFIG.scorePerSecond));
    gameState.score += timeBonus;
    
    // Check if this is a new high score BEFORE saving
    const previousHighScore = StorageManager.loadHighScore();
    gameState.isNewHighScore = previousHighScore === null || finalTime < previousHighScore;
    
    // Save score to storage (this also updates high score internally)
    const saved = StorageManager.saveScore(finalTime, gameState.score, gameState.currentLevel);
    
    // Update high score in game state
    gameState.highScore = StorageManager.loadHighScore();
    updateHUD();
    
    let message = `You found the Princess of Kiro!\nFinal Score: ${gameState.score}\nTime: ${finalTime}s`;
    
    if (gameState.isNewHighScore) {
        message += '\n\n🎉 NEW HIGH SCORE! 🎉';
    }
    
    if (!saved) {
        message += '\n\n(Score not saved - storage unavailable)';
    }
    
    showMessage('Victory!', message, () => {
        resetGame();
    });
}

// Game Over
function gameOver() {
    gameState.isPaused = true;
    showMessage('Game Over', 'The Prince has fallen...', () => {
        resetGame();
    });
}

// Reset Game
function resetGame() {
    gameState.currentLevel = 1;
    gameState.lives = CONFIG.maxLives;
    gameState.score = 0;
    gameState.startTime = Date.now();
    gameState.isPaused = false;
    loadLevel(1);
    updateHUD();
}

// Show Message
function showMessage(title, text, callback) {
    const overlay = document.getElementById('message-overlay');
    const titleEl = document.getElementById('message-title');
    const textEl = document.getElementById('message-text');
    const button = document.getElementById('message-button');
    
    titleEl.textContent = title;
    textEl.textContent = text;
    overlay.classList.remove('hidden');
    
    const handleContinue = () => {
        overlay.classList.add('hidden');
        document.removeEventListener('keydown', enterHandler);
        if (callback) callback();
    };
    
    const enterHandler = (e) => {
        if (e.key === 'Enter') {
            handleContinue();
        }
    };
    
    button.onclick = handleContinue;
    document.addEventListener('keydown', enterHandler);
}

// Update HUD
function updateHUD() {
    document.getElementById('level-display').textContent = gameState.currentLevel;
    document.getElementById('lives-display').textContent = gameState.lives;
    document.getElementById('score-display').textContent = gameState.score;
    
    // Update high score display
    const highScoreDisplay = document.getElementById('highscore-display');
    if (gameState.highScore !== null) {
        highScoreDisplay.textContent = gameState.highScore.toFixed(1) + 's';
    } else {
        highScoreDisplay.textContent = '--';
    }
}

// Draw Persian Palace Background
function drawPersianBackground() {
    // Stars in the night sky
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 47) % 200;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
    
    // Moon with purple glow (Kiro theme)
    ctx.save();
    ctx.shadowColor = '#790ECB';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(700, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Persian palace silhouette in background
    ctx.fillStyle = 'rgba(40, 20, 50, 0.6)';
    
    // Palace domes
    ctx.beginPath();
    ctx.arc(150, 250, 40, Math.PI, 0, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(350, 220, 50, Math.PI, 0, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(600, 240, 45, Math.PI, 0, true);
    ctx.fill();
    
    // Palace towers
    ctx.fillRect(130, 250, 40, 150);
    ctx.fillRect(325, 220, 50, 180);
    ctx.fillRect(577, 240, 46, 160);
    
    // Minarets (thin towers)
    ctx.fillRect(100, 200, 15, 200);
    ctx.fillRect(680, 220, 15, 180);
    
    // Minaret tops
    ctx.fillStyle = '#790ECB';
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.lineTo(107.5, 180);
    ctx.lineTo(115, 200);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(680, 220);
    ctx.lineTo(687.5, 200);
    ctx.lineTo(695, 220);
    ctx.fill();
    
    // Windows with purple glow
    ctx.fillStyle = 'rgba(121, 14, 203, 0.4)';
    // Tower 1 windows
    ctx.fillRect(137, 270, 10, 15);
    ctx.fillRect(153, 270, 10, 15);
    ctx.fillRect(137, 300, 10, 15);
    ctx.fillRect(153, 300, 10, 15);
    
    // Tower 2 windows
    ctx.fillRect(335, 250, 12, 18);
    ctx.fillRect(353, 250, 12, 18);
    ctx.fillRect(335, 285, 12, 18);
    ctx.fillRect(353, 285, 12, 18);
    
    // Tower 3 windows
    ctx.fillRect(587, 270, 10, 15);
    ctx.fillRect(603, 270, 10, 15);
    ctx.fillRect(587, 300, 10, 15);
    ctx.fillRect(603, 300, 10, 15);
    
    // Decorative arches with Kiro purple
    ctx.strokeStyle = '#790ECB';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(200 + i * 200, 450, 30, Math.PI, 0, true);
        ctx.stroke();
    }
}

// Render Game
function render() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#2a1a2a'); // Purple tint at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Persian palace background elements
    drawPersianBackground();
    
    // Draw Kiro spots (behind windows effect)
    if (currentLevelData.kiroSpots && kiroLogo) {
        currentLevelData.kiroSpots.forEach(spot => {
            if (spot.active) {
                ctx.save();
                ctx.globalAlpha = spot.opacity || 0.6;
                ctx.drawImage(kiroLogo, spot.x, spot.y, spot.width, spot.height);
                ctx.restore();
            }
        });
    }
    
    // Draw platforms
    ctx.fillStyle = '#2a2a2a';
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2;
    currentLevelData.platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw traps
    currentLevelData.traps.forEach(trap => {
        if (trap.type === 'spike') {
            ctx.fillStyle = '#ff3333';
            // Draw spikes
            const spikeCount = Math.floor(trap.width / 10);
            for (let i = 0; i < spikeCount; i++) {
                ctx.beginPath();
                ctx.moveTo(trap.x + i * 10, trap.y + trap.height);
                ctx.lineTo(trap.x + i * 10 + 5, trap.y);
                ctx.lineTo(trap.x + i * 10 + 10, trap.y + trap.height);
                ctx.fill();
            }
        } else if (trap.type === 'fire') {
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
            // Animated flames
            const flameOffset = Math.sin(Date.now() / 100) * 5;
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(trap.x + 5, trap.y - flameOffset, trap.width - 10, trap.height);
        }
    });
    
    // Draw extra lives
    currentLevelData.extraLives.forEach(life => {
        if (!life.collected) {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(life.x + life.width / 2, life.y + life.height / 2, life.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+1', life.x + life.width / 2, life.y + life.height / 2 + 4);
        }
    });
    
    // Draw exit
    if (currentLevelData.exit) {
        const exit = currentLevelData.exit;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('→', exit.x + exit.width / 2, exit.y + exit.height / 2 + 7);
    }
    
    // Draw princess
    if (currentLevelData.princess) {
        const princess = currentLevelData.princess;
        const ppx = princess.x;
        const ppy = princess.y;
        
        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(ppx + princess.width / 2, ppy + 10, 9, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair (long flowing)
        ctx.fillStyle = '#4a2511';
        ctx.beginPath();
        ctx.arc(ppx + princess.width / 2, ppy + 8, 9, Math.PI, 0, true);
        ctx.fill();
        ctx.fillRect(ppx + princess.width / 2 - 8, ppy + 10, 4, 12);
        ctx.fillRect(ppx + princess.width / 2 + 4, ppy + 10, 4, 12);
        
        // Crown
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(ppx + princess.width / 2 - 7, ppy + 2, 14, 3);
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 - 5, ppy + 2);
        ctx.lineTo(ppx + princess.width / 2 - 3, ppy - 2);
        ctx.lineTo(ppx + princess.width / 2 - 1, ppy + 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 + 1, ppy + 2);
        ctx.lineTo(ppx + princess.width / 2 + 3, ppy - 2);
        ctx.lineTo(ppx + princess.width / 2 + 5, ppy + 2);
        ctx.fill();
        
        // Purple dress (elegant flowing gown)
        ctx.fillStyle = '#790ECB';
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 - 10, ppy + 20);
        ctx.lineTo(ppx + princess.width / 2 + 10, ppy + 20);
        ctx.lineTo(ppx + princess.width / 2 + 14, ppy + princess.height);
        ctx.lineTo(ppx + princess.width / 2 - 14, ppy + princess.height);
        ctx.closePath();
        ctx.fill();
        
        // Dress highlights
        ctx.fillStyle = '#9a3ee0';
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 - 8, ppy + 22);
        ctx.lineTo(ppx + princess.width / 2 - 4, ppy + 22);
        ctx.lineTo(ppx + princess.width / 2 - 6, ppy + princess.height);
        ctx.lineTo(ppx + princess.width / 2 - 10, ppy + princess.height);
        ctx.closePath();
        ctx.fill();
        
        // Arms
        ctx.fillStyle = '#790ECB';
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 - 8, ppy + 22);
        ctx.lineTo(ppx + princess.width / 2 - 12, ppy + 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ppx + princess.width / 2 + 8, ppy + 22);
        ctx.lineTo(ppx + princess.width / 2 + 12, ppy + 28);
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(ppx + princess.width / 2 - 4, ppy + 10, 2, 2);
        ctx.fillRect(ppx + princess.width / 2 + 2, ppy + 10, 2, 2);
        
        // Smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ppx + princess.width / 2, ppy + 13, 3, 0, Math.PI);
        ctx.stroke();
    }
    
    // Render particle system
    ParticleSystem.render(ctx);
    
    // Draw player - Prince of Persia style (slimmer with jump animation)
    const px = player.x;
    const py = player.y;
    
    // Determine animation state
    const isJumping = player.velocityY < -2;
    const isFalling = player.velocityY > 2;
    const isMoving = Math.abs(player.velocityX) > 0.5;
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(px + player.width / 2, py + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair/Turban (white)
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.arc(px + player.width / 2, py + 8, 8, Math.PI, 0, true);
    ctx.fill();
    // Turban band
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(px + player.width / 2 - 8, py + 8, 16, 3);
    
    // Body (white tunic) - slimmer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px + player.width / 2 - 9, py + 20);
    ctx.lineTo(px + player.width / 2 + 9, py + 20);
    ctx.lineTo(px + player.width / 2 + 7, py + 36);
    ctx.lineTo(px + player.width / 2 - 7, py + 36);
    ctx.closePath();
    ctx.fill();
    
    // Tunic shadow/detail
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(px + player.width / 2, py + 20);
    ctx.lineTo(px + player.width / 2 + 9, py + 20);
    ctx.lineTo(px + player.width / 2 + 7, py + 36);
    ctx.lineTo(px + player.width / 2, py + 36);
    ctx.closePath();
    ctx.fill();
    
    // Belt
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(px + player.width / 2 - 8, py + 32, 16, 3);
    // Belt buckle
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(px + player.width / 2 - 2, py + 31, 4, 5);
    
    // Legs (pants) - animated based on state
    ctx.fillStyle = '#f5f5f5';
    if (isJumping) {
        // Legs bent up during jump
        ctx.fillRect(px + player.width / 2 - 7, py + 36, 5, 10);
        ctx.fillRect(px + player.width / 2 + 2, py + 36, 5, 10);
    } else if (isFalling) {
        // Legs extended during fall
        ctx.fillRect(px + player.width / 2 - 7, py + 36, 5, 14);
        ctx.fillRect(px + player.width / 2 + 2, py + 36, 5, 14);
    } else {
        // Normal stance
        ctx.fillRect(px + player.width / 2 - 7, py + 36, 5, 14);
        ctx.fillRect(px + player.width / 2 + 2, py + 36, 5, 14);
    }
    
    // Boots
    ctx.fillStyle = '#654321';
    if (isJumping) {
        ctx.fillRect(px + player.width / 2 - 7, py + 44, 5, 3);
        ctx.fillRect(px + player.width / 2 + 2, py + 44, 5, 3);
    } else {
        ctx.fillRect(px + player.width / 2 - 7, py + 47, 5, 3);
        ctx.fillRect(px + player.width / 2 + 2, py + 47, 5, 3);
    }
    
    // Arms - animated based on state
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    if (isJumping) {
        // Arms up during jump
        if (player.direction === 1) {
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 + 7, py + 22);
            ctx.lineTo(px + player.width / 2 + 10, py + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 - 7, py + 22);
            ctx.lineTo(px + player.width / 2 - 10, py + 15);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 - 7, py + 22);
            ctx.lineTo(px + player.width / 2 - 10, py + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 + 7, py + 22);
            ctx.lineTo(px + player.width / 2 + 10, py + 15);
            ctx.stroke();
        }
    } else if (isFalling) {
        // Arms out during fall
        ctx.beginPath();
        ctx.moveTo(px + player.width / 2 + 7, py + 22);
        ctx.lineTo(px + player.width / 2 + 12, py + 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + player.width / 2 - 7, py + 22);
        ctx.lineTo(px + player.width / 2 - 12, py + 22);
        ctx.stroke();
    } else {
        // Normal running pose
        if (player.direction === 1) {
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 + 7, py + 22);
            ctx.lineTo(px + player.width / 2 + 12, py + 30);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 - 7, py + 22);
            ctx.lineTo(px + player.width / 2 - 9, py + 28);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 - 7, py + 22);
            ctx.lineTo(px + player.width / 2 - 12, py + 30);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + player.width / 2 + 7, py + 22);
            ctx.lineTo(px + player.width / 2 + 9, py + 28);
            ctx.stroke();
        }
    }
    
    // Hands
    ctx.fillStyle = '#ffdbac';
    if (isJumping) {
        ctx.beginPath();
        ctx.arc(px + player.width / 2 + 10 * player.direction, py + 15, 2.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (!isFalling) {
        if (player.direction === 1) {
            ctx.beginPath();
            ctx.arc(px + player.width / 2 + 12, py + 30, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(px + player.width / 2 - 12, py + 30, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + player.width / 2 - 3, py + 10, 2, 2);
    ctx.fillRect(px + player.width / 2 + 1, py + 10, 2, 2);
    
    // Nose
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + player.width / 2, py + 12);
    ctx.lineTo(px + player.width / 2 + 1, py + 14);
    ctx.stroke();
}

// Game Loop
function gameLoop() {
    if (!gameState.isPaused && !gameState.gameOver) {
        updatePlayer();
        
        // Update time and score
        gameState.elapsedTime = (Date.now() - gameState.startTime) / 1000;
        gameState.score = Math.floor(gameState.elapsedTime * 10);
        document.getElementById('time-display').textContent = gameState.elapsedTime.toFixed(1) + 's';
        document.getElementById('score-display').textContent = gameState.score;
        
        // Update particle system
        ParticleSystem.update();
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// Start Game
initGame();
