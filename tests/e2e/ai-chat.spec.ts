/**
 * E2E test for AI chat with context injection
 * Task 31.6
 */

import { test, expect } from '@playwright/test';

test.describe('AI Chat with Context Injection', () => {
  const testEmail = 'aiuser@test.com';
  const testPassword = 'password123';
  const testApiKey = process.env.TEST_OPENAI_API_KEY || 'sk-test-key';

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should configure AI provider', async ({ page }) => {
    // Navigate to AI settings
    await page.goto('/settings/ai');

    // Select provider
    await page.selectOption('select[name="provider"]', 'openai');

    // Enter API key
    await page.fill('input[name="apiKey"]', testApiKey);

    // Select model
    await page.selectOption('select[name="model"]', 'gpt-4o-mini');

    // Save configuration
    await page.click('button:has-text("Enregistrer")');

    // Verify success
    await expect(page.locator('text=Configuration enregistrée')).toBeVisible();
  });

  test('should test AI connection', async ({ page }) => {
    await page.goto('/settings/ai');

    // Click test connection button
    await page.click('button:has-text("Tester la connexion")');

    // Wait for test to complete
    await page.waitForSelector('text=Connexion réussie', { timeout: 10000 });

    // Verify test passed
    await expect(page.locator('text=Connexion réussie')).toBeVisible();
  });

  test('should open AI chat from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Click analyze with AI button
    await page.click('button:has-text("Analyser avec mon IA")');

    // Chat interface should open
    await expect(page.locator('text=Chat Fiscal IA')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Question"]')).toBeVisible();
  });

  test('should inject fiscal context in chat', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("Analyser avec mon IA")');

    // Send a question
    const question = 'Quel est mon solde fiscal net?';
    await page.fill('textarea[name="message"]', question);
    await page.click('button:has-text("Envoyer")');

    // Wait for response
    await page.waitForSelector('.ai-message', { timeout: 15000 });

    // Response should reference user's actual data
    const responseText = await page.locator('.ai-message').last().textContent();

    // Should contain euro amounts (indicating real data was used)
    expect(responseText).toMatch(/\d+[€\s]*€/);
  });

  test('should show AI warning before first use', async ({ page }) => {
    // For a user who hasn't used AI before
    await page.goto('/dashboard');
    await page.click('button:has-text("Analyser avec mon IA")');

    // Warning modal should appear
    await expect(page.locator('text=Transmission de données')).toBeVisible();
    await expect(page.locator('text=Vos données seront envoyées')).toBeVisible();

    // Check understanding checkbox
    await page.click('input[type="checkbox"]');

    // Confirm
    await page.click('button:has-text("Confirmer")');

    // Chat should now be accessible
    await expect(page.locator('textarea[name="message"]')).toBeEnabled();
  });

  test('should display AI usage statistics', async ({ page }) => {
    await page.goto('/settings/ai');

    // Click on usage tab
    await page.click('text=Utilisation');

    // Should show usage metrics
    await expect(page.locator('text=Requêtes ce mois')).toBeVisible();
    await expect(page.locator('text=Tokens utilisés')).toBeVisible();
    await expect(page.locator('text=Coût estimé')).toBeVisible();
  });

  test('should handle AI OCR for document', async ({ page }) => {
    await page.goto('/documents');

    // Select document type
    await page.click('button:has-text("Bulletin de paie")');

    // Enable AI OCR toggle
    await page.click('input[type="checkbox"][name="useAI"]');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/bulletin-paie-test.pdf');

    // AI warning should appear
    await expect(page.locator('text=Le document sera envoyé')).toBeVisible();
    await page.click('input[type="checkbox"]');
    await page.click('button:has-text("Confirmer")');

    // Wait for OCR processing
    await page.waitForSelector('text=Analyse terminée', { timeout: 20000 });

    // Should show extracted data
    await expect(page.locator('text=Salaire brut')).toBeVisible();
  });

  test('should respect rate limits', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("Analyser avec mon IA")');

    // Send multiple requests rapidly
    for (let i = 0; i < 105; i++) {
      await page.fill('textarea[name="message"]', `Test question ${i}`);
      await page.click('button:has-text("Envoyer")');

      if (i === 100) {
        // Should hit rate limit
        await expect(page.locator('text=Limite atteinte')).toBeVisible({ timeout: 5000 });
        break;
      }
    }
  });

  test('should handle AI errors gracefully', async ({ page }) => {
    // Configure with invalid API key
    await page.goto('/settings/ai');
    await page.fill('input[name="apiKey"]', 'sk-invalid-key');
    await page.click('button:has-text("Enregistrer")');

    // Try to use AI
    await page.goto('/dashboard');
    await page.click('button:has-text("Analyser avec mon IA")');
    await page.fill('textarea[name="message"]', 'Test question');
    await page.click('button:has-text("Envoyer")');

    // Should show error message
    await expect(page.locator('text=Erreur')).toBeVisible();
    await expect(page.locator('text=API key')).toBeVisible();
  });

  test('should allow switching AI providers', async ({ page }) => {
    await page.goto('/settings/ai');

    // Switch from OpenAI to Anthropic
    await page.selectOption('select[name="provider"]', 'anthropic');

    // Model dropdown should update
    await expect(page.locator('option:has-text("claude-sonnet")')).toBeVisible();

    // Enter new API key
    await page.fill('input[name="apiKey"]', 'sk-ant-test-key');

    // Save
    await page.click('button:has-text("Enregistrer")');

    await expect(page.locator('text=Configuration enregistrée')).toBeVisible();
  });
});
