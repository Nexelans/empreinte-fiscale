## Purpose

Animation partageable d'une journée fiscale type utilisant Framer Motion pour révéler les taxes à chaque moment de la journée de manière engageante et virale.

## ADDED Requirements

### Requirement: Animation sequence
The system SHALL create a choreographed animation showing fiscal moments throughout a typical day.

#### Scenario: Morning sequence
- **WHEN** animation starts
- **THEN** system displays morning coffee scene with TVA calculation appearing as overlay (20% on coffee = 0,40€)

#### Scenario: Commute sequence
- **WHEN** morning sequence completes
- **THEN** system transitions to commute scene showing TICPE on fuel or transport subscription cost

#### Scenario: Lunch sequence
- **WHEN** commute sequence completes
- **THEN** system displays lunch scene with restaurant TVA (10%) calculation

#### Scenario: Work sequence
- **WHEN** lunch sequence completes
- **THEN** system shows work scene revealing CSG/CRDS, cotisations salariales, and cotisations patronales

#### Scenario: Evening sequence
- **WHEN** work sequence completes
- **THEN** system displays evening shopping scene with various TVA rates on different items

#### Scenario: Final summary
- **WHEN** all sequences complete
- **THEN** system displays animated summary card with total daily taxes and services received

### Requirement: Data source selection
The system SHALL use real user data when available, otherwise generate estimates from profile.

#### Scenario: Use journal data
- **WHEN** user has logged journal entries for typical expenses
- **THEN** system uses actual enseigne names, montants, and dates from journal

#### Scenario: Use profile estimates
- **WHEN** user has no journal data for a scene type
- **THEN** system generates plausible estimate based on user's consommation profile

#### Scenario: Hybrid approach
- **WHEN** user has partial journal data
- **THEN** system uses real data where available and fills gaps with profile-based estimates

### Requirement: Animation controls
The system SHALL provide playback controls for user interaction.

#### Scenario: Auto-play
- **WHEN** animation page loads
- **THEN** system automatically starts animation after 2-second preview

#### Scenario: Pause/resume
- **WHEN** user clicks pause button during animation
- **THEN** system pauses at current frame and displays resume button

#### Scenario: Restart
- **WHEN** user clicks restart button
- **THEN** system resets animation to beginning and replays from start

#### Scenario: Skip forward
- **WHEN** user clicks next button
- **THEN** system jumps to next scene in sequence

### Requirement: Framer Motion implementation
The system SHALL use Framer Motion for smooth, performant animations.

#### Scenario: Stagger children
- **WHEN** scene displays multiple elements (items in shopping basket)
- **THEN** system uses staggerChildren to animate items sequentially with 0.1s delay

#### Scenario: Spring animations
- **WHEN** tax amounts appear
- **THEN** system uses spring animation with bounce effect for playful reveal

#### Scenario: Exit animations
- **WHEN** transitioning between scenes
- **THEN** system animates current scene out (fade + slide) before next scene enters

### Requirement: Responsive design
The system SHALL adapt animation to different screen sizes.

#### Scenario: Mobile layout
- **WHEN** viewing on mobile device (<768px)
- **THEN** system uses vertical layout with simplified scene illustrations

#### Scenario: Desktop layout
- **WHEN** viewing on desktop (≥768px)
- **THEN** system uses horizontal timeline with detailed scene illustrations

#### Scenario: Font scaling
- **WHEN** viewing on any device
- **THEN** system scales text sizes appropriately for readability

### Requirement: Shareability
The system SHALL generate unique shareable links for animations.

#### Scenario: Generate share link
- **WHEN** user clicks "Partager" button after animation completes
- **THEN** system generates unique anonymous link (e.g., /animations/abc123) without user identification

#### Scenario: Share via social media
- **WHEN** user clicks social share button (Twitter, LinkedIn, Facebook)
- **THEN** system opens share dialog with pre-filled text and animation link

#### Scenario: Embed code
- **WHEN** user clicks "Intégrer" button
- **THEN** system displays iframe embed code for embedding animation on external sites

### Requirement: Anonymization
The system SHALL ensure shared animations contain no personally identifiable information.

#### Scenario: Remove user identity
- **WHEN** generating shareable animation
- **THEN** system excludes user name, email, and profile photo from animation data

#### Scenario: Generalize data
- **WHEN** creating shared version
- **THEN** system rounds amounts to nearest euro and uses generic labels instead of specific enseigne names

#### Scenario: Privacy warning
- **WHEN** user clicks share button
- **THEN** system displays confirmation dialog: "Cette animation sera publique et anonymisée. Continuer ?"

### Requirement: Export formats
The system SHALL allow exporting animation as static media files.

#### Scenario: Export as PNG sequence
- **WHEN** user selects "Exporter PNG" option
- **THEN** system captures each frame as PNG and downloads as ZIP archive

#### Scenario: Export as video
- **WHEN** user selects "Exporter vidéo" option
- **THEN** system renders animation to WebM video file using canvas recording

#### Scenario: Export dimensions
- **WHEN** exporting animation
- **THEN** system offers dimension presets: Instagram Story (1080×1920), Instagram Post (1080×1080), Twitter (1200×675)

### Requirement: Animation customization
The system SHALL allow users to customize animation appearance.

#### Scenario: Theme selection
- **WHEN** user selects animation theme
- **THEN** system offers options: Moderne (default), Vintage, Minimaliste, Coloré

#### Scenario: Speed control
- **WHEN** user adjusts animation speed slider
- **THEN** system scales animation duration (0.5× slow, 1× normal, 1.5× fast)

#### Scenario: Background music
- **WHEN** user enables sound option
- **THEN** system plays subtle background music during animation (muted by default)

### Requirement: Performance optimization
The system SHALL ensure smooth animation performance across devices.

#### Scenario: Lazy loading
- **WHEN** animation page loads
- **THEN** system lazy loads scene illustrations to minimize initial bundle size

#### Scenario: GPU acceleration
- **WHEN** rendering animations
- **THEN** system uses CSS transforms and will-change for GPU-accelerated rendering

#### Scenario: Frame rate monitoring
- **WHEN** animation plays
- **THEN** system monitors frame rate and automatically reduces animation complexity if FPS drops below 30

### Requirement: Server-side generation
The system SHALL support server-side animation generation for sharing.

#### Scenario: Pre-render for share
- **WHEN** user generates shareable link
- **THEN** system renders animation server-side and caches result for fast loading

#### Scenario: Cache invalidation
- **WHEN** shared animation is accessed after 30 days
- **THEN** system regenerates animation with latest data and updates cache

### Requirement: Analytics tracking
The system SHALL track animation engagement for optimization.

#### Scenario: View tracking
- **WHEN** animation loads (own or shared)
- **THEN** system tracks: view count, completion rate, average watch time

#### Scenario: Share tracking
- **WHEN** user shares animation
- **THEN** system tracks: share count by platform, click-through rate from shared links

#### Scenario: Engagement heatmap
- **WHEN** analyzing animation performance
- **THEN** system identifies which scenes have highest replay rate and engagement

### Requirement: Accessibility
The system SHALL make animation accessible to users with disabilities.

#### Scenario: Keyboard navigation
- **WHEN** user navigates with keyboard only
- **THEN** system allows play/pause, skip, and restart via keyboard shortcuts

#### Scenario: Reduced motion
- **WHEN** user has prefers-reduced-motion enabled
- **THEN** system displays static slide-by-slide version instead of continuous animation

#### Scenario: Screen reader support
- **WHEN** screen reader is active
- **THEN** system announces scene changes and provides text description of visual content
