# Design Document

## Overview

This design document outlines the implementation of game enhancements for the Prince of Kiro platformer, including a persistent save system for score tracking and a comprehensive particle effects system. The enhancements will integrate seamlessly with the existing vanilla JavaScript architecture while maintaining the 60 FPS performance target.

## Architecture

### High-Level Structure

The enhancements follow the existing single-file architecture pattern with clear separation of concerns:

1. **Storage Layer** - LocalStorage wrapper for persistent data management
2. **Particle System** - Unified particle engine for all visual effects
3. **Effect Managers** - Specialized handlers for each effect type
4. **Integration Points** - Hooks into existing game loop and event handlers

### Data Flow

```
Game Events → Effect Triggers → Particle System → Render Pipeline
     ↓
Save Events → Storage Manager → LocalStorage
     ↓
Load Events → Storage Manager → Game State
```

## Components and Interfaces

### 1. Storage Manager

**Purpose**: Handle all persistent data operations for scores and game history.

**Interface**:
```javascript
const StorageManager = {
    saveScore(time, score, level, date),
    loadHighScore(),
    loadScoreHistory(),
    updateHighScore(time),
    isAvailable()
}
```

**Key Methods**:
- `saveScore()` - Persists a completed game session
- `loadHighScore()` - Retrieves best time from storage
- `loadScoreHistory()` - Returns array of all saved sessions
- `updateHighScore()` - Updates high score if new time is better
- `isAvailable()` - Checks LocalStorage availability

**Storage Schema**:
```javascript
{
    highScore: number,           // Best (lowest) time in seconds
    scoreHistory: [
        {
            time: number,        // Completion time in seconds
            score: number,       // Final score
            level: number,       // Levels completed
            date: string,        // ISO timestamp
            id: string          // Unique identifier
        }
    ]
}
```

### 2. Particle System

**Purpose**: Unified engine for creating, updating, and rendering all particle effects.

**Core Structure**:
```javascript
const ParticleSystem = {
    particles: [],
    add(particle),
    update(deltaTime),
    render(ctx),
    clear()
}
```

**Particle Base Object**:
```javascript
{
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    life: number,           // Current lifetime
    maxLife: number,        // Total lifetime
    size: number,
    color: string,
    type: string,           // 'trail', 'explosion', 'sparkle', 'confetti'
    opacity: number,
    rotation: number,       // For confetti
    rotationSpeed: number   // For confetti
}
```

### 3. Effect Generators

#### Trail Effect Generator
```javascript
function createTrailParticle(x, y) {
    return {
        x, y,
        velocityX: 0,
        velocityY: 0,
        life: 30,           // 30 frames (~0.5 seconds)
        maxLife: 30,
        size: 8,
        color: '#790ECB',
        type: 'trail',
        opacity: 0.6
    }
}
```

#### Explosion Effect Generator
```javascript
function createExplosionParticles(x, y, count = 15) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        particles.push({
            x, y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            life: 40,
            maxLife: 40,
            size: 4 + Math.random() * 4,
            color: ['#ff3333', '#ff6600', '#ffaa00'][Math.floor(Math.random() * 3)],
            type: 'explosion',
            opacity: 1
        });
    }
    return particles;
}
```

#### Sparkle Effect Generator
```javascript
function createSparkleParticles(x, y, count = 5) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            velocityX: 0,
            velocityY: -0.5,
            life: 60,
            maxLife: 60,
            size: 3,
            color: '#ffffff',
            type: 'sparkle',
            opacity: 1,
            pulsePhase: Math.random() * Math.PI * 2
        });
    }
    return particles;
}
```

#### Confetti Effect Generator
```javascript
function createConfettiParticles(count = 50) {
    const particles = [];
    const colors = ['#790ECB', '#9a3ee0', '#ffffff', '#ffd700', '#ff69b4'];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20,
            velocityX: (Math.random() - 0.5) * 2,
            velocityY: Math.random() * 2 + 1,
            life: 180,
            maxLife: 180,
            size: 6 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'confetti',
            opacity: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
    return particles;
}
```

## Data Models

### Game State Extensions

Add to existing `gameState` object:
```javascript
gameState = {
    // ... existing properties
    highScore: null,        // Loaded from storage
    isNewHighScore: false,  // Flag for confetti trigger
    lastKiroPositions: []   // Track Kiro positions for trails
}
```

### Kiro Spot Extensions

Extend existing `kiroSpots` in level data:
```javascript
{
    // ... existing properties
    lastX: number,          // Previous X position
    lastY: number,          // Previous Y position
    trailTimer: number      // Frames since last trail particle
}
```

## Corre
ctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Save System Properties

Property 1: Score persistence
*For any* completed game session with valid time and score data, saving to Local Storage should result in that data being retrievable with all fields intact (time, score, level, date).
**Validates: Requirements 1.1**

Property 2: High score update logic
*For any* new completion time and existing high score, the high score should be updated if and only if the new time is lower (better) than the existing high score.
**Validates: Requirements 1.2**

Property 3: Score history ordering
*For any* set of saved game sessions, retrieving the score history should return all entries sorted chronologically by date.
**Validates: Requirements 1.4**

### Particle System Properties

Property 4: Particle lifecycle cleanup
*For any* particle type (trail, explosion, sparkle, confetti), when a particle's life exceeds its maxLife or moves outside valid boundaries, it should be removed from the particle array.
**Validates: Requirements 2.3, 3.5, 4.4, 5.5**

Property 5: Trail generation on movement
*For any* Kiro logo instance, trail particles should be generated if and only if the logo's position has changed since the last frame.
**Validates: Requirements 2.1, 2.4**

Property 6: Trail particle opacity decay
*For any* trail particle, its opacity should decrease monotonically as its life approaches maxLife, reaching zero at maxLife.
**Validates: Requirements 2.2**

Property 7: Explosion radial distribution
*For any* explosion effect triggered at coordinates (x, y), all generated particles should have velocity vectors pointing away from (x, y) in varied directions covering 360 degrees.
**Validates: Requirements 3.2, 3.3**

Property 8: Explosion particle aging
*For any* explosion particle, both its opacity and size should decrease monotonically as life approaches maxLife.
**Validates: Requirements 3.4**

Property 9: Sparkle proximity trigger
*For any* player position and trap position, sparkle particles should be generated if and only if the distance between player and trap is below the proximity threshold and no collision occurred.
**Validates: Requirements 4.1, 4.5**

Property 10: Sparkle pulsing animation
*For any* sparkle particle at time t, its scale and opacity should vary sinusoidally based on its pulsePhase, creating a twinkling effect.
**Validates: Requirements 4.2, 4.3**

Property 11: Confetti trigger on new high score
*For any* game completion, confetti particles should be generated if and only if the completion time is better than the previous high score (or no high score exists).
**Validates: Requirements 5.1**

Property 12: Confetti color variety
*For any* confetti effect generation, the created particles should include multiple distinct colors, with at least one particle using Kiro purple (#790ECB).
**Validates: Requirements 5.2**

Property 13: Confetti physics
*For any* confetti particle, its velocityY should increase over time (gravity), and its rotation should change continuously based on rotationSpeed.
**Validates: Requirements 5.3, 5.4**

## Error Handling

### LocalStorage Unavailability

**Strategy**: Graceful degradation with user notification

**Implementation**:
1. Wrap all storage operations in try-catch blocks
2. Check `StorageManager.isAvailable()` before operations
3. Display non-intrusive notification when storage fails
4. Continue game functionality without save features
5. Store session data in memory as fallback (lost on page refresh)

**Error States**:
- LocalStorage disabled in browser settings
- Storage quota exceeded
- Private browsing mode restrictions
- Browser compatibility issues

### Particle System Performance

**Strategy**: Performance monitoring and automatic throttling

**Implementation**:
1. Track particle count per frame
2. Set maximum particle limit (500 particles)
3. Remove oldest particles when limit exceeded
4. Skip particle generation if frame rate drops below 45 FPS
5. Provide configuration option to disable effects

**Performance Safeguards**:
```javascript
const PARTICLE_LIMITS = {
    trail: 100,
    explosion: 50,
    sparkle: 150,
    confetti: 200,
    total: 500
}
```

## Testing Strategy

### Unit Testing

**Framework**: Jest (or similar lightweight testing framework)

**Unit Test Coverage**:

1. **Storage Manager Tests**
   - Test save/load operations with valid data
   - Test high score comparison logic
   - Test score history sorting
   - Test error handling when LocalStorage unavailable
   - Test data schema validation

2. **Particle System Tests**
   - Test particle creation with correct properties
   - Test particle update logic (position, opacity, life)
   - Test particle removal conditions
   - Test particle array management

3. **Effect Generator Tests**
   - Test each generator creates correct particle count
   - Test particle properties match specifications
   - Test randomization produces varied results
   - Test color assignments

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations to ensure robust validation across varied inputs.

**Property Test Coverage**:

Each correctness property listed above will be implemented as a property-based test. Tests will use generators to create random but valid inputs:

**Generators**:
- `arbGameSession()` - Generates random game completion data
- `arbHighScore()` - Generates random high score values
- `arbPosition()` - Generates random (x, y) coordinates within canvas
- `arbParticle()` - Generates random particle objects
- `arbKiroMovement()` - Generates random Kiro position sequences
- `arbPlayerTrapDistance()` - Generates random player/trap proximity scenarios

**Example Property Test Structure**:
```javascript
// Property 1: Score persistence
fc.assert(
  fc.property(arbGameSession(), (session) => {
    StorageManager.saveScore(session.time, session.score, session.level, session.date);
    const history = StorageManager.loadScoreHistory();
    const saved = history.find(s => s.date === session.date);
    return saved && 
           saved.time === session.time &&
           saved.score === session.score &&
           saved.level === session.level;
  }),
  { numRuns: 100 }
);
```

### Integration Testing

**Scope**: Test interaction between components

1. **Save System Integration**
   - Test game completion triggers save
   - Test high score updates trigger confetti
   - Test score history display updates correctly

2. **Particle System Integration**
   - Test Kiro movement generates trails
   - Test trap collision generates explosion
   - Test proximity detection generates sparkles
   - Test all effects render without conflicts

3. **Performance Integration**
   - Test particle limits are enforced
   - Test frame rate remains stable with max particles
   - Test cleanup prevents memory leaks

## Implementation Notes

### Performance Optimization

1. **Object Pooling**: Reuse particle objects instead of creating new ones
2. **Batch Rendering**: Group particles by type for efficient rendering
3. **Culling**: Skip rendering particles outside viewport
4. **Throttling**: Limit particle generation rate during heavy scenes

### Browser Compatibility

- Target modern browsers (Chrome, Firefox, Edge, Safari latest versions)
- Use feature detection for LocalStorage
- Provide fallbacks for missing Canvas features
- Test on mobile browsers for touch compatibility

### Accessibility Considerations

- Provide option to reduce or disable particle effects
- Ensure score information is readable without effects
- Maintain contrast ratios for text overlays
- Support keyboard-only navigation for menus

### Future Enhancements

- Add sound effects synchronized with visual effects
- Implement particle effect customization options
- Add achievement system tied to score milestones
- Create leaderboard with online score sharing
- Add replay system to review best runs
