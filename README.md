# Prince of Kiro 🎮

A 2D platformer game where you play as a prince navigating through challenging levels to find the Princess of Kiro. Built with vanilla JavaScript and HTML5 Canvas.

![Game Preview](static/kiro-logo.png)

## 🎯 Game Features

- **2 Challenging Levels** - Navigate through Persian palace-themed environments
- **Time-Based Scoring** - Complete levels faster for higher scores
- **Lives System** - Start with 3 lives, find hidden extra lives in difficult spots
- **Double Jump Mechanic** - Master the art of platforming with double jumps
- **Dynamic Obstacles** - Avoid spikes and fire traps
- **Interactive Kiro Logos** - Watch the Kiro logo flee as you approach
- **Beautiful Persian Palace Theme** - Night sky, moon, and palace silhouettes

## 🎮 How to Play

### Controls
- **Arrow Keys** or **WASD** - Move left/right
- **Space Bar** or **Up Arrow/W** - Jump (press twice for double jump)

### Objective
Navigate through platforms, avoid traps, collect extra lives, and reach the Princess of Kiro!

### Scoring
- Time-based scoring system
- Faster completion = higher score
- Bonus points awarded at the end

## 🚀 Getting Started

### Play Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/Math0x4e/prince-of-kiro.git
   ```

2. Open `index.html` in your web browser

That's it! No build process or dependencies required.

### Browser Requirements
- Modern browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Chrome, Firefox, Edge, or Safari (latest versions)

## 🛠️ Technical Details

### Built With
- **Vanilla JavaScript (ES6+)** - No frameworks or libraries
- **HTML5 Canvas API** - All game rendering at 60 FPS
- **CSS3** - UI styling and layout

### Game Physics
- Gravity: 0.7
- Jump Power: 12
- Movement Speed: 5
- Friction: 0.85 (inertia-based movement)
- Canvas Size: 800x600

### Project Structure
```
/
├── index.html          # Main HTML entry point
├── game.js             # Complete game logic
├── style.css           # UI styling
├── static/
│   └── kiro-logo.png   # Logo asset
└── README.md           # This file
```

## 🎨 Game Design

### Character Design
- **Prince** - White tunic with turban, animated running and jumping
- **Princess** - Purple dress (#790ECB - Kiro brand color) with crown

### Visual Theme
- Persian palace architecture in the background
- Night sky with stars and glowing moon
- Purple-tinted atmosphere matching Kiro branding
- Smooth animations and visual feedback

## 🎯 Game Mechanics

### Lives & Death
- Start with 3 lives
- Lose a life when touching traps or falling off screen
- Restart at the beginning of current level on death
- Game over when all lives are lost

### Collectibles
- Extra lives hidden in challenging locations
- Maximum of 5 lives can be held

### Level Progression
- Complete Level 1 to unlock Level 2
- Find the Princess in the final level to win

## 🤝 Contributing

This is a personal project, but feel free to fork and create your own version!

## 📝 License

This project is open source and available for educational purposes.

## 🎮 Credits

Created with ❤️ using Kiro AI Assistant

---

**Enjoy the game and good luck finding the Princess of Kiro!** 👑
