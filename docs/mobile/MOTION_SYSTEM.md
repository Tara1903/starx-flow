# StarX Flow Mobile — Motion & Interaction System
**Version:** 2.0.0-PROD  
**Platform:** Compose Multiplatform (Android & iOS)

---

## 1. Core Motion Philosophy

Motion in StarX Flow is functional, physics-driven, and subtle. It reinforces hierarchy and delivers tactile feedback without causing motion sickness, lag, or distracting from business tasks.

### Guiding Principles:
- **Responsive Physics:** Transitions use damped springs rather than robotic linear timing curves.
- **Intentional Feedback:** Interactive components visibly react to touch immediately (`0.97f` scale down on press, spring restoration on release).
- **Zero Decorative Loops:** No infinite rotating gradients or bouncing badges; animations are purposeful (e.g. pulse indicators on active AI agents).
- **60fps / 120fps Target:** Lightweight recompositions using `animateFloatAsState` and `remember` ensure zero dropped frames on high-refresh ProMotion and 120Hz AMOLED screens.

---

## 2. Spring Animation Specifications

StarX Flow adopts standardized Compose spring specifications:

```kotlin
// Micro-interaction Scale Spring (Buttons, Cards, Chips)
val InteractionSpring = spring<Float>(
    dampingRatio = Spring.DampingRatioMediumBouncy, // 0.75f - tactile response without oscillation
    stiffness = Spring.StiffnessMedium              // 1500f - instant touch feedback
)

// Navigation & Sheet Elevation Spring
val StructuralSpring = spring<Float>(
    dampingRatio = Spring.DampingRatioNoBouncy,     // 1.0f - perfectly damped
    stiffness = Spring.StiffnessLow                 // 300f - natural, fluid movement
)
```

---

## 3. Screen Transitions & Navigation Hierarchy

- **Global Tab Switching:** Crossfade transition with 250ms duration (`Crossfade(targetState = currentTab)`), avoiding jarring horizontal layout jumps.
- **Bottom Sheet Entrance:** Combined `slideInVertically(initialOffsetY = { it }) + fadeIn()` and `slideOutVertically(targetOffsetY = { it }) + fadeOut()` with ease-in-out curve.
- **Floating Dock Selection:** Animated active indicator scaling (`1.05f`) with background alpha interpolation (`0.16f`).
- **Chat Bubble Insertion:** Animated entrance into the message stream with smooth auto-scroll to the latest message.
- **Live AI Pulse:** 1200ms reversible tween (`RepeatMode.Reverse`) oscillating alpha between `0.4f` and `1.0f` on active agent indicator dots.

---

## 4. Accessibility & Reduced Motion

- **Reduced Motion Support:** When system accessibility settings request reduced motion, duration scales to zero or falls back to instantaneous crossfade.
- **Touch Target Sizes:** All interactive icon buttons (`StarXIconButton`) and navigation elements enforce a minimum of 40dp × 40dp touch target bounding boxes.
- **Haptic Alignment:** Press gestures align with standard system feedback ticks on Android (`LocalHapticFeedback.current.performHapticFeedback(HapticFeedbackType.LongPress)`).
