/**
 * Script to clean test users from database
 * Run with: npx tsx scripts/clean-test-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestUsers() {
  try {
    console.log('🧹 Nettoyage des utilisateurs de test...\n');

    // Count users before deletion
    const userCount = await prisma.user.count();
    console.log(`👥 Utilisateurs trouvés: ${userCount}`);

    if (userCount === 0) {
      console.log('✨ Base de données déjà vide!');
      return;
    }

    // List users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log('\n📋 Utilisateurs à supprimer:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name}) - Créé le ${user.createdAt.toLocaleDateString('fr-FR')}`);
    });

    console.log('\n⚠️  Suppression en cours...');

    // Delete all users (cascade will handle related data)
    const result = await prisma.user.deleteMany({});

    console.log(`\n✅ ${result.count} utilisateur(s) supprimé(s) avec succès!`);
    console.log('✨ Base de données nettoyée!');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanTestUsers()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
