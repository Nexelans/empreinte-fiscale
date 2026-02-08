## Purpose

Extension de la couche pédagogique avec quiz personnalisés basés sur les vraies données de l'utilisateur et intégration des explications d'achievements.

## MODIFIED Requirements

### Requirement: Quiz fiscal personnalisé basé sur les vraies données

The system SHALL generate quiz questions using the user's real fiscal data for personalized learning.

#### Scenario: Generate personalized question
- **WHEN** user starts personalized quiz mode
- **THEN** system generates question using user's actual score data (e.g., "Vous avez payé 3 456€ d'IR cette année. À quelle tranche maximale appartenez-vous ?")

#### Scenario: Use real amounts in questions
- **WHEN** generating question about TVA
- **THEN** system uses user's actual total TVA from journal entries (e.g., "Vous avez payé 1 234€ de TVA ce mois-ci. Quel pourcentage de vos dépenses cela représente-t-il ?")

#### Scenario: Use real services in questions
- **WHEN** user has children in school
- **THEN** system generates education-related questions (e.g., "Vos enfants bénéficient de 7 510€ de services éducatifs publics. Quel est le coût annuel moyen d'un élève en collège ?")

#### Scenario: Adapt difficulty to profile
- **WHEN** user has high confidence score (>80%)
- **THEN** system generates harder questions using precise data from verified sources

#### Scenario: Skip impossible questions
- **WHEN** user has no children
- **THEN** system skips questions about education benefits

### Requirement: Achievement explanations linked to glossary

The system SHALL display pedagogical explanations when users earn badges or complete challenges.

#### Scenario: Badge earned with glossary link
- **WHEN** user earns "🛣️ Bâtisseur" badge
- **THEN** system displays explanation "Vous avez financé 200m de routes ! Cela représente votre part de contribution à l'infrastructure publique" with glossary term "infrastructure" highlighted

#### Scenario: Challenge completed with learning
- **WHEN** user completes challenge "Upload your avis d'imposition"
- **THEN** system displays educational tip: "Saviez-vous que l'IR est calculé par tranches progressives ?" with tooltip on "tranches progressives"

#### Scenario: Click glossary term in achievement
- **WHEN** user clicks on glossary term in badge explanation
- **THEN** system opens full definition panel from glossary

### Requirement: Quiz results show related glossary terms

The system SHALL suggest related glossary terms after quiz completion based on wrong answers.

#### Scenario: Wrong answer on IR question
- **WHEN** user answers incorrectly on IR tranche question
- **THEN** results screen displays "Pour mieux comprendre : Quotient familial, Tranches d'imposition, Décote" with clickable glossary tooltips

#### Scenario: Multiple wrong answers in same category
- **WHEN** user has 3 wrong answers in category "impots_directs"
- **THEN** results screen suggests "Approfondissez vos connaissances" with 5 relevant glossary terms

### Requirement: Panel displays quiz opportunities

The system SHALL show quiz suggestions in explanation panels when user views fiscal items.

#### Scenario: Quiz CTA in IR panel
- **WHEN** user views impotRevenu explanation panel
- **THEN** panel displays "🎯 Testez vos connaissances sur l'impôt sur le revenu" button

#### Scenario: Click quiz CTA
- **WHEN** user clicks quiz CTA button
- **THEN** system starts focused quiz with 5 questions about that specific topic

### Requirement: Personalized quiz history tracking

The system SHALL track user's quiz performance over time to adapt question difficulty.

#### Scenario: Track quiz attempts
- **WHEN** user completes any quiz
- **THEN** system saves QuizAttempt record with questions, answers, score, timestamp

#### Scenario: View quiz history
- **WHEN** user navigates to quiz page
- **THEN** system displays "Vos précédents quiz" section with scores and dates

#### Scenario: Adaptive difficulty
- **WHEN** user has completed 5+ quizzes with average score >80%
- **THEN** system automatically increases question difficulty for next quiz

### Requirement: Real-time learning feedback

The system SHALL provide instant educational feedback during quiz with glossary integration.

#### Scenario: Instant explanation with glossary
- **WHEN** user answers question (correct or wrong)
- **THEN** system displays immediate explanation with glossary terms highlighted as tooltips

#### Scenario: Deep dive from quiz explanation
- **WHEN** user clicks "En savoir plus" in quiz explanation
- **THEN** system opens full detail panel with formula, sources, calculation steps

### Requirement: Social quiz challenges

The system SHALL allow users to challenge friends with personalized quiz based on their own data.

#### Scenario: Generate shareable quiz
- **WHEN** user clicks "Défier un ami" after completing quiz
- **THEN** system generates shareable link with anonymized version of personalized questions

#### Scenario: Friend accepts quiz challenge
- **WHEN** friend clicks challenge link
- **THEN** system presents same questions with comparison scoring at the end

#### Scenario: Challenge results with learning
- **WHEN** both users complete challenge quiz
- **THEN** system displays side-by-side scores and educational summary for both participants

### Requirement: Gamification integration

The system SHALL award XP and badges for quiz performance.

#### Scenario: Award XP for quiz completion
- **WHEN** user completes any quiz
- **THEN** system awards XP based on score (50 XP base + 10 XP per correct answer)

#### Scenario: Perfect score badge
- **WHEN** user achieves 100% on any quiz
- **THEN** system awards "🎓 Expert fiscal" badge

#### Scenario: Streak tracking
- **WHEN** user completes daily quiz for 7 consecutive days
- **THEN** system increments quiz streak counter and awards bonus XP
