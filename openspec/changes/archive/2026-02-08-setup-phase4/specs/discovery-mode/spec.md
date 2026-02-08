## Purpose

Expand discovery mode with international tax comparison feature and additional profile types to showcase the application's capabilities to non-registered users.

## ADDED Requirements

### Requirement: International tax comparison

The system SHALL allow discovery mode users to compare French fiscal system with other countries.

#### Scenario: Select country for comparison
- **WHEN** user clicks "Compare with another country"
- **THEN** system displays country selector with: Germany, Sweden, UK, USA, Canada, Spain, Italy, Belgium

#### Scenario: Display international comparison
- **WHEN** user selects country
- **THEN** system shows side-by-side comparison: tax rates, social contributions, public services, net fiscal burden

#### Scenario: Simplified international data
- **WHEN** international comparison is displayed
- **THEN** system shows aggregated data with disclaimer: "Simplified comparison based on average rates. Actual taxation varies by region and situation."

#### Scenario: Country tax rate data source
- **WHEN** system displays international comparison
- **THEN** each data point includes source link to official statistics (OECD, national tax agencies)

### Requirement: Expanded profile types

The system SHALL provide additional pre-configured profiles to showcase diverse fiscal situations.

#### Scenario: New profile types available
- **WHEN** user accesses discovery mode profile selector
- **THEN** system displays expanded list: Intern, Apprentice, Single parent, Couple with 3+ children, High-income executive, Entrepreneur

#### Scenario: Profile type descriptions
- **WHEN** user hovers over profile type
- **THEN** system displays: salary range, family situation, estimated tax burden, typical benefits received

#### Scenario: Profile customization in discovery
- **WHEN** user selects profile type
- **THEN** system allows minor adjustments (salary ±20%, add/remove 1 child) without requiring account

### Requirement: Discovery mode engagement metrics

The system SHALL track which discovery features drive user registration.

#### Scenario: Track feature interaction
- **WHEN** discovery user interacts with any feature
- **THEN** system logs: feature used, profile type, time spent, conversion to registration

#### Scenario: A/B test international comparison
- **WHEN** system serves discovery mode
- **THEN** randomly show/hide international comparison to measure impact on registration rate

### Requirement: Discovery mode sharing

The system SHALL allow users to share discovery mode results.

#### Scenario: Generate shareable link
- **WHEN** discovery user clicks "Share this comparison"
- **THEN** system generates public URL with profile configuration embedded

#### Scenario: Social media preview
- **WHEN** shareable link is posted on social media
- **THEN** system provides Open Graph tags with summary visualization and CTA

### Requirement: Conversion prompts in discovery

The system SHALL strategically prompt discovery users to create accounts.

#### Scenario: Feature limitation prompt
- **WHEN** discovery user attempts to save result or view detailed breakdown
- **THEN** system displays: "Create free account to save your calculations and get personalized insights"

#### Scenario: International comparison CTA
- **WHEN** user views international comparison
- **THEN** system shows: "Want to see YOUR real score in each country? Create account to import your data"
