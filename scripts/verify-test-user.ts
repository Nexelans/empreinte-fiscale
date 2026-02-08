/**
 * Script to verify test user email automatically
 * Run with: npx tsx scripts/verify-test-user.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestUser(email: string) {
  try {
    console.log(`🔍 Recherche de l'utilisateur: ${email}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.name} (${user.email})`);

    // Check if already verified
    if (user.emailVerified) {
      console.log(`ℹ️  Email déjà vérifié le ${user.emailVerified.toLocaleString('fr-FR')}`);
      return;
    }

    // Verify email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    console.log(`✅ Email vérifié avec succès!`);
    console.log(`📧 ${updatedUser.email} - Vérifié le ${updatedUser.emailVerified?.toLocaleString('fr-FR')}`);

    // Clean up verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    console.log(`🧹 Tokens de vérification nettoyés`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/verify-test-user.ts <email>');
  process.exit(1);
}

verifyTestUser(email)
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
