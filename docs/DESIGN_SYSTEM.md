---
name: SpeakUp AI Design System
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-performance, studio-grade aesthetic for technical candidates undergoing simulated voice assessments. The brand identity fuses deep cognitive focus with reactive, real-time computational feedback. 

### Creative Direction
- **Style Archetype:** Modern Glass & Technical Instrumentalism. The interface behaves like an audio engineering console and high-tier code environment, replacing playful consumer tropes with precise metrics, crisp data representations, and fluid visualizers.
- **Atmosphere:** Deep focus, low cognitive fatigue, cinematic immersion. The canvas mimics an acoustically treated room—dark, steady, and punctuated by responsive luminescence.
- **Voice & Tone:** Objective, reassuring, analytical, and exacting. Performance metrics are delivered with clinical clarity without feeling punitive.

### Emotional Target
Candidates should feel focused during the active interview, supported during conversational pauses, and empowered with actionable, unvarnished insight during the rubric score review.

## Colors

The palette is engineered for prolonged visual endurance in dark mode, balancing deep neutral backdrops with vibrant spectral accents dedicated to dynamic audio states and multi-tier rubric evaluation.

### Core Role Assignments
- **Canvas Base (`#090D16`):** The absolute background. Grounded, non-distracting, eliminating screen glare.
- **Elevated Canvas / Cards (`#0F172A`):** The default container background, providing structural depth while preserving contrast against foreground elements.
- **Primary Voice Wave Accent (`#6366F1`):** Indigo core. Governs active AI speech, primary calls-to-action, progress trackers, and focused navigation states.
- **Secondary Responsive Accent (`#38BDF8`):** Sky cyan. Applied to active user speech waveforms, transcription highlights, dynamic pitch nodes, and live timing meters.
- **Semantic Metric Tiers:**
  - **High Performance / Mastery (`#10B981`):** Clean emerald for rubric scores above 85%, affirmative benchmark validations, and positive speech cadence markers.
  - **Moderate / Needs Polishing (`#F59E0B`):** Warm amber for scores between 60% and 84%, pacing warnings, and filler word flags.
  - **Critical / Off-Track (`#EF4444`):** Crisp coral rose for scores below 60%, audio dropouts, and critical rubric deductions.
- **Structural Borders & Glows:** Surfaces utilize a 1px border of `rgba(255, 255, 255, 0.08)` under idle states, transitioning to subtle glows powered by `rgba(99, 102, 241, 0.35)` or `rgba(56, 189, 248, 0.35)` when the system is processing or streaming audio.

## Typography

The type system balances human dialogue legibility with technical precision.

- **Plus Jakarta Sans** powers structural headings and section titles, delivering clean modern geometry with slight softness to avoid cold industrial sterility.
- **Inter** handles high-density bodies, live interview transcripts, and multi-paragraph diagnostic evaluations, offering industry-standard vertical rhythm and cross-platform legibility.
- **JetBrains Mono** controls audio timestamps, countdown timers, token processing meters, dimension rankings, and code-based syntax prompts. This monospace anchor signals real-time metric reliability.

All body copy on elevated dark surfaces maintains a minimum contrast ratio of 7:1 against card backgrounds, using `#F8FAFC` for primary reading and `#94A3B8` for secondary descriptions.

## Layout & Spacing

Layouts follow a structured 12-column grid on desktop screens (1280px and wider), an 8-column layout for tablets (768px - 1279px), and a 4-column flow for mobile viewports (< 768px).

### Structural Composition
- **Active Stage Mode:** When an interview is active, the workspace isolates the candidate from global sidebars, collapsing the primary focus into an 8-column centralized console bounded by active waveform monitors and immediate feedback indicators.
- **Diagnostic Scorecard Mode:** Post-interview analytical review leverages a 12-column asynchronous layout: 4 columns for session overview, key KPIs, and recording playback; 8 columns for the 5-dimension rubric breakdown, contextual transcript annotations, and tailored technical improvement drills.
- **Reflow Rules:** Dynamic modules (such as waveform monitors and simultaneous transcription panes) stack vertically below 768px, pinning recording controls, status badges, and stop triggers to a fixed bottom drawer.

## Elevation & Depth

Visual hierarchy relies on calibrated surface stacking, low-contrast structural outlines, and responsive emission glows rather than heavy opaque drop shadows.

### Elevation Hierarchy
1. **Level 0 (Canvas Base):** Raw background (`#090D16`). Void of shadows or glows.
2. **Level 1 (Card & Modular Tier):** Layered background (`#0F172A`) framed with a 1px border of `rgba(255, 255, 255, 0.07)`. Creates an initial physical plane for transcripts, rubric dimensions, and passive UI elements.
3. **Level 2 (Active Feedback Nodes):** Floating toolbars, active waveform modules, and hover states. Border shifts to `rgba(99, 102, 241, 0.25)` complemented by an ambient, extra-diffused blur: `0 12px 32px -8px rgba(9, 13, 22, 0.75), 0 0 20px -4px rgba(99, 102, 241, 0.12)`.
4. **Level 3 (Modal Dialogs & Audio HUDs):** Heavy backdrop blur (`backdrop-filter: blur(16px)`), solid `#0F172A` with 80% opacity, bordered with `rgba(255, 255, 255, 0.15)`, cast over a dark mask of `rgba(9, 13, 22, 0.85)`.

### State-Driven Reactive Glows
Components change elevation interactively based on audio input. As candidate volume or AI synthesis peaks, container strokes interpolate towards their semantic hue (`#38BDF8` for candidate, `#6366F1` for AI) paired with a localized aura blur of 12px to 24px with 20% opacity.

## Shapes

The design system adopts a balanced rounded architecture (`roundedness: 2`). Standard controls, inner elements, and metric badges carry an 8px (`0.5rem`) radius, larger modules and surface cards employ 16px (`1rem`), and system dialogue overlays utilize 24px (`1.5rem`).

Pill radii (`9999px`) are reserved exclusively for status indicators, active voice activity indicators (VAD badges), audio timer modules, and rubric rating chips. This differentiation visually distinguishes active metadata from structural content containers.

## Components

### Buttons
- **Primary:** Solid `#6366F1` background, `#FFFFFF` text, subtle top-edge highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.25)`). Transitions to `#4F46E5` on hover with a `0 0 16px rgba(99, 102, 241, 0.4)` glow.
- **Secondary / Action Ghost:** `#0F172A` surface, 1px border in `rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. On hover, the border illuminates to `rgba(56, 189, 248, 0.4)` with an ambient cyan glow.
- **Destructive (End Interview):** `rgba(239, 68, 68, 0.12)` background, `rgba(239, 68, 68, 0.3)` border, `#EF4444` label. On hover, background shifts to `#EF4444` with white text.

### Audio Waveform Visualizer
- Multi-bar or smooth canvas spline rendering within an elevated card.
- User input renders in dual-tone `#38BDF8` with a vertical amplitude range bound between 4px and 64px.
- AI synthetic response displays in `#6366F1` with an oscillating sine-wave envelope.
- Inactive state renders as a flat baseline in `rgba(255, 255, 255, 0.1)`.

### Timer Badges
- Encapsulated pill container with JetBrains Mono font (`label-md`).
- Active recording: subtle flashing dot (`#EF4444`), high-contrast elapsed numbers (`#F8FAFC`), wrapped in a low-opacity container border of `rgba(239, 68, 68, 0.25)`.

### 5-Dimension Rubric Scorecard
Modular analytical cards representing:
1. Technical Correctness & Architecture
2. Problem-Solving Logic & Decomposition
3. Communication & Clarification Skills
4. Performance & Scalability Considerations
5. Edge-Case Coverage & Resilience

- Each scorecard module features:
  - Header: Category name (`title-md`) paired with a monospaced total score (e.g., `92/100`).
  - Progress Rail: 6px track height with a dark channel (`rgba(255, 255, 255, 0.06)`) and dynamic fill colored according to threshold (`#10B981`, `#F59E0B`, or `#EF4444`).
  - Qualitative Breakdown: Bulleted points highlighting candidate excerpts synced with click-to-play timestamps.

### Interactive Transcript Cards
- Left-aligned AI prompts with indigo left-edge border markers.
- Right-aligned candidate transcriptions with cyan accents.
- Inline filler words (e.g., "like", "um", "you know") are enclosed in low-contrast amber badges (`rgba(245, 158, 11, 0.15)` bg, `#F59E0B` text) with hover tooltips detailing pacing delay.

### Form Inputs & Code Blocks
- Search and custom question inputs use an inset `#090D16` fill, `rgba(255, 255, 255, 0.1)` border, and full-width focus rings in `#6366F1`.
- Live code snippets and structural examples use JetBrains Mono, framed within a terminal window container featuring line numbers and syntax-highlighted tokens.