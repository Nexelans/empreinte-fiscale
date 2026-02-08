/**
 * E2E test for friend invitation flow
 * Task 31.4
 *
 * Tests: generate invitation, accept, share data
 */

import { test, expect } from '@playwright/test';

test.describe('Friend Invitation Flow', () => {
  const user1Email = 'user1@test.com';
  const user1Password = 'password123';
  const user2Email = 'user2@test.com';
  const user2Password = 'password456';

  test.beforeEach(async ({ page }) => {
    // Ensure test users exist
    await page.goto('/');
  });

  test('should generate and send friend invitation', async ({ page }) => {
    // Login as user 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', user1Password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Navigate to friends page
    await page.goto('/social/friends');

    // Click invite friend button
    await page.click('button:has-text("Inviter un ami")');

    // Fill in friend's email
    await page.fill('input[name="email"]', user2Email);
    await page.fill('textarea[name="message"]', 'Salut, rejoins-moi sur Empreinte Fiscale!');

    // Send invitation
    await page.click('button:has-text("Envoyer l\'invitation")');

    // Verify success message
    await expect(page.locator('text=Invitation envoyée')).toBeVisible();
  });

  test('should accept friend invitation', async ({ page, context }) => {
    // Login as user 2
    await page.goto('/login');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', user2Password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Check for pending invitation notification
    await page.goto('/social/friends');

    // Should see pending invitation
    await expect(page.locator('text=Demande d\'ami')).toBeVisible();
    await expect(page.locator(`text=${user1Email}`)).toBeVisible();

    // Accept invitation
    await page.click('button:has-text("Accepter")');

    // Verify friendship established
    await expect(page.locator('text=Ami ajouté')).toBeVisible();
    await expect(page.locator(`text=${user1Email}`)).toBeVisible();
  });

  test('should configure sharing permissions', async ({ page }) => {
    // Login as user 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', user1Password);
    await page.click('button[type="submit"]');

    // Navigate to friends page
    await page.goto('/social/friends');

    // Find friend and open sharing settings
    const friendRow = page.locator(`tr:has-text("${user2Email}")`);
    await friendRow.locator('button[aria-label="Options"]').click();
    await page.click('text=Paramètres de partage');

    // Configure sharing level
    await page.click('input[value="SUMMARY"]');
    await page.click('button:has-text("Enregistrer")');

    // Verify saved
    await expect(page.locator('text=Partage: Résumé')).toBeVisible();
  });

  test('should view shared data with correct permissions', async ({ page }) => {
    // Login as user 2
    await page.goto('/login');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', user2Password);
    await page.click('button[type="submit"]');

    // Navigate to friends page
    await page.goto('/social/friends');

    // Click on friend to view their data
    await page.click(`text=${user1Email}`);

    // Should see shared score data
    await expect(page.locator('text=Score fiscal')).toBeVisible();
    await expect(page.locator('text=Ce que je paie')).toBeVisible();
    await expect(page.locator('text=Ce que je reçois')).toBeVisible();

    // With SUMMARY permission, should see breakdown
    await expect(page.locator('text=Détail')).toBeVisible();

    // But should NOT see raw salary (that's DETAILED only)
    await expect(page.locator('text=Salaire brut')).not.toBeVisible();
  });

  test('should respect SCORE_ONLY permission level', async ({ page }) => {
    // Login as user 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', user1Password);
    await page.click('button[type="submit"]');

    // Change sharing to SCORE_ONLY
    await page.goto('/social/friends');
    const friendRow = page.locator(`tr:has-text("${user2Email}")`);
    await friendRow.locator('button[aria-label="Options"]').click();
    await page.click('text=Paramètres de partage');
    await page.click('input[value="SCORE_ONLY"]');
    await page.click('button:has-text("Enregistrer")');

    // Logout
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');

    // Login as user 2
    await page.goto('/login');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', user2Password);
    await page.click('button[type="submit"]');

    // View friend's data
    await page.goto('/social/friends');
    await page.click(`text=${user1Email}`);

    // Should see only basic score
    await expect(page.locator('text=Total payé')).toBeVisible();
    await expect(page.locator('text=Total reçu')).toBeVisible();
    await expect(page.locator('text=Solde net')).toBeVisible();

    // Should NOT see any detailed breakdown
    await expect(page.locator('text=Impôt sur le revenu')).not.toBeVisible();
    await expect(page.locator('text=CSG')).not.toBeVisible();
  });

  test('should unfriend and revoke access', async ({ page }) => {
    // Login as user 1
    await page.goto('/login');
    await page.fill('input[type="email"]', user1Email);
    await page.fill('input[type="password"]', user1Password);
    await page.click('button[type="submit"]');

    // Navigate to friends
    await page.goto('/social/friends');

    // Unfriend user 2
    const friendRow = page.locator(`tr:has-text("${user2Email}")`);
    await friendRow.locator('button[aria-label="Options"]').click();
    await page.click('text=Retirer des amis');

    // Confirm
    await page.click('button:has-text("Confirmer")');

    // Verify removed
    await expect(page.locator(`text=${user2Email}`)).not.toBeVisible();

    // Logout and login as user 2
    await page.click('button[aria-label="Menu utilisateur"]');
    await page.click('text=Déconnexion');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', user2Password);
    await page.click('button[type="submit"]');

    // Try to access user 1's data
    await page.goto('/social/friends');

    // Should not see user 1 anymore
    await expect(page.locator(`text=${user1Email}`)).not.toBeVisible();
  });

  test('should handle declined invitation', async ({ page }) => {
    // Login as user 2
    await page.goto('/login');
    await page.fill('input[type="email"]', user2Email);
    await page.fill('input[type="password"]', user2Password);
    await page.click('button[type="submit"]');

    // Navigate to pending invitations
    await page.goto('/social/friends');

    // Decline invitation
    await page.click('button:has-text("Refuser")');

    // Verify invitation removed
    await expect(page.locator('text=Demande d\'ami')).not.toBeVisible();
  });
});
