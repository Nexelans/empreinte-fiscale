## Purpose

Extend document upload capability with AI-enhanced OCR for improved accuracy when users have configured their AI provider with a vision-capable model.

## ADDED Requirements

### Requirement: AI-enhanced OCR option

The system SHALL offer AI-powered OCR as an alternative to standard OCR when user has configured vision-capable AI model.

#### Scenario: Display AI OCR option
- **WHEN** user uploads document and has vision-capable AI model configured
- **THEN** system displays toggle: "Use AI for better accuracy" with estimated cost indicator

#### Scenario: Process document with AI OCR
- **WHEN** user enables AI OCR and confirms
- **THEN** system sends document image to configured AI vision model with structured extraction prompt

#### Scenario: AI OCR result validation
- **WHEN** AI returns extracted data
- **THEN** system validates structure matches expected document type and presents for user confirmation

#### Scenario: Fallback to standard OCR
- **WHEN** AI OCR fails or returns error
- **THEN** system automatically falls back to tesseract.js and notifies user of fallback

### Requirement: AI OCR cost transparency

The system SHALL provide clear information about AI usage costs before processing.

#### Scenario: Display cost estimate
- **WHEN** user hovers over AI OCR option
- **THEN** system displays estimated cost based on document size and configured AI provider rates

#### Scenario: Confirm cost before processing
- **WHEN** user enables AI OCR for document over 5 pages
- **THEN** system requires explicit confirmation: "This may cost approximately €X.XX with your AI provider. Continue?"

#### Scenario: Track cumulative AI OCR usage
- **WHEN** user views AI settings
- **THEN** system displays total OCR requests this month and estimated monthly cost

### Requirement: AI OCR accuracy comparison

The system SHALL allow users to compare AI vs standard OCR results.

#### Scenario: Side-by-side comparison mode
- **WHEN** user enables "Compare modes" before upload
- **THEN** system processes document with both standard and AI OCR and displays results side-by-side

#### Scenario: Choose preferred result
- **WHEN** comparison shows both results
- **THEN** system allows user to select which extraction to use or manually edit combined result

### Requirement: Privacy warning for AI OCR

The system SHALL warn users about sending document images to third-party AI services.

#### Scenario: First-time AI OCR warning
- **WHEN** user enables AI OCR for first time
- **THEN** system displays explicit warning: "Document images will be sent to [Provider]. This may include sensitive fiscal information. Continue?"

#### Scenario: Remember privacy preference
- **WHEN** user checks "I understand and accept" on AI OCR warning
- **THEN** system remembers preference for current session but requires re-confirmation on next session
