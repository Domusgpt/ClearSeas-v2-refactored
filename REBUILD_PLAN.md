# Section Redesign Plan

## Current Problem
- Products section: Boring 6-card grid
- Research section: Static 2-column layout
- Contact section: Plain form
- Visualizer is just background - not integrated with content

## New Design

### Products Section (Dynamic Showcase)
Instead of grid, make it a **featured showcase with scroll-reveal**:

**Layout:**
```
[Large Feature Card - Takes 60% width]  [Stats Column - 40%]
   - Reposiologist spotlight              - Live platforms: 3
   - Big visual, animated demo            - Coming soon: 2
   - Hover triggers visualizer morph      - Total reach: 10k+

[Horizontal Scroll Carousel]
   [Parserator] [Nimbus] [Minoots] [Vib3-Scribe] →
```

**Visualizer Integration:**
- Hovering each product card morphs visualizer
- Each product has unique geometry/color
- Smooth transitions between states

### Research Section (Interactive Timeline)
Instead of static layout, make it **vertical timeline with parallax**:

**Layout:**
```
          [Timeline Line]
                |
         [PPP Research]  ← Offset left
                |
                |
         [EMA Philosophy]  ← Offset right
                |
                |
         [Client Work]  ← Offset left
```

**Visualizer Integration:**
- As you scroll past each research item, visualizer morphs
- Timeline pulses in sync with visualizer changes
- Cards expand when in viewport center

### Contact Section (Immersive CTA)
Instead of plain form, make it **full-screen immersive**:

**Layout:**
```
[Full viewport height]

   Centered content:
   - Large headline
   - Email button (triggers visualizer explosion)
   - Social links with hover effects

   Background: Visualizer at maximum intensity
```

**Visualizer Integration:**
- Visualizer cranked to max (chaos, intensity, speed)
- Clicking email triggers particle burst
- Mouse movement creates reactive trails

## Implementation Steps
1. Create new Products showcase layout
2. Add horizontal scroll carousel
3. Create Research timeline
4. Add parallax offsets
5. Create immersive Contact section
6. Wire up visualizer morphing on hover/scroll
7. Add particle effects for interactions
