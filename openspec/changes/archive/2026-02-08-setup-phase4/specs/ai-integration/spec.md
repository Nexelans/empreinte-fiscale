## Purpose

Enable users to connect their own AI providers (OpenAI, Anthropic, Mistral, Google, custom) for contextual fiscal analysis and enhanced document parsing. The system acts as a secure proxy, never storing user AI credentials persistently, and providing clear warnings about data transmission.

## ADDED Requirements

### Requirement: AI provider configuration

The system SHALL allow users to configure their preferred AI provider with secure credential storage.

#### Scenario: Select AI provider
- **WHEN** user navigates to AI settings
- **THEN** system displays provider options: OpenAI, Anthropic, Mistral, Google AI, Custom Endpoint

#### Scenario: Enter API credentials
- **WHEN** user enters API key for selected provider
- **THEN** system encrypts key with AES-256 before storage and tests connection

#### Scenario: Test connection
- **WHEN** user clicks "Test connection" after entering credentials
- **THEN** system makes test API call and displays success/error message with provider response time

#### Scenario: Custom endpoint configuration
- **WHEN** user selects "Custom Endpoint"
- **THEN** system allows entry of base URL, authentication header, and model name

### Requirement: Model selection

The system SHALL fetch and display available models dynamically from the configured provider.

#### Scenario: Load available models
- **WHEN** user has configured AI provider
- **THEN** system fetches model list via provider API and displays in dropdown

#### Scenario: Model capabilities display
- **WHEN** user hovers over model name
- **THEN** system displays model capabilities: vision support, context window size, cost estimate

#### Scenario: Save model preference
- **WHEN** user selects a model
- **THEN** system saves selection and uses it for all AI-powered features

### Requirement: Contextual AI analysis

The system SHALL provide AI-powered analysis on fiscal data with full context injection.

#### Scenario: Analyze current score
- **WHEN** user clicks "💬 Analyze with AI" on score dashboard
- **THEN** system opens chat interface with fiscal context pre-loaded

#### Scenario: Context injection
- **WHEN** AI analysis request is made
- **THEN** system includes in prompt: full score breakdown, profile data, score confidence, trend history

#### Scenario: Ask follow-up questions
- **WHEN** user sends message in AI chat
- **THEN** system maintains conversation context and fiscal data context across messages

#### Scenario: Save AI conversations
- **WHEN** AI conversation is ongoing
- **THEN** system optionally saves conversation history (user preference) for later reference

### Requirement: AI-enhanced document parsing

The system SHALL use AI vision models to improve OCR accuracy for document uploads.

#### Scenario: Enable AI OCR
- **WHEN** user uploads document and has vision-capable model configured
- **THEN** system displays option "Use AI for better accuracy" alongside standard OCR

#### Scenario: AI OCR processing
- **WHEN** user selects AI-enhanced OCR
- **THEN** system sends document image to vision model with extraction instructions and returns structured data

#### Scenario: Fallback to standard OCR
- **WHEN** AI OCR fails or user has no vision-capable model
- **THEN** system automatically falls back to tesseract.js with notification

#### Scenario: Cost warning for AI OCR
- **WHEN** user enables AI OCR for first time
- **THEN** system displays warning about API costs and requires explicit confirmation

### Requirement: Data transmission warnings

The system SHALL provide clear, prominent warnings about sending data to third-party AI services.

#### Scenario: First-time AI usage warning
- **WHEN** user attempts to use AI feature for first time
- **THEN** system displays modal with explicit warning: "Your fiscal data will be sent to [Provider]. They may store this data. Continue?"

#### Scenario: Per-session confirmation
- **WHEN** user starts new session and clicks AI feature
- **THEN** system requires re-confirmation before sending any data

#### Scenario: Disable per-session warnings
- **WHEN** user checks "Don't ask again for this session"
- **THEN** system skips warnings until session ends (browser close)

### Requirement: Secure API proxy

The system SHALL proxy all AI requests through backend to prevent credential exposure.

#### Scenario: Client-side request initiation
- **WHEN** user triggers AI feature from frontend
- **THEN** system sends request to backend `/api/ai/chat` endpoint without credentials

#### Scenario: Backend credential retrieval
- **WHEN** backend receives AI request
- **THEN** system decrypts stored credentials, makes provider API call, and returns response

#### Scenario: Credential never exposed to frontend
- **WHEN** system processes AI requests
- **THEN** API keys never appear in browser network traffic, local storage, or cookies

### Requirement: AI feature opt-out

The system SHALL remain fully functional without AI configuration.

#### Scenario: App without AI configuration
- **WHEN** user has not configured AI provider
- **THEN** system shows all features with AI buttons displaying "Configure AI to enable this feature"

#### Scenario: Disable AI features
- **WHEN** user deletes AI configuration
- **THEN** system immediately disables all AI-powered features and purges encrypted credentials

#### Scenario: Standard OCR always available
- **WHEN** user uploads document
- **THEN** system always offers standard tesseract.js OCR regardless of AI configuration

### Requirement: AI usage analytics

The system SHALL track AI usage for user transparency and cost awareness.

#### Scenario: Display usage statistics
- **WHEN** user views AI settings
- **THEN** system displays: total requests this month, estimated cost (if available), most used features

#### Scenario: Token usage tracking
- **WHEN** AI request completes
- **THEN** system logs tokens used (input + output) if provider returns usage data

#### Scenario: Usage limit warnings
- **WHEN** user exceeds 100 AI requests in 24 hours
- **THEN** system displays warning about potential rate limits and costs

### Requirement: RGPD compliance for AI features

The system SHALL ensure AI integration respects data protection requirements.

#### Scenario: AI configuration in data export
- **WHEN** user exports personal data
- **THEN** export includes: configured provider, model name, usage statistics (no API keys)

#### Scenario: AI conversation data export
- **WHEN** user has saved AI conversations
- **THEN** data export includes full conversation history

#### Scenario: Account deletion with AI config
- **WHEN** user deletes account
- **THEN** system purges encrypted AI credentials, conversation history, and usage logs

#### Scenario: Explicit consent requirement
- **WHEN** user enables AI features
- **THEN** system requires explicit consent checkbox: "I understand my data will be sent to third-party AI services"
