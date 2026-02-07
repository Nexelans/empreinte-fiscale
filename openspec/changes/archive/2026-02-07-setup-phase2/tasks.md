## 1. Project Setup & Dependencies

- [x] 1.1 Install npm dependencies: `pdf-parse`, `tesseract.js`, `d3-sankey`, `d3-hierarchy`, `d3-scale-chromatic`
- [x] 1.2 Create module directories: `src/modules/documents`, `src/modules/journal`, `src/modules/visualizations`, `src/modules/pedagogie`, `src/modules/decouverte`
- [x] 1.3 Add ProfilType model to `prisma/schema.prisma` for discovery mode
- [x] 1.4 Run `npx prisma migrate dev` to apply schema changes
- [x] 1.5 Update `.env.example` with any new environment variables needed

## 2. Document Upload Infrastructure

- [x] 2.1 Create `src/modules/documents/types.ts` with interfaces (DocumentType, ExtractedData, ParseResult)
- [x] 2.2 Create `src/modules/documents/patterns.ts` with regex patterns for bulletinPaie, avisImposition, taxeFonciere, relevéCAF
- [x] 2.3 Implement `src/modules/documents/service.ts` with `parseDocument()`, `extractData()`, `validateExtraction()` functions
- [ ] 2.4 Write unit tests in `src/modules/documents/__tests__/service.test.ts` for each document type pattern
- [x] 2.5 Create API route `src/app/api/documents/upload/route.ts` (POST handler with multipart/form-data)
- [x] 2.6 Create API route `src/app/api/documents/validate/route.ts` (POST handler for data injection)
- [x] 2.7 Implement file cleanup utility `src/modules/documents/cleanup.ts` with `deleteUploadedFile()` and temp folder monitoring

## 3. Document Upload UI Components

- [x] 3.1 Create `src/components/upload/UploadZone.tsx` with drag-and-drop + file input
- [x] 3.2 Create `src/components/upload/ConsentDialog.tsx` with RGPD consent message and accept/decline buttons
- [x] 3.3 Create `src/components/upload/DocumentPreview.tsx` to show PDF thumbnail and file info
- [x] 3.4 Create `src/components/upload/ValidationForm.tsx` to display extracted data with editable fields
- [x] 3.5 Create custom hook `src/modules/documents/hooks/useDocumentUpload.ts` for upload flow state management
- [x] 3.6 Create page `src/app/(app)/documents/page.tsx` with upload history table
- [x] 3.7 Add "📄 Importer un document" button to dashboard header

## 4. Ticket Scan Infrastructure

- [x] 4.1 Create `src/modules/tickets/types.ts` with TicketData, OCRResult interfaces
- [x] 4.2 Create `src/modules/tickets/ocr.ts` with tesseract.js worker initialization and `performOCR()` function
- [x] 4.3 Implement `src/modules/tickets/extraction.ts` with `extractTicketData()` using regex for enseigne, date, montantTTC, montantTVA
- [x] 4.4 Create API route `src/app/api/tickets/scan/route.ts` (POST handler for OCR fallback to user's AI)
- [ ] 4.5 Write integration tests in `src/modules/tickets/__tests__/ocr.test.ts` with sample ticket images

## 5. Ticket Scan UI Components

- [x] 5.1 Create `src/components/scan/ScanButton.tsx` with camera icon and mobile-optimized input
- [x] 5.2 Create `src/components/scan/CameraCapture.tsx` with input type="file" accept="image/*" capture="environment"
- [x] 5.3 Create `src/components/scan/OCRProgress.tsx` with progress bar and estimated time
- [x] 5.4 Create `src/components/scan/TicketValidation.tsx` form with editable fields and category dropdown
- [x] 5.5 Create custom hook `src/modules/tickets/hooks/useTicketScan.ts` for scan flow and OCR state
- [ ] 5.6 Add "📸 Scanner un ticket" button to dashboard and journal header
- [ ] 5.7 Create batch scan mode UI with "Scanner un autre ticket" button

## 6. Fiscal Journal Infrastructure

- [x] 6.1 Create `src/modules/journal/types.ts` with JournalEntryData, TaxBreakdown, SpendingCategory interfaces
- [x] 6.2 Create `src/modules/journal/taxRates.ts` with `getTaxRatesForCategory()` function using Référentiel
- [x] 6.3 Implement `src/modules/journal/service.ts` with CRUD functions and tax calculation logic
- [x] 6.4 Create API route `src/app/api/journal/route.ts` (GET for timeline, POST for manual entry)
- [x] 6.5 Create API route `src/app/api/journal/[id]/route.ts` (PUT for edit, DELETE for deletion)
- [x] 6.6 Implement aggregation functions in `src/modules/journal/aggregations.ts` for monthly/annual summaries
- [ ] 6.7 Write unit tests for tax calculation per category in `src/modules/journal/__tests__/taxRates.test.ts`

## 7. Fiscal Journal UI Components

- [x] 7.1 Create `src/components/journal/TimelineView.tsx` with grouped-by-day layout
- [x] 7.2 Create `src/components/journal/EntryCard.tsx` with enseigne, montant, category, and status badge
- [x] 7.3 Create `src/components/journal/AddEntryForm.tsx` for manual expense input
- [x] 7.4 Create `src/components/journal/EditEntryModal.tsx` for editing existing entries
- [x] 7.5 Create `src/components/journal/MonthlyChart.tsx` using Recharts BarChart for monthly aggregations
- [x] 7.6 Create `src/components/journal/DailyScoreImpact.tsx` showing daily tax amount and services benefit
- [x] 7.7 Create custom hook `src/modules/journal/hooks/useJournal.ts` for timeline state and filters
- [x] 7.8 Create page `src/app/(app)/journal/page.tsx` with timeline, filters, search, and add/scan buttons
- [x] 7.9 Implement category filter dropdown and search by enseigne functionality

## 8. Update Score Calculation with Journal Data

- [x] 8.1 Modify `src/modules/score/calculPaye.ts` to use real journal data for TVA when available instead of estimates
- [x] 8.2 Implement hybrid calculation logic: real data for logged days + pro-rated estimates for remaining days
- [x] 8.3 Add `useJournalData` flag to `calculerScoreFiscal()` function parameters
- [x] 8.4 Update dashboard to recalculate score when journal entries change
- [ ] 8.5 Write integration tests verifying score accuracy with journal data vs estimates

## 9. Data Visualizations - Sankey Diagram

- [x] 9.1 Create `src/components/visualizations/SankeyChart.tsx` using d3-sankey
- [x] 9.2 Implement data transformation from ScoreFiscal to Sankey nodes/links format
- [x] 9.3 Add responsive layout: vertical on mobile (< 768px), horizontal on desktop
- [x] 9.4 Implement click handlers on flows to open pedagogical panel
- [x] 9.5 Add color scheme: red for "ce que je paie", green for government spending categories
- [x] 9.6 Implement zoom and pan interactions
- [x] 9.7 Add export to PNG functionality using html-to-image or canvas API

## 10. Data Visualizations - Treemap

- [x] 10.1 Create `src/components/visualizations/TreemapChart.tsx` using d3-hierarchy treemap()
- [x] 10.2 Fetch budget data from Référentiel BUDGET_PLF for current millesime
- [x] 10.3 Implement hierarchy structure with parent "Budget" and children as budget functions
- [ ] 10.4 Add color scale using d3-scale-chromatic (sequential or categorical)
- [ ] 10.5 Implement hover tooltips showing "Fonction: Montant (% du total)"
- [ ] 10.6 Add click handlers to open detail panel with source PLF and breakdown
- [ ] 10.7 Make responsive for mobile: readable labels even on small rectangles

## 11. Data Visualizations - Animated Fiscal Journey

- [ ] 11.1 Create `src/components/visualizations/AnimatedDay.tsx` using Framer Motion
- [ ] 11.2 Define timeline sequence: morning coffee → commute → lunch → work → evening (5-6 steps)
- [ ] 11.3 Implement animation orchestration with staggerChildren and custom easing
- [ ] 11.4 Integrate user's real journal data if available, otherwise use profile-based estimates
- [ ] 11.5 Add pause/resume controls
- [ ] 11.6 Implement shareable link generation (anonymous, no PII)
- [ ] 11.7 Add export as PNG sequence or video (WebM) using canvas recording

## 12. Data Visualizations - Temporal Evolution

- [ ] 12.1 Create `src/components/visualizations/EvolutionChart.tsx` using Recharts LineChart
- [ ] 12.2 Implement data fetching for historical score data (monthly aggregations)
- [ ] 12.3 Display 3 lines: totalPaye (red), totalRecu (green), soldeNet (blue)
- [ ] 12.4 Add responsive chart with proper axis labels and legend
- [ ] 12.5 Implement hover tooltips showing exact values for each month
- [ ] 12.6 Add month navigation controls (prev/next year)

## 13. Pedagogical Layer - Glossary System

- [ ] 13.1 Create `src/data/glossaire.json` with ~50 fiscal terms and definitions
- [ ] 13.2 Create `src/components/pedagogie/GlossaryTerm.tsx` wrapper using shadcn/ui Tooltip
- [ ] 13.3 Implement lazy loading of definitions on hover (cache in Map)
- [ ] 13.4 Create API route `src/app/api/glossaire/[term]/route.ts` (GET handler)
- [ ] 13.5 Create page `src/app/(app)/glossaire/page.tsx` with searchable alphabetical list
- [ ] 13.6 Implement search functionality and anchor links to terms
- [ ] 13.7 Replace fiscal terms in existing pages with <GlossaryTerm> wrapper

## 14. Pedagogical Layer - Explanation Panels

- [ ] 14.1 Create `src/components/pedagogie/SourcePanel.tsx` using shadcn/ui Sheet (drawer)
- [ ] 14.2 Implement click handlers on dashboard breakdown items to open panel
- [ ] 14.3 Display formula, step-by-step calculation, and source in panel
- [ ] 14.4 Add status badge (🟢 VERIFIE / 🟡 DECLARE / 🔴 ESTIME) with explanation
- [ ] 14.5 Display Référentiel source with link and datePublication
- [ ] 14.6 Add "Améliorer la précision" CTA button linking to document upload
- [ ] 14.7 Implement responsive behavior: side drawer on desktop, bottom sheet on mobile
- [ ] 14.8 Add related terms section with links to other explanations

## 15. Pedagogical Layer - Status Badges Enhancement

- [ ] 15.1 Update `src/modules/score/scoreConfiance.ts` to return detailed breakdown by field
- [x] 15.2 Create `src/components/pedagogie/StatusBadge.tsx` component with 🟢🟡🔴 variants
- [ ] 15.3 Add status badges to all dashboard breakdown items
- [ ] 15.4 Display contextual CTAs based on status: "Importer document X pour vérifier" for ESTIME/DECLARE fields
- [ ] 15.5 Update ConfianceScore component to show breakdown by zone with CTAs

## 16. Discovery Mode - Seed Profile Types

- [ ] 16.1 Create `prisma/seed-profils-types.ts` script with 7 profile definitions (enseignant, médecin, artisan, cadre, retraité, étudiant, smicard)
- [ ] 16.2 Implement profile type calculation using existing `calculerScoreFiscal()` function
- [ ] 16.3 Insert ProfilType records with pre-calculated scores
- [ ] 16.4 Run seed script: `npx tsx prisma/seed-profils-types.ts`
- [ ] 16.5 Verify data in Prisma Studio
- [ ] 16.6 Create cron job script for weekly recalculation: `src/scripts/recalculate-profils-types.ts`

## 17. Discovery Mode - Public Pages

- [x] 17.1 Create page `src/app/(public)/decouverte/page.tsx` with profile type selector cards
- [ ] 17.2 Create page `src/app/(public)/decouverte/[profil]/page.tsx` dynamic route for each profile type
- [x] 17.3 Create `src/components/decouverte/ProfilTypeSelector.tsx` with 7 cards and icons
- [x] 17.4 Create `src/components/decouverte/DemoScore.tsx` displaying pre-calculated score for profile type
- [ ] 17.5 Implement comparison feature: allow selecting 2-3 profiles for side-by-side comparison
- [ ] 17.6 Create `src/components/decouverte/ComparisonTable.tsx` with rows for totalPaye, totalRecu, soldeNet, ratio
- [ ] 17.7 Add prominent CTA buttons throughout: "Créez votre compte pour VOTRE vrai score"
- [ ] 17.8 Display disclaimer banner: "⚠️ Ce profil est un exemple basé sur des moyennes"
- [ ] 17.9 Add "Calcul basé sur barèmes au : DATE" timestamp

## 18. Discovery Mode - Quiz & Engagement

- [ ] 18.1 Create `src/data/quiz-fiscal.json` with 10 sample quiz questions
- [ ] 18.2 Create `src/components/decouverte/QuizSection.tsx` displaying 3 questions on landing page
- [ ] 18.3 Implement question answer logic with correct answer reveal and brief explanation
- [ ] 18.4 Add CTA after quiz: "Créez votre compte pour accéder au quiz complet"
- [ ] 18.5 Create testimonials section with 3 beta user quotes (anonymized)
- [ ] 18.6 Implement shareable URLs for profile types (/decouverte/cadre, /decouverte/enseignant, etc.)

## 19. Discovery Mode - SEO & Performance

- [ ] 19.1 Add SEO meta tags to `src/app/(public)/decouverte/layout.tsx`: title, description, og:tags
- [ ] 19.2 Add specific meta tags for each profile type page with dynamic titles
- [ ] 19.3 Implement OpenGraph images for social sharing (1200x630px)
- [ ] 19.4 Optimize page load: lazy load visualizations, pre-fetch profile data
- [ ] 19.5 Add structured data (JSON-LD) for search engines
- [ ] 19.6 Test with Lighthouse: target score > 90 for Performance and SEO
- [ ] 19.7 Implement edge caching strategy for /decouverte pages (Vercel Edge Config or CDN)

## 20. Analytics & Monitoring

- [ ] 20.1 Choose analytics tool (PostHog, Plausible, or GA4) and add to project
- [ ] 20.2 Implement anonymous event tracking for discovery mode: profile_selected, cta_clicked
- [ ] 20.3 Add tracking for document uploads: upload_started, upload_success, upload_failed
- [ ] 20.4 Add tracking for ticket scans: scan_started, scan_success, scan_failed
- [ ] 20.5 Add tracking for journal entries: entry_created, entry_edited, entry_deleted
- [ ] 20.6 Ensure no PII is sent to analytics (no emails, no user IDs, use anonymous session IDs)
- [ ] 20.7 Add monitoring for /tmp/uploads folder size (alert if > 100MB)

## 21. Integration & Testing

- [ ] 21.1 Write E2E test for document upload flow using Playwright
- [ ] 21.2 Write E2E test for ticket scan flow using Playwright with sample images
- [ ] 21.3 Write E2E test for journal entry creation and editing
- [ ] 21.4 Write E2E test for discovery mode: profile selection → score display → CTA click
- [ ] 21.5 Test responsive behavior on mobile viewport (375px, 768px, 1024px, 1440px)
- [ ] 21.6 Test RGPD compliance: verify files are deleted after processing
- [ ] 21.7 Test accessibility with axe-core or similar tool (WCAG 2.1 AA compliance)
- [ ] 21.8 Run bundle size analysis with @next/bundle-analyzer and optimize if > 200KB for /dashboard

## 22. RGPD Compliance & Security

- [ ] 22.1 Invoke `/conformite-rgpd` skill for document upload feature review
- [ ] 22.2 Invoke `/conformite-rgpd` skill for ticket scan feature review
- [ ] 22.3 Invoke `/conformite-rgpd` skill for journal feature review
- [ ] 22.4 Implement consent checkboxes before each upload/scan action
- [ ] 22.5 Add "Mes données" page showing all stored data with download and delete options
- [ ] 22.6 Implement audit trail logging for sensitive operations (document upload, data deletion)
- [ ] 22.7 Review and update privacy policy with Phase 2 features
- [ ] 22.8 Test data portability: export all user data as JSON
- [ ] 22.9 Test right to erasure: delete user account and verify complete data removal

## 23. Deployment & Documentation

- [ ] 23.1 Update README.md with Phase 2 features and setup instructions
- [ ] 23.2 Create migration guide for existing users in docs
- [ ] 23.3 Deploy to staging environment and run smoke tests
- [ ] 23.4 Create feature flags for progressive rollout (document-upload, ticket-scan, journal, visualizations, discovery)
- [ ] 23.5 Deploy to production with feature flags disabled
- [ ] 23.6 Enable features progressively: discovery (public) → document-upload (alpha users) → ticket-scan → journal → visualizations → full rollout
- [ ] 23.7 Monitor error rates, performance metrics, and user feedback
- [ ] 23.8 Document known issues and workarounds in GitHub Issues

## 24. Post-Launch Iterations

- [ ] 24.1 Collect user feedback on document extraction accuracy
- [ ] 24.2 Improve regex patterns based on failed extractions (logged errors)
- [ ] 24.3 Optimize OCR performance on mobile devices based on analytics data
- [ ] 24.4 Add support for more document types if requested (avis taxe habitation, relevé bancaire, etc.)
- [ ] 24.5 Enhance visualizations based on user engagement metrics
- [ ] 24.6 A/B test different CTA placements in discovery mode for conversion optimization
- [ ] 24.7 Plan Phase 3 features based on Phase 2 learnings
