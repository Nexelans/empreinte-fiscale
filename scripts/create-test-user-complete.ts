/**
 * Script to create a test user with complete profile
 * Run with: npx tsx scripts/create-test-user-complete.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';

const prisma = new PrismaClient();

async function createCompleteTestUser() {
  try {
    const email = 'test-dashboard@test.fr';
    const name = 'Test Dashboard User';
    const password = 'TestPassword123';

    console.log(`🔍 Vérification si l'utilisateur existe déjà...`);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profilFiscal: true },
    });

    if (!user) {
      console.log(`👤 Création de l'utilisateur...`);
      const passwordHash = await hashPassword(password);

      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          emailVerified: new Date(),
        },
        include: { profilFiscal: true },
      });
    }

    console.log(`✅ Utilisateur trouvé/créé: ${email}`);

    // Create or update complete profil
    console.log(`📝 Création/mise à jour du profil complet...`);

    const profilData = {
      userId: user.id,
      isComplete: true,
      lastCompletedAt: new Date(),
      wizardStep: 5,

      // Situation
      statut: 'marie_pacse',
      nombreParts: 3.0, // Marié + 2 enfants
      commune: 'Paris',
      age: 35,

      // Revenus
      salaireBrut: 45000,
      salaireNet: 35000,
      typeContrat: 'cdi',
      revenusFonciers: 0,
      revenusCapitaux: 500,
      autresRevenus: 0,

      // Patrimoine
      proprietaire: true,
      valeurLocative: 1200,
      taxeFonciere: 1500,
      vehicules: [{ type: 'thermique', kmParAn: 12000 }],
      patrimoineIFI: 0,

      // Consommation
      modeConsommation: 'moyen',
      budgetMensuel: { mensuel: 2000 },

      // Famille & Services
      nombreEnfants: 2,
      enfantsDetails: [
        { age: 8, niveauScolaire: 'primaire' },
        { age: 12, niveauScolaire: 'college' }
      ],
      frequenceServices: {
        transportsCommun: 'quotidien',
        hopitalMedecin: 'mensuel',
        bibliotheque: 'jamais',
        equipementsSportifs: 'hebdomadaire'
      },
      aides: {
        caf: true,
        apl: false,
        rsa: false,
        bourses: false,
        chomage: false,
        cmuc: false
      },

      // Status data
      statusData: {
        statut: 'verifie',
        nombreParts: 'calcule',
        salaireBrut: 'declare',
        salaireNet: 'declare',
        nombreEnfants: 'verifie'
      },
    };

    if (user.profilFiscal) {
      await prisma.profilFiscal.update({
        where: { id: user.profilFiscal.id },
        data: profilData,
      });
      console.log(`✅ Profil mis à jour`);
    } else {
      await prisma.profilFiscal.create({
        data: profilData,
      });
      console.log(`✅ Profil créé`);
    }

    console.log(`\n✅ Utilisateur de test avec profil complet créé!`);
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\n🎯 Profil fiscal:`);
    console.log(`   - Marié/Pacsé avec 2 enfants (3 parts)`);
    console.log(`   - Salaire brut: 45 000 € / an`);
    console.log(`   - Propriétaire, taxe foncière: 1 500 €`);
    console.log(`   - Consommation: mode moyen, 2 000 €/mois`);
    console.log(`\n🚀 Connectez-vous et allez sur /dashboard pour voir le score calculé`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCompleteTestUser()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
