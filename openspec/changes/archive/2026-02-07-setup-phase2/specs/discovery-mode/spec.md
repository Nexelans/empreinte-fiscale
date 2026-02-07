## ADDED Requirements

### Requirement: Public pages accessible without authentication

The system SHALL provide discovery mode pages at /decouverte that do not require user authentication.

#### Scenario: Access discovery mode without login
- **WHEN** user navigates to /decouverte
- **THEN** system displays discovery landing page without requiring authentication

#### Scenario: Redirect to signup from discovery
- **WHEN** user clicks "Créez votre compte pour VOTRE vrai score"
- **THEN** system redirects to /auth/register

### Requirement: System provides predefined profile types

The system SHALL offer 7 predefined profile types representing common French fiscal situations.

#### Scenario: Display profile type selector
- **WHEN** user views discovery landing page
- **THEN** system displays cards for: Enseignant, Médecin, Artisan, Cadre, Retraité, Étudiant, Smicard

#### Scenario: Each profile has representative icon
- **WHEN** profile selector renders
- **THEN** each profile displays appropriate emoji: 👨‍🏫 Enseignant, 👨‍⚕️ Médecin, 🔨 Artisan, 💼 Cadre, 👴 Retraité, 🎓 Étudiant, 💪 Smicard

### Requirement: Each profile type has realistic data

The system SHALL populate each profile type with representative fiscal data based on INSEE statistics.

#### Scenario: Enseignant profile
- **WHEN** user selects "Enseignant"
- **THEN** system loads profile with: salaireBrut=35000€, nombreEnfants=2, properietaire=true, commune="Lyon"

#### Scenario: Médecin profile
- **WHEN** user selects "Médecin"
- **THEN** system loads profile with: salaireBrut=85000€, nombreEnfants=2, properietaire=true, revenusCapitaux=8000€

#### Scenario: Artisan profile
- **WHEN** user selects "Artisan"
- **THEN** system loads profile with: salaireBrut=28000€, nombreEnfants=1, properietaire=false, typeContrat="independant"

#### Scenario: Cadre profile
- **WHEN** user selects "Cadre"
- **THEN** system loads profile with: salaireBrut=65000€, nombreEnfants=1, properietaire=true, patrimoineIFI=900000€

#### Scenario: Retraité profile
- **WHEN** user selects "Retraité"
- **THEN** system loads profile with: salaireBrut=0, autresRevenus=24000€, nombreEnfants=0, age=68, properietaire=true

#### Scenario: Étudiant profile
- **WHEN** user selects "Étudiant"
- **THEN** system loads profile with: salaireBrut=6000€, nombreEnfants=0, age=21, properietaire=false, aides={bourses: true}

#### Scenario: Smicard profile
- **WHEN** user selects "Smicard"
- **THEN** system loads profile with: salaireBrut=21000€, nombreEnfants=1, properietaire=false, aides={apl: true}

### Requirement: System calculates score for profile types

The system SHALL compute full ScoreFiscal for each selected profile type using the same calculation engine.

#### Scenario: Calculate score for selected profile
- **WHEN** user selects a profile type
- **THEN** system calls calculerScoreFiscal() with the profile's data

#### Scenario: Display score on profile page
- **WHEN** score calculation completes
- **THEN** system displays dashboard with totalPaye, totalRecu, soldeNet for that profile type

#### Scenario: All visualizations available
- **WHEN** user views a profile type score
- **THEN** system displays same visualizations as authenticated users (Sankey, breakdown charts, confidence score)

### Requirement: Profile type pages are shareable

The system SHALL generate unique URLs for each profile type that can be shared.

#### Scenario: Shareable URL structure
- **WHEN** user selects "Cadre" profile
- **THEN** URL changes to /decouverte/cadre

#### Scenario: Direct navigation to profile
- **WHEN** user navigates directly to /decouverte/enseignant
- **THEN** system loads and displays Enseignant profile score

#### Scenario: Share profile link
- **WHEN** user clicks "Partager ce profil"
- **THEN** system copies /decouverte/[profile-type] URL to clipboard

### Requirement: Discovery mode shows CTA for registration

The system SHALL display prominent call-to-action throughout discovery mode to encourage account creation.

#### Scenario: CTA on landing page
- **WHEN** user views /decouverte landing
- **THEN** system displays "Créez votre compte pour calculer VOTRE score personnalisé" button

#### Scenario: CTA on profile score page
- **WHEN** user views any profile type score
- **THEN** system displays floating CTA "Ce n'est qu'un exemple. Créez votre compte pour votre vrai score !"

#### Scenario: Click CTA
- **WHEN** user clicks any CTA button
- **THEN** system redirects to /auth/register

### Requirement: Discovery mode explains limitations

The system SHALL clearly indicate that profile types are examples based on averages, not personalized calculations.

#### Scenario: Disclaimer on profile page
- **WHEN** user views a profile type score
- **THEN** system displays banner "⚠️ Ce profil est un exemple basé sur des moyennes. Votre situation personnelle peut différer significativement."

#### Scenario: Explain data sources
- **WHEN** user views profile type
- **THEN** system displays "Données basées sur : INSEE, PLF 2026, DEPP 2025, URSSAF 2026"

### Requirement: System provides profile comparison feature

The system SHALL allow users to select and compare 2-3 profile types side-by-side.

#### Scenario: Select profiles for comparison
- **WHEN** user clicks "Comparer les profils" and selects "Enseignant" and "Cadre"
- **THEN** system displays side-by-side comparison of their scores

#### Scenario: Comparison table
- **WHEN** comparison view renders
- **THEN** system displays table with rows: Ce que je paie, Ce que je reçois, Solde net, Ratio

#### Scenario: Limit to 3 profiles
- **WHEN** user attempts to select 4th profile for comparison
- **THEN** system displays message "Maximum 3 profils en comparaison"

### Requirement: Discovery mode includes quiz teaser

The system SHALL provide a simple fiscal quiz in discovery mode to engage visitors.

#### Scenario: Display quiz section
- **WHEN** user scrolls on /decouverte landing page
- **THEN** system displays "Quiz fiscal : Testez vos connaissances" section with 3 sample questions

#### Scenario: Quiz questions
- **WHEN** user views quiz
- **THEN** system displays questions like "Combien un Français moyen paie-t-il de TVA par an ?" with multiple choice answers

#### Scenario: Answer quiz question
- **WHEN** user selects an answer
- **THEN** system shows correct answer with brief explanation and encourages signup for full quiz

### Requirement: Discovery pages are SEO-optimized

The system SHALL provide proper meta tags and structured data for discovery pages to improve search visibility.

#### Scenario: Landing page meta tags
- **WHEN** /decouverte page renders
- **THEN** HTML includes meta description, og:tags, and keywords for SEO

#### Scenario: Profile type meta tags
- **WHEN** /decouverte/cadre page renders
- **THEN** HTML includes specific meta title "Score fiscal d'un Cadre type en France - Empreinte Fiscale"

### Requirement: Discovery mode is fully responsive

The system SHALL ensure all discovery pages work perfectly on mobile, tablet, and desktop.

#### Scenario: Profile selector on mobile
- **WHEN** user views /decouverte on mobile (< 768px)
- **THEN** profile cards stack vertically with full width

#### Scenario: Score visualization on mobile
- **WHEN** user views profile score on mobile
- **THEN** all charts and visualizations adapt to screen size

### Requirement: System tracks analytics for discovery mode

The system SHALL track user interactions in discovery mode for conversion optimization (without storing PII).

#### Scenario: Track profile selections
- **WHEN** user selects a profile type
- **THEN** system logs anonymous event "profile_selected: cadre" (no user identification)

#### Scenario: Track CTA clicks
- **WHEN** user clicks "Créez votre compte" CTA
- **THEN** system logs anonymous event "discovery_cta_clicked"

#### Scenario: No PII tracking
- **WHEN** analytics events are logged
- **THEN** system ensures no IP addresses, emails, or personal data are stored

### Requirement: Discovery mode loads fast

The system SHALL optimize discovery pages for fast initial load to reduce bounce rate.

#### Scenario: Landing page loads in < 2s
- **WHEN** user navigates to /decouverte
- **THEN** page fully renders within 2 seconds on 3G connection

#### Scenario: Profile scores use cached calculations
- **WHEN** user selects a profile type
- **THEN** system uses pre-calculated scores (not real-time calculation) for instant display

### Requirement: Profiles update with Référentiel

The system SHALL recalculate profile type scores when Référentiel data is updated to ensure accuracy.

#### Scenario: Recalculate on barème update
- **WHEN** admin updates Référentiel with new millesime
- **THEN** system triggers recalculation of all 7 profile type scores

#### Scenario: Display last updated date
- **WHEN** user views a profile type score
- **THEN** system displays "Calcul basé sur les barèmes au : 27/09/2025"

### Requirement: Discovery mode includes testimonials

The system SHALL display social proof elements to build trust with visitors.

#### Scenario: Display testimonial section
- **WHEN** user scrolls on /decouverte landing
- **THEN** system displays section with 3 testimonials from beta users (anonymized)

#### Scenario: Testimonials are authentic
- **WHEN** testimonials render
- **THEN** system displays real feedback without fabrication, clearly marked as beta user feedback
