# Project Structure

## File Organization

```
/
├── index.html          # Main HTML entry point with canvas and HUD
├── game.js             # Complete game implementation (single file)
├── style.css           # All styling for UI elements
├── static/
│   └── kiro-logo.png   # Logo asset for background animations
├── .kiro/
│   └── steering/       # AI assistant guidance documents
└── .vscode/            # VS Code workspace settings
```

## Code Organization (game.js)

The game logic is organized in a single file with clear sections:

1. **Configuration** - `CONFIG` object with game constants
2. **Canvas Setup** - Canvas and context initialization
3. **Game State** - Global state tracking (level, lives, score, time)
4. **Player Object** - Player properties (position, velocity, dimensions)
5. **Input Handling** - Keyboard event listeners and key state
6. **Level Definitions** - `levels` array with platform, trap, and collectible data
7. **Game Initialization** - `initGame()` and `loadLevel()`
8. **Update Logic** - Player physics, collision detection, game rules
9. **Rendering** - Canvas drawing for all game elements
10. **Game Loop** - `requestAnimationFrame` based loop

## Conventions

### Naming
- **Constants**: UPPER_SNAKE_CASE (e.g., `CONFIG`, `MAX_LIVES`)
- **Variables**: camelCase (e.g., `gameState`, `currentLevel`)
- **Functions**: camelCase verbs (e.g., `updatePlayer()`, `checkCollisions()`)

### Coordinate System
- Origin (0,0) at top-left of canvas
- X increases rightward, Y increases downward
- Player position refers to top-left corner of hitbox

### Level Data Structure
Each level contains:
- `platforms[]` - Solid surfaces for collision
- `traps[]` - Hazards that cause death
- `extraLives[]` - Collectible life pickups
- `kiroSpots[]` - Dynamic logo elements with trigger zones
- `exit` - Level completion trigger (or `princess` for final level)

### Color Scheme
- Primary brand: `#790ECB` (Kiro purple)
- Dark backgrounds: `#0a0a0a`, `#1a1a1a`, `#2a2a2a`
- Accents: `#ffffff` (white), `#a0a0a0` (gray)
- Danger: `#ff3333` (red), `#ff6600` (orange)
