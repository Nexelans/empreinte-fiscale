## ADDED Requirements

### Requirement: User can upload fiscal documents

The system SHALL accept PDF uploads of fiscal documents (bulletins de paie, avis d'imposition, avis de taxe foncière, relevés CAF) for automated data extraction.

#### Scenario: Successful PDF upload
- **WHEN** user selects a valid PDF file (< 10MB)
- **THEN** system accepts the file and displays upload progress

#### Scenario: Invalid file type rejected
- **WHEN** user attempts to upload a non-PDF file
- **THEN** system displays error "Format non supporté. Seuls les PDF sont acceptés."

#### Scenario: File size limit exceeded
- **WHEN** user attempts to upload a PDF > 10MB
- **THEN** system displays error "Fichier trop volumineux (max 10MB)"

### Requirement: User must consent before document processing

The system SHALL display an explicit RGPD consent screen before processing any uploaded document.

#### Scenario: Consent screen displayed
- **WHEN** user uploads a document
- **THEN** system displays consent message "Vos données seront extraites puis le document sera immédiatement supprimé. Les données extraites seront stockées dans votre profil. Vous pouvez les supprimer à tout moment."

#### Scenario: User declines consent
- **WHEN** user clicks "Refuser" on consent screen
- **THEN** system cancels upload and deletes the file without processing

#### Scenario: User accepts consent
- **WHEN** user clicks "Accepter" on consent screen
- **THEN** system proceeds to parsing and extraction

### Requirement: System extracts structured data from fiscal documents

The system SHALL parse uploaded PDF documents and extract relevant fiscal data using pdf-parse and OCR when necessary.

#### Scenario: Extract data from bulletin de paie
- **WHEN** system parses a bulletin de paie PDF
- **THEN** system extracts salaireBrut, salaireNet, CSG, cotisations salariales, cotisations patronales

#### Scenario: Extract data from avis d'imposition
- **WHEN** system parses an avis d'imposition PDF
- **THEN** system extracts revenuNetImposable, impotRevenu, nombreParts, revenusFonciers, revenusCapitaux

#### Scenario: Extract data from avis de taxe foncière
- **WHEN** system parses an avis de taxe foncière PDF
- **THEN** system extracts montant taxeFonciere, valeurLocative, commune

#### Scenario: Extract data from relevé CAF
- **WHEN** system parses a relevé CAF PDF
- **THEN** system extracts allocations, APL, autres aides

#### Scenario: OCR fallback for scanned documents
- **WHEN** PDF contains only images (scanned document)
- **THEN** system applies OCR before extraction

### Requirement: User validates extracted data before injection

The system SHALL present extracted data to the user for validation before injecting it into their profile.

#### Scenario: Display extracted data for validation
- **WHEN** extraction completes successfully
- **THEN** system displays validation screen with "Nous avons détecté : Salaire brut = 3 450€/mois, CSG = 312€. Est-ce correct ?"

#### Scenario: User corrects extracted data
- **WHEN** user modifies a detected value in validation screen
- **THEN** system accepts the corrected value

#### Scenario: User confirms extracted data
- **WHEN** user clicks "Confirmer" on validation screen
- **THEN** system injects data into ProfilFiscal with status "VERIFIE"

#### Scenario: User rejects all extracted data
- **WHEN** user clicks "Annuler" on validation screen
- **THEN** system discards extracted data and deletes document

### Requirement: System deletes original document immediately after extraction

The system SHALL delete the uploaded PDF file immediately after data extraction, ensuring RGPD compliance by not storing original documents.

#### Scenario: Document deleted after validation
- **WHEN** user confirms or rejects extracted data
- **THEN** system deletes the original PDF file from server storage

#### Scenario: Document deleted after extraction failure
- **WHEN** extraction fails with an error
- **THEN** system deletes the original PDF file without persisting any data

### Requirement: System tracks document uploads without storing content

The system SHALL record metadata about document uploads in the DocumentUpload table without storing file content.

#### Scenario: Create upload record on success
- **WHEN** user validates extracted data
- **THEN** system creates DocumentUpload record with type, uploadedAt, status="VALIDATED", extractedData (structured JSON only)

#### Scenario: Create upload record on failure
- **WHEN** extraction fails
- **THEN** system creates DocumentUpload record with status="FAILED" and error message

### Requirement: Extracted data updates ProfilFiscal with verified status

The system SHALL inject validated data into the user's ProfilFiscal and mark fields as "VERIFIE" in statusData.

#### Scenario: Update salaire fields with verified status
- **WHEN** user validates data from bulletin de paie
- **THEN** system updates ProfilFiscal.salaireBrut, ProfilFiscal.salaireNet and sets statusData.salaireBrut="VERIFIE", statusData.salaireNet="VERIFIE"

#### Scenario: Verified data overrides estimated data
- **WHEN** user validates data that conflicts with existing estimated data
- **THEN** system replaces estimated values with verified values

### Requirement: User can view upload history

The system SHALL display a history of all document uploads with their status and extracted data summary.

#### Scenario: Display upload history page
- **WHEN** user navigates to /documents
- **THEN** system displays list of DocumentUpload records sorted by uploadedAt DESC

#### Scenario: View extracted data from past upload
- **WHEN** user clicks on an upload record
- **THEN** system displays the extractedData JSON in readable format

### Requirement: System handles extraction errors gracefully

The system SHALL display clear error messages when document parsing or extraction fails.

#### Scenario: PDF parsing fails
- **WHEN** PDF file is corrupted or unreadable
- **THEN** system displays error "Impossible de lire ce document. Veuillez réessayer avec un autre fichier."

#### Scenario: No data extracted
- **WHEN** PDF is valid but contains no recognizable fiscal data
- **THEN** system displays error "Aucune donnée fiscale détectée dans ce document."

#### Scenario: Partial extraction
- **WHEN** only some fields can be extracted
- **THEN** system displays validation screen with extracted fields and marks missing fields as "Non détecté"
