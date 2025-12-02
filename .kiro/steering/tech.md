# Technical Stack

## Core Technologies
- **Vanilla JavaScript** (ES6+) - No frameworks or libraries
- **HTML5 Canvas API** - For all game rendering
- **CSS3** - UI styling and layout

## Architecture
- Single-page application with no build process
- Direct browser execution (no compilation required)
- Canvas-based 2D rendering at 60 FPS target

## Key Technical Details

### Game Configuration
- Gravity: 0.7
- Jump Power: 12
- Move Speed: 5
- Friction: 0.85 (for inertia-based movement)
- Canvas Size: 800x600

### Physics System
- Custom gravity and velocity calculations
- Inertia-based horizontal movement with friction
- Double jump mechanic (2 jumps before grounding)
- Platform collision detection (top, bottom, sides)

### Game State Management
- Global `gameState` object tracking level, lives, score, time
- Level data stored as JSON-like objects in `levels` array
- Player state in dedicated `player` object

### Input Handling
- Keyboard controls: Arrow keys or WASD
- Space bar for jump
- Event-driven input with key state tracking

## Running the Game

### Development
Simply open `index.html` in a modern web browser. No build step required.

### File Structure
- `index.html` - Entry point and DOM structure
- `game.js` - All game logic, rendering, and state management
- `style.css` - UI styling (HUD, overlays, buttons)
- `static/kiro-logo.png` - Logo asset for dynamic background elements

### Browser Requirements
- Modern browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Chrome, Firefox, Edge, Safari (latest versions)
