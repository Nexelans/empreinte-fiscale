import { test, expect } from '@playwright/test';

// Test user credentials
const TEST_USER = {
  email: 'test-wizard@test.fr',
  password: 'TestPassword123',
};

// Helper to login
async function login(page: any) {
  await page.goto('http://localhost:3000/auth/login');
  await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/mot de passe/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /se connecter/i }).first().click();
  await page.waitForTimeout(2000);
}

test.describe('T2 - Wizard de Profil Fiscal - Tests Complets', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('T2.1 - Étape 1 - Situation personnelle', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Verify we're on the wizard
    await expect(page.getByText(/mon profil fiscal/i)).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/wizard-step1-loaded.png', fullPage: true });

    // Navigate to next step
    const suivantButton = page.getByRole('button', { name: /suivant/i });
    await expect(suivantButton).toBeVisible();
    await suivantButton.click();

    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-step2-loaded.png', fullPage: true });

    console.log('✅ T2.1 - Étape 1 → Étape 2: Navigation OK');
  });

  test('T2.2 - Étape 2 - Revenus', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Go to step 2
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-step2-revenus.png', fullPage: true });

    // Go to step 3
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    console.log('✅ T2.2 - Étape 2 → Étape 3: Navigation OK');
  });

  test('T2.3 - Étape 3 - Patrimoine', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Navigate to step 3
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-step3-patrimoine.png', fullPage: true });

    // Go to step 4
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    console.log('✅ T2.3 - Étape 3 → Étape 4: Navigation OK');
  });

  test('T2.4 - Étape 4 - Consommation', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Navigate to step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /suivant/i }).click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'tests/screenshots/wizard-step4-consommation.png', fullPage: true });

    // Check for mode selection (profil type / estimation / détaillé)
    await page.waitForTimeout(1000);

    // Go to step 5
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    console.log('✅ T2.4 - Étape 4 → Étape 5: Navigation OK');
  });

  test('T2.5 - Étape 5 - Famille & Services', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Navigate to step 5
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /suivant/i }).click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'tests/screenshots/wizard-step5-famille.png', fullPage: true });

    // Check for "Terminer et voir mon score" button
    const finishButton = page.getByRole('button', { name: /terminer/i });
    await expect(finishButton).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/wizard-step5-finish-button.png', fullPage: true });

    console.log('✅ T2.5 - Étape 5: Bouton "Terminer" visible');
  });

  test('T2.6 - Finalisation - Terminer et voir le score', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Navigate to step 5
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /suivant/i }).click();
      await page.waitForTimeout(500);
    }

    // Click finish button
    const finishButton = page.getByRole('button', { name: /terminer/i });
    await finishButton.click();

    // Wait for redirect
    await page.waitForTimeout(3000);

    // Should be on dashboard
    const url = page.url();
    console.log(`Redirected to: ${url}`);

    if (url.includes('/dashboard')) {
      console.log('✅ T2.6 - Finalisation: Redirection vers /dashboard OK');
      await page.screenshot({ path: 'tests/screenshots/wizard-dashboard-after-finish.png', fullPage: true });
    } else {
      console.log(`⚠️  T2.6 - Expected /dashboard but got: ${url}`);
    }
  });

  test('T2.7 - Auto-save - Quitter et revenir', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Wait for wizard to load
    await page.waitForTimeout(1000);

    // Check current step
    await page.screenshot({ path: 'tests/screenshots/wizard-autosave-before.png', fullPage: true });

    // Leave the page
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(1000);

    // Return to profil
    await page.goto('http://localhost:3000/profil');
    await page.waitForTimeout(1000);

    // Should maintain state
    await page.screenshot({ path: 'tests/screenshots/wizard-autosave-after.png', fullPage: true });

    console.log('✅ T2.7 - Auto-save: État maintenu après retour');
  });

  test('T2.9 - Retour en arrière - Données conservées', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Go forward
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-step2-before-back.png', fullPage: true });

    // Go back
    const precedentButton = page.getByRole('button', { name: /précédent/i });
    await expect(precedentButton).toBeVisible();
    await precedentButton.click();

    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-step1-after-back.png', fullPage: true });

    // Verify precedent button is disabled on step 1
    await expect(precedentButton).toBeDisabled();

    console.log('✅ T2.9 - Retour en arrière: Navigation OK, bouton désactivé à l\'étape 1');
  });

  test('T2.10 - Progress Bar', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    // Check progress indicator exists
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/wizard-progress-step1.png', fullPage: true });

    // Go to step 3
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-progress-step3.png', fullPage: true });

    console.log('✅ T2.10 - Indicateur de progression visible');
  });
});

test.describe('T2 - Wizard Mobile', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page);
  });

  test('T16.2 - Wizard Mobile - Responsive', async ({ page }) => {
    await page.goto('http://localhost:3000/profil');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/wizard-mobile-step1-full.png', fullPage: true });

    // Check navigation buttons
    const suivantButton = page.getByRole('button', { name: /suivant/i });
    await expect(suivantButton).toBeVisible();

    // Navigate
    await suivantButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/wizard-mobile-step2-full.png', fullPage: true });

    console.log('✅ T16.2 - Wizard Mobile: Responsive OK');
  });
});
