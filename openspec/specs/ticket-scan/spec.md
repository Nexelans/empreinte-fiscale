## ADDED Requirements

### Requirement: User can scan tickets via mobile camera

The system SHALL provide a mobile-optimized camera interface for scanning tickets and receipts directly from the device.

#### Scenario: Access camera on mobile
- **WHEN** user clicks "📸 Scanner un ticket" button on mobile device
- **THEN** system opens device camera with input type="file" accept="image/*" capture="environment"

#### Scenario: Access camera on desktop
- **WHEN** user clicks "📸 Scanner un ticket" on desktop
- **THEN** system allows file upload of image or PDF

### Requirement: User can upload ticket images or PDFs

The system SHALL accept image uploads (JPG, PNG, HEIC) and PDF files for ticket scanning.

#### Scenario: Upload valid image file
- **WHEN** user selects a JPG, PNG, or HEIC file (< 5MB)
- **THEN** system accepts the file for OCR processing

#### Scenario: Upload valid PDF receipt
- **WHEN** user selects a PDF receipt file (< 5MB)
- **THEN** system accepts the file for OCR processing

#### Scenario: Invalid file type rejected
- **WHEN** user attempts to upload unsupported file type
- **THEN** system displays error "Format non supporté. Utilisez JPG, PNG, ou PDF."

#### Scenario: File size limit exceeded
- **WHEN** user attempts to upload file > 5MB
- **THEN** system displays error "Fichier trop volumineux (max 5MB)"

### Requirement: System performs OCR on ticket images

The system SHALL use tesseract.js for client-side OCR processing of ticket images, with optional fallback to user's connected AI if configured.

#### Scenario: OCR with tesseract.js
- **WHEN** user uploads ticket image and has no AI configured
- **THEN** system processes image with tesseract.js OCR

#### Scenario: OCR with user's AI
- **WHEN** user uploads ticket image and has AI configured
- **THEN** system sends image to configured AI endpoint for better extraction

#### Scenario: OCR progress indicator
- **WHEN** OCR processing is in progress
- **THEN** system displays progress message "Lecture du ticket en cours..."

### Requirement: System extracts structured data from tickets

The system SHALL extract enseigne (merchant), date, montant TTC (total amount), and TVA breakdown from ticket OCR text.

#### Scenario: Extract complete ticket data
- **WHEN** OCR successfully reads a clear ticket
- **THEN** system extracts enseigne, date, montantTTC, montantTVA, and line items if readable

#### Scenario: Extract partial ticket data
- **WHEN** OCR reads a degraded or partial ticket
- **THEN** system extracts available fields and marks others as "Non détecté"

#### Scenario: No data extracted from image
- **WHEN** OCR cannot read any text from image
- **THEN** system displays error "Impossible de lire ce ticket. Veuillez prendre une photo plus nette."

### Requirement: User validates extracted ticket data

The system SHALL present extracted ticket data to the user for validation and correction before creating a JournalEntry.

#### Scenario: Display validation screen
- **WHEN** OCR extraction completes
- **THEN** system displays validation form with enseigne, date, montantTTC, détail lignes (if available)

#### Scenario: User corrects extracted data
- **WHEN** user modifies extracted fields in validation form
- **THEN** system accepts the corrected values

#### Scenario: User adds missing category
- **WHEN** user selects a spending category (alimentation, transport, loisirs, etc.)
- **THEN** system associates the category with the ticket

#### Scenario: User confirms ticket data
- **WHEN** user clicks "Valider" on validation screen
- **THEN** system creates JournalEntry with status="VERIFIE"

#### Scenario: User rejects ticket scan
- **WHEN** user clicks "Annuler" on validation screen
- **THEN** system discards extracted data and deletes image

### Requirement: System calculates taxes from ticket data

The system SHALL calculate TVA and other applicable taxes from the validated ticket amount and category.

#### Scenario: Calculate TVA from montantTTC
- **WHEN** user validates a ticket with montantTTC and category
- **THEN** system calculates montantTVA using appropriate tax rate from Référentiel based on category

#### Scenario: Use extracted TVA if available
- **WHEN** ticket extraction includes montantTVA
- **THEN** system uses extracted TVA value instead of calculating

### Requirement: System creates JournalEntry from validated ticket

The system SHALL create a JournalEntry record with the validated ticket data and calculated taxes.

#### Scenario: Create journal entry with all data
- **WHEN** user validates complete ticket data
- **THEN** system creates JournalEntry with date, enseigne, montantTTC, montantTVA, categorie, statut="VERIFIE"

#### Scenario: Create journal entry with partial data
- **WHEN** user validates ticket with missing enseigne
- **THEN** system creates JournalEntry with enseigne=null and other available fields

### Requirement: System deletes original ticket image after processing

The system SHALL delete the uploaded ticket image immediately after JournalEntry creation, ensuring no image storage.

#### Scenario: Delete image after validation
- **WHEN** user confirms or rejects extracted ticket data
- **THEN** system deletes the original image file from server

### Requirement: User can scan multiple tickets in batch mode

The system SHALL allow users to scan multiple tickets consecutively without leaving the scan interface.

#### Scenario: Enable batch scanning
- **WHEN** user is on ticket scan screen
- **THEN** system displays "Scanner un autre ticket" button after each validation

#### Scenario: Exit batch mode
- **WHEN** user clicks "Terminer" or navigates away
- **THEN** system returns to journal fiscal page

### Requirement: System shows scan history with status

The system SHALL display recent ticket scans with their processing status (en attente, validé, erreur).

#### Scenario: Display recent scans
- **WHEN** user views journal fiscal page
- **THEN** system displays section "Scans récents" with last 5 scans and their status

#### Scenario: Resume incomplete scan
- **WHEN** user clicks on a scan with status="en attente"
- **THEN** system opens validation screen with extracted data

### Requirement: Scan button accessible from dashboard and journal

The system SHALL provide "📸 Scanner un ticket" button on both dashboard and journal fiscal pages.

#### Scenario: Scan from dashboard
- **WHEN** user clicks scan button on dashboard
- **THEN** system opens ticket scan interface

#### Scenario: Scan from journal
- **WHEN** user clicks scan button on journal fiscal page
- **THEN** system opens ticket scan interface

### Requirement: System handles OCR errors gracefully

The system SHALL display clear error messages when OCR processing fails.

#### Scenario: OCR timeout
- **WHEN** OCR processing exceeds 30 seconds
- **THEN** system displays error "Le traitement a pris trop de temps. Veuillez réessayer."

#### Scenario: AI endpoint unavailable
- **WHEN** user has AI configured but endpoint is unreachable
- **THEN** system falls back to tesseract.js with warning "IA temporairement indisponible, traitement standard utilisé."
