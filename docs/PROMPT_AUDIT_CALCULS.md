# AUDIT ET CORRECTION DU MOTEUR DE CALCUL FISCAL - Mode Découverte

## Contexte
Les tests sur 3 profils types en mode découverte (SMIC, Enseignant, Cadre) révèlent des incohérences dans les montants calculés. Avant de corriger, tu dois VÉRIFIER chaque point avec les sources du référentiel (seed Prisma, données INSEE, PLF 2026, DEPP, DREES, barèmes officiels).

## Méthode de travail
Pour CHAQUE point ci-dessous :
1. Lis le code source actuel du calcul concerné
2. Lis les données du seed/référentiel utilisées
3. Vérifie avec les sources officielles (barèmes 2026, données INSEE, DREES, DEPP)
4. Si le calcul est incorrect, corrige-le. Si mon analyse est fausse et que le calcul est juste, explique pourquoi et ne touche pas.
5. Après toutes les corrections, npm run build pour vérifier

## Points à auditer

### 1. TVA — Vérifier la base de consommation
Constat : La TVA semble surestimée (11 967€ pour un enseignant à 32k brut, 14 142€ pour un cadre).
Questions à vérifier :
- Quelle est la base de consommation utilisée ? Est-ce le revenu brut, le revenu net, le revenu disponible ?
- La base devrait être le revenu disponible MOINS l'épargne (taux d'épargne moyen INSEE par tranche de revenu)
- Le taux moyen de TVA est-il bien une moyenne pondérée des 4 taux (20%, 10%, 5.5%, 2.1%) selon la structure de consommation INSEE ? Pas juste 20% appliqué à tout.
- Pour un ménage, la consommation est-elle bien celle du ménage (pas doublée) ?

### 2. IR — Vérifier la décote
Constat : Le SMIC célibataire 1 part paie 148€ d'IR. Après décote, ça devrait être proche de 0€.
Questions à vérifier :
- La décote 2026 est-elle implémentée ? (seuil ~1 929€ pour célibataire, formule : décote = seuil - 0.4525 × IR brut)
- Le résultat après décote est-il bien plafonné à 0 minimum ?
- Vérifier avec le simulateur impots.gouv.fr pour un célibataire 1 part au SMIC (~21 600€ brut)

### 3. Remboursements santé — Vérifier l'individualisation
Constat : 600€ identique pour les 3 profils (SMIC célibataire, enseignant marié 2 enfants, cadre célibataire).
Questions à vérifier :
- Le montant devrait-il varier selon la taille du foyer ? (données DREES : dépense moyenne remboursée par personne × nb de personnes du foyer)
- Le montant devrait-il varier selon la fréquence de consultation déclarée dans le profil ?
- Quelle est la dépense moyenne remboursée par la Sécu par personne et par an selon la DREES ?

### 4. Services mutualisés — Vérifier par habitant vs par foyer
Constat : Santé (2 000€), Sécurité (1 230€), etc. sont identiques pour un célibataire et une famille de 4.
Questions à vérifier :
- Ces montants sont-ils par habitant dans le seed ? Si oui, il faut multiplier par le nombre de personnes du foyer.
- Vérifier le calcul : budget total de la fonction / population France = coût par habitant, puis × nb personnes du foyer
- Pour l'éducation c'est bien fait (17 040€ = 2 enfants × coût), mais les autres services semblent ne pas tenir compte de la taille du foyer

### 5. Prime d'activité — Vérifier si implémentée
Constat : Absente pour le SMIC.
Questions à vérifier :
- La prime d'activité est-elle implémentée dans le moteur de calcul ?
- Si non, l'ajouter. Un smicard célibataire touche ~100-170€/mois selon les barèmes CAF. MAIS vérifier les barèmes exacts 2026.
- Si elle est implémentée mais le profil SMIC ne remplit pas les conditions, vérifier pourquoi.

### 6. APL — Vérifier si implémentée pour les locataires
Constat : Absente pour le SMIC locataire.
Questions à vérifier :
- Le profil SMIC est-il bien marqué comme locataire ?
- Le calcul APL est-il implémenté ? Vérifie les barèmes CAF zone 1/2/3.
- Si la donnée de zone n'est pas disponible, utiliser une estimation moyenne.

### 7. Cotisations patronales — Vérifier les exonérations
Constat : Pour le SMIC (8 292€ = 38% du brut), pas d'exonération Fillon visible.
Questions à vérifier :
- L'exonération Fillon (réduction générale) est-elle implémentée ? Au SMIC elle annule quasi toutes les charges patronales.
- Si c'est un choix de modélisation de montrer le taux plein, est-ce documenté dans les tooltips ?
- Pour l'enseignant (fonctionnaire), les taux patronaux spécifiques fonction publique sont-ils utilisés ?

### 8. Allocations familiales — Vérifier le montant
Constat : 1 500€ pour l'enseignant marié 2 enfants.
Questions à vérifier :
- Les AF 2026 pour 2 enfants sont d'environ 141€/mois = 1 692€/an (vérifier le montant exact selon les barèmes CAF 2026)
- Le montant est-il modulé selon les revenus ? (3 tranches depuis 2015)
- 1 500€ est-il cohérent pour un enseignant à 32k€ brut ?

## Après corrections
1. npm run build — doit passer
2. npm run dev — tester les 3 profils (SMIC, Enseignant, Cadre) en mode découverte
3. Use Playwright to navigate to http://localhost:3000/decouverte, test each profile, and verify the amounts are now coherent
4. Pour chaque correction faite, ajouter un commentaire dans le code expliquant la source utilisée

## Important
- Ne change PAS un calcul si après vérification il s'avère correct. Explique-moi pourquoi.
- Chaque correction doit citer sa source (PLF 2026, barème CAF, données INSEE, DREES, etc.)
- Si une donnée manque dans le seed/référentiel, ajoute-la avec sa source.
