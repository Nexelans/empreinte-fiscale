# annual-wrapped Specification

## Purpose

Create an engaging annual fiscal summary inspired by Spotify Wrapped, allowing users to reflect on their fiscal year and share highlights on social media. The feature generates shareable animations and exports while maintaining privacy through anonymization controls.
## Requirements
### Requirement: Annual summary generation

The system SHALL automatically generate annual fiscal summary when user has 12 months of score history data.

#### Scenario: Generate wrapped summary
- **WHEN** user navigates to `/wrapped/2026` page
- **THEN** system compiles all score history for 2026 and generates animated summary

#### Scenario: Insufficient data warning
- **WHEN** user has fewer than 6 months of data for selected year
- **THEN** system displays warning: "Not enough data for a complete summary" and offers partial summary

#### Scenario: Year selection
- **WHEN** user views wrapped page without year parameter
- **THEN** system defaults to most recent complete year with data

### Requirement: Wrapped summary content

The system SHALL include key fiscal highlights and milestones in the annual summary.

#### Scenario: Total fiscal contribution
- **WHEN** wrapped summary is displayed
- **THEN** system shows total taxes paid for the year with visual impact (e.g., "Vous avez contribué 18 450€ à l'État")

#### Scenario: Monthly breakdown
- **WHEN** user views monthly view
- **THEN** system displays animated chart showing fiscal balance each month

#### Scenario: Top insights
- **WHEN** wrapped summary includes insights section
- **THEN** system highlights: highest tax month, biggest service benefit month, streak achievements, badges earned

#### Scenario: Evolution story
- **WHEN** wrapped displays evolution section
- **THEN** system shows trajectory from January to December with trend commentary

### Requirement: Shareable content generation

The system SHALL generate social media-ready exports of the wrapped summary.

#### Scenario: Generate share image
- **WHEN** user clicks "Share" button
- **THEN** system renders wrapped summary as PNG image (1080x1920 for stories, 1200x630 for posts)

#### Scenario: Animated export
- **WHEN** user selects "Export as video"
- **THEN** system generates 30-second MP4 video with animated highlights

#### Scenario: Multiple format options
- **WHEN** user clicks export dropdown
- **THEN** system offers formats: Instagram Story, Facebook Post, Twitter Card, LinkedIn Post, Custom Size

### Requirement: Anonymization controls

The system SHALL allow users to control what personal information appears in shared content.

#### Scenario: Anonymize before sharing
- **WHEN** user toggles "Anonymize" option before sharing
- **THEN** system removes name, rounds all amounts to nearest €100, and uses generic labels

#### Scenario: Custom privacy settings
- **WHEN** user accesses share settings
- **THEN** system allows selection of what to include: name, exact amounts, achievement badges, comparison data

#### Scenario: Default privacy mode
- **WHEN** user generates shareable content
- **THEN** system defaults to partially anonymized (name visible, amounts rounded to nearest €10)

### Requirement: Public wrapped sharing

The system SHALL generate public shareable links for wrapped summaries.

#### Scenario: Generate public link
- **WHEN** user clicks "Get shareable link"
- **THEN** system creates anonymous public URL (e.g., wrapped.empreintefiscale.fr/s/abc123) with selected privacy settings

#### Scenario: Public link expiration
- **WHEN** shareable link is created
- **THEN** system sets expiration date (default 30 days) and deletes content after expiration

#### Scenario: Revoke public link
- **WHEN** user clicks "Revoke link" on previously shared content
- **THEN** system immediately invalidates link and returns 404 for future access attempts

### Requirement: Wrapped animation sequence

The system SHALL present wrapped content as an engaging animated story.

#### Scenario: Auto-play animation
- **WHEN** user opens wrapped page
- **THEN** system automatically plays through story sequence with transitions

#### Scenario: Manual navigation
- **WHEN** user clicks or swipes during wrapped animation
- **THEN** system advances to next slide or allows going back to previous slides

#### Scenario: Pause and resume
- **WHEN** user pauses wrapped animation
- **THEN** system stops auto-advance and displays navigation controls

### Requirement: Historical wrapped archive

The system SHALL maintain an archive of previous years' wrapped summaries.

#### Scenario: Access previous wrapped
- **WHEN** user navigates to `/wrapped` without year
- **THEN** system displays gallery of all available wrapped summaries by year

#### Scenario: Compare years
- **WHEN** user selects "Compare to last year" option
- **THEN** system displays side-by-side comparison of key metrics

#### Scenario: Wrapped regeneration
- **WHEN** user clicks "Regenerate" on historical wrapped
- **THEN** system recreates wrapped using current data (accounting for retroactive corrections)

### Requirement: Wrapped notification timing

The system SHALL notify users when their wrapped summary becomes available.

#### Scenario: End of year notification
- **WHEN** calendar changes to January 2nd
- **THEN** system sends notification to users with 6+ months of data: "Your 2026 Wrapped is ready!"

#### Scenario: Mid-year wrapped option
- **WHEN** user requests mid-year wrapped (June 30)
- **THEN** system generates "Half-Year Review" with available data and appropriate labeling

### Requirement: Wrapped theming and customization

The system SHALL offer visual themes for wrapped content.

#### Scenario: Select wrapped theme
- **WHEN** user clicks theme selector
- **THEN** system offers themes: Classic (blue/green), Vibrant (multicolor), Minimalist (monochrome), Fiscal (red/green)

#### Scenario: Preview before sharing
- **WHEN** user changes theme or privacy settings
- **THEN** system displays live preview of how shared content will appear

#### Scenario: Save theme preference
- **WHEN** user selects a theme
- **THEN** system remembers preference for future wrapped summaries

