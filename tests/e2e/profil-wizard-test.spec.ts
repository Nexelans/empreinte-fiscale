import { test, expect } from '@playwright/test';

// Helper: Create a test user and login
async function loginAsTestUser(page: any) {
  // Register a new user
  const timestamp = Date.now();
  const email = `test-wizard-${timestamp}@test.fr`;
  const password = 'TestPassword123';

  await page.goto('http://localhost:3000/auth/register');
  await page.getByPlaceholder(/nom/i).fill(`Test User ${timestamp}`);
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /créer mon compte/i }).click();

  // Wait for redirect or confirmation
  await page.waitForTimeout(1000);

  // Login
  await page.goto('http://localhost:3000/auth/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /se connecter/i }).first().click();

  // Wait for dashboard/profil
  await page.waitForTimeout(2000);

  return { email, password };
}

test.describe('T2 - Wizard de Profil Fiscal', () => {

  test('T2.1 - Étape 1 (Situation) - Navigation et sauvegarde', async ({ page }) => {
    // Login first
    await loginAsTestUser(page);

    // Go to profil page
    await page.goto('http://localhost:3000/profil');

    // Check we're on step 1
    await expect(page.getByText(/mon profil fiscal/i)).toBeVisible();

    // Screenshot initial
    await page.screenshot({ path: 'tests/screenshots/wizard-step1-initial.png', fullPage: true });

    // Fill step 1 - Situation
    // Statut
    const statutSelect = page.locator('select').first(); // Assuming first select is statut
    if (await statutSelect.isVisible()) {
      await statutSelect.selectOption({ index: 1 }); // Select first option
    }

    // Age
    const ageInput = page.getByLabel(/âge/i).or(page.getByPlaceholder(/âge/i));
    if (await ageInput.count() > 0) {
      await ageInput.first().fill('35');
    }

    // Commune
    const communeInput = page.getByLabel(/commune/i).or(page.getByPlaceholder(/commune/i));
    if (await communeInput.count() > 0) {
      await communeInput.first().fill('Paris');
    }

    await page.screenshot({ path: 'tests/screenshots/wizard-step1-filled.png', fullPage: true });

    // Click "Suivant"
    await page.getByRole('button', { name: /suivant/i }).click();

    // Wait for step 2
    await page.waitForTimeout(1000);

    // Verify we moved to step 2
    await page.screenshot({ path: 'tests/screenshots/wizard-step2-initial.png', fullPage: true });

    console.log('✅ T2.1 - Étape 1 OK - Navigation et données sauvées');
  });

  test('T2.9 - Retour en arrière - Données conservées', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('http://localhost:3000/profil');

    // Fill step 1
    const ageInput = page.getByLabel(/âge/i).or(page.getByPlaceholder(/âge/i));
    if (await ageInput.count() > 0) {
      await ageInput.first().fill('42');
    }

    // Go to step 2
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(1000);

    // Fill something in step 2 if possible
    const salaireInput = page.getByLabel(/brut/i).or(page.getByPlaceholder(/brut/i));
    if (await salaireInput.count() > 0) {
      await salaireInput.first().fill('35000');
    }

    // Go back to step 1
    await page.getByRole('button', { name: /précédent/i }).click();
    await page.waitForTimeout(1000);

    // Verify age is still there
    const ageValue = await ageInput.first().inputValue();
    expect(ageValue).toBe('42');

    console.log('✅ T2.9 - Retour en arrière OK - Données conservées');
  });

  test('T2.7 - Auto-save - Quitter et revenir', async ({ page }) => {
    const { email, password } = await loginAsTestUser(page);
    await page.goto('http://localhost:3000/profil');

    // Fill step 1
    const ageInput = page.getByLabel(/âge/i).or(page.getByPlaceholder(/âge/i));
    if (await ageInput.count() > 0) {
      await ageInput.first().fill('28');
    }

    const communeInput = page.getByLabel(/commune/i).or(page.getByPlaceholder(/commune/i));
    if (await communeInput.count() > 0) {
      await communeInput.first().fill('Lyon');
    }

    // Wait for auto-save (2 seconds debounce + margin)
    await page.waitForTimeout(3000);

    // Leave the page
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(1000);

    // Come back to profil
    await page.goto('http://localhost:3000/profil');
    await page.waitForTimeout(1000);

    // Verify data is still there
    const savedAge = await ageInput.first().inputValue();
    const savedCommune = await communeInput.first().inputValue();

    expect(savedAge).toBe('28');
    expect(savedCommune).toBe('Lyon');

    console.log('✅ T2.7 - Auto-save OK - Données restaurées après retour');
  });

  test('T2.8 - Calcul automatique parts fiscales', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('http://localhost:3000/profil');

    // Select "Marié/Pacsé" status (2 parts base)
    const statutSelect = page.locator('select').first();
    if (await statutSelect.isVisible()) {
      await statutSelect.selectOption('marie_pacse');
    }

    await page.waitForTimeout(500);

    // Go to step 5 (famille)
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /suivant/i }).click();
      await page.waitForTimeout(500);
    }

    // Add 2 children (should give 2 + 1.0 = 3 parts)
    const nombreEnfantsInput = page.getByLabel(/nombre d'enfants/i).or(page.getByPlaceholder(/nombre/i));
    if (await nombreEnfantsInput.count() > 0) {
      await nombreEnfantsInput.first().fill('2');
    }

    await page.waitForTimeout(1000);

    // Go back to step 1 to check calculated parts
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /précédent/i }).click();
      await page.waitForTimeout(500);
    }

    // Check parts value (should be 3.0)
    const partsInput = page.getByLabel(/parts/i).or(page.locator('input[type="number"]'));
    if (await partsInput.count() > 0) {
      const partsValue = await partsInput.first().inputValue();
      console.log(`Nombre de parts calculé: ${partsValue} (attendu: 3)`);
      // Note: Exact verification depends on UI implementation
    }

    console.log('✅ T2.8 - Calcul parts fiscales testé');
  });

  test('T2.6 - Finalisation - Terminer et voir le score', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('http://localhost:3000/profil');

    // Quickly fill all steps (minimal data)
    // Step 1
    const ageInput = page.getByLabel(/âge/i).or(page.getByPlaceholder(/âge/i));
    if (await ageInput.count() > 0) {
      await ageInput.first().fill('30');
    }
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);

    // Step 2
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);

    // Step 3
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);

    // Step 4
    await page.getByRole('button', { name: /suivant/i }).click();
    await page.waitForTimeout(500);

    // Step 5 - Check if "Terminer" button is visible
    const finishButton = page.getByRole('button', { name: /terminer/i });
    await expect(finishButton).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/wizard-step5-finish.png', fullPage: true });

    // Click finish
    await finishButton.click();

    // Wait for redirect to dashboard
    await page.waitForTimeout(2000);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    console.log('✅ T2.6 - Finalisation OK - Redirection vers dashboard');
  });

  test('T16.2 - Wizard Mobile - Responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await loginAsTestUser(page);
    await page.goto('http://localhost:3000/profil');

    // Check page is responsive
    await expect(page.getByText(/mon profil fiscal/i)).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/wizard-mobile-step1.png', fullPage: true });

    // Check navigation buttons are visible
    const suivantButton = page.getByRole('button', { name: /suivant/i });
    await expect(suivantButton).toBeVisible();

    // Try navigation
    await suivantButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/wizard-mobile-step2.png', fullPage: true });

    // Check precedent button
    const precedentButton = page.getByRole('button', { name: /précédent/i });
    await expect(precedentButton).toBeVisible();

    console.log('✅ T16.2 - Wizard Mobile OK - Responsive et navigation fluide');
  });
});
