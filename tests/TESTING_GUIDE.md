# Phase 3 Testing Guide

This document provides comprehensive testing scenarios for all Phase 3 features.

## Automated Tests (Vitest)

### ✅ Task 32.1: Gamification Event Emission
**File:** `tests/gamification/events.test.ts`

**Test Coverage:**
- Event emission and handler execution
- Multiple handlers for same event
- Error handling in handlers
- Event payload validation
- Badge earning flow

**Run:** `npm test tests/gamification/events.test.ts`

### ✅ Task 32.2: Streak Tracking Logic
**File:** `tests/gamification/streak.test.ts`

**Test Coverage:**
- Consecutive day tracking
- Streak reset logic
- Grace period activation and expiration
- Freeze token usage and awarding
- Milestone detection
- XP level calculation

**Run:** `npm test tests/gamification/streak.test.ts`

---

## Manual & Integration Tests

### Task 32.3: Simulation Engine Testing

**Test Scenarios:**

#### Scenario 1: "Si j'ai un enfant"
1. Navigate to `/simulations`
2. Select "Avoir un enfant" scenario
3. Fill in current profile (if not done)
4. Run simulation
5. **Expected Results:**
   - Increased allocations familiales
   - Decreased impôt sur le revenu (additional part fiscale)
   - Increased education services received
   - Clear before/after comparison
   - Detailed breakdown of changes

#### Scenario 2: "Si je déménage à [commune]"
1. Select "Déménager" scenario
2. Enter new commune (test with different tax rates)
3. Run simulation
4. **Expected Results:**
   - Updated taxe foncière (if owner)
   - Different local services valorization
   - Updated transport usage assumptions
   - Geographic context displayed

#### Scenario 3: "Si mon salaire +20%"
1. Select "Augmentation de salaire" scenario
2. Set increase to +20%
3. Run simulation
4. **Expected Results:**
   - Proportional increase in cotisations
   - Progressive increase in IR (due to tranches)
   - Updated score fiscal
   - Ratio contributeur/bénéficiaire changes

#### Scenario 4: Edge Cases
- Zero income scenario
- Maximum income scenario (test ceiling effects)
- Multiple simultaneous changes
- International comparison

**Validation Checklist:**
- [ ] All calculation formulas use Référentiel data
- [ ] No hardcoded tax rates
- [ ] Results are reproducible
- [ ] Confidence score is recalculated
- [ ] Hypotheses are clearly stated

---

### Task 32.4: Notification Delivery

**Test Matrix:**

| Notification Type | In-App | Email | Push | Expected Trigger |
|-------------------|--------|-------|------|------------------|
| Daily Tax Fact | ✓ | ✓ | ✓ | Daily at user's preferred time |
| Badge Earned | ✓ | ✗ | ✓ | Immediately on badge earn |
| Challenge Completed | ✓ | ✗ | ✓ | Immediately on completion |
| Level Up | ✓ | ✓ | ✓ | Immediately on level up |
| Fiscal Calendar | ✓ | ✓ | ✗ | 7 days before event |
| Streak Milestone | ✓ | ✗ | ✓ | Immediately on milestone |
| Référentiel Update | ✓ | ✓ | ✗ | When new barème published |

**Test Steps:**
1. **In-App Notifications:**
   - Trigger each notification type
   - Verify appears in `/notifications`
   - Check unread count badge in header
   - Mark as read and verify count updates

2. **Email Notifications:**
   - Enable email channel in settings
   - Trigger notification
   - Check email inbox (use test email service like Mailtrap)
   - Verify formatting and content
   - Test unsubscribe link

3. **Push Notifications:**
   - Enable push permissions (requires HTTPS)
   - Trigger notification
   - Verify push received on device
   - Test different browsers (Chrome, Firefox, Safari)

**Quiet Hours Testing:**
- Set quiet hours (e.g., 22:00-08:00)
- Trigger notification during quiet hours
- Verify it's queued until quiet hours end
- Verify immediate delivery outside quiet hours

---

### Task 32.5: Score History Aggregation Cron Job

**Manual Test Procedure:**

1. **Setup:**
   ```bash
   # Run the backfill script first
   npm run backfill:score-history -- --dry-run
   npm run backfill:score-history
   ```

2. **Verify Data:**
   - Check `ScoreHistory` table has entries
   - Verify one entry per user per month
   - Check all fields are populated correctly:
     - `totalPaye`, `totalRecu`, `soldeNet`
     - `scoreConfiance`
     - `millesime` matches current year

3. **Test Monthly Aggregation:**
   - Change system date to next month (if possible in test env)
   - Trigger score calculation
   - Verify new monthly entry is created
   - Verify previous month's entry is NOT modified

4. **Test Cron Schedule:**
   - Configure cron job (daily at 2:00 AM)
   - Wait for scheduled run
   - Check logs for execution
   - Verify no errors

**Expected Behavior:**
- No duplicate entries for same user/month/year
- Historical data is immutable
- Missing months are backfilled
- Handles users with no score gracefully

---

### Task 32.6: Temporal Evolution Chart

**Test Cases:**

1. **With Sufficient Data (6+ months):**
   - Navigate to `/evolution`
   - Select "12 mois" time range
   - **Expected:**
     - Line chart displays with 3 lines (totalPaye, totalRecu, soldeNet)
     - X-axis shows months
     - Y-axis shows amounts in euros
     - Trend indicators show direction
     - Milestones are marked on chart

2. **With Sparse Data (< 3 months):**
   - **Expected:**
     - Chart still displays available data
     - Message: "Plus de données seront affichées au fil du temps"
     - No trend analysis (insufficient data)

3. **Interactive Features:**
   - Hover over data points → tooltip with exact values
   - Click on month → drill-down panel opens
   - Toggle visibility of lines (totalPaye/totalRecu/soldeNet)
   - Export to CSV → file downloads with all data

4. **Milestone Markers:**
   - Status change (contributeur → bénéficiaire)
   - Confidence threshold (50%, 75%, 90%)
   - Major life events (if recorded)
   - **Expected:** Highlighted on chart with icon

---

### Task 32.7: Animated Fiscal Day

**Test Scenarios:**

1. **Generation:**
   - Navigate to `/animations`
   - Click "Générer mon animation"
   - **Expected:**
     - Animation builds from user's real data
     - 6 scenes: Coffee, Commute, Lunch, Work, Shopping, Summary
     - Each scene shows relevant taxes
     - Smooth transitions with Framer Motion

2. **Personalization:**
   - User with car → Commute shows TICPE
   - User with public transport → Commute shows transport valorization
   - User with children → Summary includes education costs
   - **Expected:** Animation reflects user's actual profile

3. **Sharing:**
   - Click "Partager"
   - **Expected:**
     - Anonymization dialog appears
     - User confirms
     - Shareable link generated
     - Link is valid for 30 days
     - Shared version has rounded amounts (nearest 5€)
     - Shared version shows "Un utilisateur" instead of name

4. **Export:**
   - Click "Exporter en PNG"
   - **Expected:**
     - Each scene exported as PNG (placeholder)
     - Video export option (future feature)

---

### Task 32.8: Personalized Quiz Generation

**Test Cases:**

1. **Complete Profile:**
   - User with full profile (all fields filled)
   - Generate personalized quiz
   - **Expected:**
     - 10/10 questions use real user data
     - Amounts match user's actual values
     - All placeholders replaced correctly

2. **Sparse Profile (< 50% filled):**
   - User with minimal data
   - Generate personalized quiz
   - **Expected:**
     - Mix of personalized and generic questions
     - At least 3-5 questions are personalized
     - Generic questions use average French citizen data
     - No broken placeholders ({{variable}})

3. **Adaptive Difficulty:**
   - New user (no quiz history)
   - **Expected:** Difficulty = "easy"

   - User with 5+ attempts, average 85%
   - **Expected:** Difficulty = "hard"

   - User with 5+ attempts, average 55%
   - **Expected:** Difficulty = "medium"

4. **Category Filtering:**
   - Request focused quiz on "IR"
   - **Expected:** All questions about impôt sur le revenu
   - No questions about TVA, cotisations, etc.

---

### Task 32.9: Rate Limiting for Notifications

**Test Procedure:**

1. **Daily Tax Facts:**
   - User enables daily facts
   - **Expected:**
     - Maximum 1 fact per day
     - Not sent if user already logged today
     - Respects quiet hours

2. **Badge/Challenge Notifications:**
   - Earn multiple badges in rapid succession
   - **Expected:**
     - All notifications are sent (no rate limit)
     - But displayed in batch (max 3 visible at once)

3. **Email Rate Limiting:**
   - Trigger 10+ notification events in 1 hour
   - **Expected:**
     - In-app: all 10+ notifications appear
     - Email: maximum 5 emails per hour
     - Remaining queued for next hour

4. **Testing Rate Limit:**
   ```typescript
   // In notification service
   const RATE_LIMITS = {
     email: { max: 5, windowMs: 3600000 }, // 5 per hour
     push: { max: 20, windowMs: 3600000 }, // 20 per hour
     inApp: { max: 100, windowMs: 3600000 }, // 100 per hour
   };
   ```

**Validation:**
- [ ] Users are not spammed
- [ ] Important notifications are not dropped
- [ ] Rate limit persists across server restarts (use Redis/cache)

---

### Task 32.10: RGPD Compliance

**Test Checklist:**

#### Opt-In Requirements
- [ ] User must explicitly enable each notification channel
- [ ] Default state is ALL DISABLED
- [ ] Clear explanation of what each channel means
- [ ] Granular controls (can enable email but not push)

#### Data Deletion
1. Navigate to `/settings/donnees`
2. Click "Supprimer mon compte"
3. **Expected:**
   - Confirmation dialog with clear warning
   - List of what will be deleted
   - Option to export data first
   - After confirmation:
     - User record deleted
     - All related data deleted (cascade)
     - Session invalidated immediately
     - Redirect to homepage

4. **Verify Deletion:**
   ```sql
   -- Check database (should return 0 rows)
   SELECT * FROM "User" WHERE id = 'deleted-user-id';
   SELECT * FROM "ProfilFiscal" WHERE "userId" = 'deleted-user-id';
   SELECT * FROM "JournalEntry" WHERE "userId" = 'deleted-user-id';
   ```

#### Data Export
1. Navigate to `/settings/donnees`
2. Click "Exporter mes données"
3. **Expected:**
   - JSON file downloads immediately
   - Contains ALL user data:
     - Profile information
     - Journal entries
     - Score history
     - Quiz attempts
     - Gamification progress
   - No sensitive third-party data (e.g., OAuth tokens)
   - Data is complete and parseable

#### Consent Tracking
- [ ] Document upload: explicit consent before processing
- [ ] AI connection: consent before sending data
- [ ] Social sharing: consent before making data public
- [ ] Notification enrollment: explicit opt-in

---

### Task 32.11: Responsive Design (Mobile)

**Test Devices:**
- iPhone SE (375px)
- iPhone 12 Pro (390px)
- Samsung Galaxy S21 (360px)
- iPad (768px)
- iPad Pro (1024px)

**Pages to Test:**

#### Dashboard (`/dashboard`)
- [ ] Score fiscal card is full-width on mobile
- [ ] Sankey diagram scrolls horizontally if needed
- [ ] Navigation collapses to hamburger menu
- [ ] Cards stack vertically

#### Journal (`/journal`)
- [ ] Timeline entries are thumb-scrollable
- [ ] "Scanner un ticket" button is easily tappable
- [ ] Date picker works on mobile
- [ ] Filters collapse into dropdown

#### Gamification (`/gamification`)
- [ ] Badge grid: 2 columns on mobile, 3+ on tablet
- [ ] Challenge cards stack vertically
- [ ] Progress bars are readable
- [ ] Tabs are swipeable

#### Evolution (`/evolution`)
- [ ] Chart is responsive (touch zoom/pan)
- [ ] Time range selector is horizontal scroll
- [ ] Export button moves to bottom on mobile

#### Animations (`/animations`)
- [ ] Full-screen animation on mobile
- [ ] Controls are bottom-aligned
- [ ] Share dialog is full-screen modal on mobile

**Common Elements:**
- [ ] Header notification bell is tappable (min 44x44px)
- [ ] Form inputs have appropriate mobile keyboards
- [ ] Buttons meet minimum touch target size
- [ ] No horizontal scroll on any page (except intentional)

---

### Task 32.12: Keyboard Navigation & Accessibility

**Keyboard Navigation Test:**

1. **Tab Order:**
   - Start from top of page
   - Press Tab repeatedly
   - **Expected:**
     - Logical order (top to bottom, left to right)
     - All interactive elements are reachable
     - No focus traps
     - Skip links work

2. **Focus Indicators:**
   - **Expected:**
     - Clear visible focus outline
     - Outline is at least 2px and high contrast
     - Custom focus styles for buttons/links

3. **Keyboard Shortcuts:**
   - `/` → Focus search (if applicable)
   - `Esc` → Close modals/dialogs
   - `Enter` → Submit forms
   - `Space` → Activate buttons
   - Arrow keys → Navigate carousels/tabs

**Screen Reader Test (NVDA/JAWS/VoiceOver):**

1. **Semantic HTML:**
   - [ ] Headings are hierarchical (h1 → h2 → h3)
   - [ ] Landmarks (`<nav>`, `<main>`, `<aside>`)
   - [ ] Lists use `<ul>`/`<ol>`
   - [ ] Buttons are `<button>`, links are `<a>`

2. **ARIA Labels:**
   - [ ] Icon-only buttons have `aria-label`
   - [ ] Charts have `aria-label` with data summary
   - [ ] Live regions for dynamic content
   - [ ] Form inputs have associated `<label>`

3. **Image Alt Text:**
   - [ ] All images have alt text
   - [ ] Decorative images use `alt=""`
   - [ ] Charts have text alternatives

**Color Contrast (WCAG AA):**
- [ ] Text: minimum 4.5:1 contrast
- [ ] Large text: minimum 3:1 contrast
- [ ] Interactive elements: minimum 3:1 contrast
- [ ] Test with browser DevTools accessibility panel

---

### Task 32.13: Prefers-Reduced-Motion

**Test Setup:**
```css
/* Browser DevTools */
/* Rendering → Emulate CSS media feature prefers-reduced-motion: reduce */
```

**Expected Behavior:**

1. **Animations Disabled:**
   - [ ] Celebration confetti is disabled
   - [ ] Page transition animations are instant
   - [ ] Chart animations are disabled
   - [ ] Framer Motion animations respect motion preference
   - [ ] Loading spinners still rotate (acceptable)

2. **Code Implementation:**
```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

3. **Framer Motion:**
```typescript
// Use reduced motion hook
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
/>
```

**Test Checklist:**
- [ ] Celebration animations are disabled
- [ ] Global celebrations component respects preference
- [ ] Fiscal day animation is simplified
- [ ] Chart transitions are instant
- [ ] Badge/challenge animations are disabled
- [ ] App is still fully functional
- [ ] No jarring cuts (graceful degradation)

---

## Test Execution Summary

### Automated Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test tests/gamification
npm test tests/modules
npm test tests/api

# Run with coverage
npm test:coverage
```

### Manual Testing Checklist

- [ ] Task 32.3: Simulation engine (all scenarios)
- [ ] Task 32.4: Notification delivery (all channels)
- [ ] Task 32.5: Score history cron job
- [ ] Task 32.6: Temporal evolution chart
- [ ] Task 32.7: Animated fiscal day
- [ ] Task 32.8: Personalized quiz (sparse data)
- [ ] Task 32.9: Rate limiting verification
- [ ] Task 32.10: RGPD compliance (full workflow)
- [ ] Task 32.11: Responsive design (5+ devices)
- [ ] Task 32.12: Keyboard navigation (all pages)
- [ ] Task 32.13: Reduced motion (all animations)

### E2E Tests (Playwright)
```bash
# Run Playwright tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/gamification.spec.ts
```

---

## Reporting Issues

When reporting test failures, include:

1. **Environment:**
   - Browser/Device
   - OS version
   - Node version

2. **Steps to Reproduce:**
   - Exact sequence of actions
   - Test data used

3. **Expected vs Actual:**
   - What should happen
   - What actually happened

4. **Screenshots/Videos:**
   - Use Playwright's built-in screenshot/video recording
   - Include browser console errors

5. **Logs:**
   - Server logs
   - Browser console logs
   - Network tab (if API-related)
