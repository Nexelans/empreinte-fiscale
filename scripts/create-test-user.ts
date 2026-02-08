/**
 * Script to create a verified test user for testing
 * Run with: npx tsx scripts/create-test-user.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'test-wizard@test.fr';
    const name = 'Test Wizard User';
    const password = 'TestPassword123';

    console.log(`🔍 Vérification si l'utilisateur existe déjà...`);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`ℹ️  Utilisateur existe déjà: ${email}`);

      // Update to verified if not
      if (!existing.emailVerified) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerified: new Date() },
        });
        console.log(`✅ Email vérifié`);
      }

      console.log(`\n📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      return;
    }

    console.log(`👤 Création de l'utilisateur de test...`);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: new Date(), // Pre-verified for testing
      },
    });

    console.log(`\n✅ Utilisateur de test créé avec succès!`);
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\n🎯 Vous pouvez maintenant tester le wizard à /profil`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
