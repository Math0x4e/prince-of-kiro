# Implementation Plan

- [x] 1. Implement Storage Manager for persistent save system





  - Create StorageManager object with save/load methods
  - Implement LocalStorage wrapper with error handling
  - Add high score comparison and update logic
  - Add score history management with chronological sorting
  - Implement availability check for graceful degradation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Write property test for score persistence









  - **Property 1: Score persistence**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property test for high score update logic
  - **Property 2: High score update logic**
  - **Validates: Requirements 1.2**

- [ ]* 1.3 Write property test for score history ordering
  - **Property 3: Score history ordering**
  - **Validates: Requirements 1.4**

- [x] 2. Integrate save system with game completion flow





  - Hook saveScore() into gameWin() function
  - Load and display high score on game initialization
  - Add high score display to HUD
  - Implement new high score detection flag
  - Add fallback for LocalStorage unavailability
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Create core particle system engine





  - Implement ParticleSystem object with particles array
  - Create add(), update(), and render() methods
  - Implement particle lifecycle management (aging and removal)
  - Add particle limit enforcement (500 max)
  - Integrate particle system into game loop
  - _Requirements: 2.3, 3.5, 4.4, 5.5_

- [ ]* 3.1 Write property test for particle lifecycle cleanup
  - **Property 4: Particle lifecycle cleanup**
  - **Validates: Requirements 2.3, 3.5, 4.4, 5.5**

- [x] 4. Implement trail particle effects for Kiro logo





  - Create createTrailParticle() generator function
  - Add position tracking to Kiro spots (lastX, lastY)
  - Implement trail generation on Kiro movement
  - Add opacity decay animation for trail particles
  - Ensure trails use Kiro purple color (#790ECB)
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ]* 4.1 Write property test for trail generation on movement
  - **Property 5: Trail generation on movement**
  - **Validates: Requirements 2.1, 2.4**

- [ ]* 4.2 Write property test for trail particle opacity decay
  - **Property 6: Trail particle opacity decay**
  - **Validates: Requirements 2.2**

- [ ] 5. Implement explosion particle effects
  - Create createExplosionParticles() generator function
  - Implement radial velocity distribution (360 degrees)
  - Add random color selection (red, orange, yellow)
  - Implement size and opacity decay over lifetime
  - Hook explosion trigger into playerDeath() and trap collisions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 5.1 Write property test for explosion radial distribution
  - **Property 7: Explosion radial distribution**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 5.2 Write property test for explosion particle aging
  - **Property 8: Explosion particle aging**
  - **Validates: Requirements 3.4**

- [ ] 6. Implement sparkle particle effects
  - Create createSparkleParticles() generator function
  - Implement proximity detection for player-trap distance
  - Add pulsing animation with sinusoidal scale/opacity
  - Ensure sparkles only generate when near but not colliding
  - Add sparkle generation to game update loop
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 6.1 Write property test for sparkle proximity trigger
  - **Property 9: Sparkle proximity trigger**
  - **Validates: Requirements 4.1, 4.5**

- [ ]* 6.2 Write property test for sparkle pulsing animation
  - **Property 10: Sparkle pulsing animation**
  - **Validates: Requirements 4.2, 4.3**

- [ ] 7. Implement confetti particle effects
  - Create createConfettiParticles() generator function
  - Implement varied color palette including Kiro purple
  - Add gravity and horizontal drift physics
  - Implement continuous rotation animation
  - Hook confetti trigger to new high score detection
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 Write property test for confetti trigger on new high score
  - **Property 11: Confetti trigger on new high score**
  - **Validates: Requirements 5.1**

- [ ]* 7.2 Write property test for confetti color variety
  - **Property 12: Confetti color variety**
  - **Validates: Requirements 5.2**

- [ ]* 7.3 Write property test for confetti physics
  - **Property 13: Confetti physics**
  - **Validates: Requirements 5.3, 5.4**

- [ ] 8. Add score history UI display
  - Create score history modal/overlay
  - Display all saved sessions with formatting
  - Show timestamps in readable format
  - Highlight current high score
  - Add button to view history from main menu
  - _Requirements: 1.4_

- [ ] 9. Performance optimization and polish
  - Implement particle object pooling for reuse
  - Add performance monitoring and throttling
  - Test with maximum particle counts
  - Optimize rendering with batching by particle type
  - Add configuration option to reduce/disable effects
  - _Design: Performance Optimization section_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
