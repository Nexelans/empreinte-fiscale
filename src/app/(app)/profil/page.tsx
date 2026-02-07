"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Situation } from "@/components/wizard/Step1Situation";
import { Step2Revenus } from "@/components/wizard/Step2Revenus";
import { Step3Patrimoine } from "@/components/wizard/Step3Patrimoine";
import { Step4Consommation } from "@/components/wizard/Step4Consommation";
import { Step5FamilleServices } from "@/components/wizard/Step5FamilleServices";
import { ProfilFiscalComplete, WizardStep } from "@/modules/profil/types";
import { Button } from "@/components/ui/button";

export default function ProfilWizardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [profilData, setProfilData] = useState<Partial<ProfilFiscalComplete> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profil on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadProfil();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Auto-calculate nombre de parts when statut or children change
  useEffect(() => {
    if (!profilData || isLoading) return;

    const statut = profilData.situation?.statut;
    const nombreEnfants = profilData.familleServices?.nombreEnfants || 0;

    if (statut) {
      let calculatedParts = statut === "marie_pacse" ? 2 : 1;

      // Add parts for children (French tax rules)
      if (nombreEnfants === 1) {
        calculatedParts += 0.5;
      } else if (nombreEnfants === 2) {
        calculatedParts += 1.0; // 0.5 + 0.5
      } else if (nombreEnfants >= 3) {
        calculatedParts += 1.0 + (nombreEnfants - 2) * 1.0;
      }

      // Only update if different from current value (to avoid override if manually changed)
      if (profilData.situation?.nombreParts !== calculatedParts) {
        setProfilData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            situation: {
              ...prev.situation,
              statut: prev.situation?.statut || null,
              commune: prev.situation?.commune || null,
              age: prev.situation?.age || null,
              nombreParts: calculatedParts,
            },
          };
        });
      }
    }
  }, [profilData?.situation?.statut, profilData?.familleServices?.nombreEnfants, isLoading]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (!profilData || isLoading) return;

    const timeout = setTimeout(() => {
      saveProfil(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [profilData]);

  const loadProfil = async () => {
    try {
      const response = await fetch("/api/profil");
      if (response.ok) {
        const data = await response.json();
        setProfilData(data);
        setCurrentStep(data.wizardStep || 1);
      } else {
        // Initialize empty profil
        setProfilData({
          wizardStep: 1,
          isComplete: false,
          situation: { statut: null, nombreParts: null, commune: null, age: null },
          revenus: {
            salaireBrut: null,
            salaireNet: null,
            typeContrat: null,
            revenusFonciers: null,
            revenusCapitaux: null,
            autresRevenus: null,
          },
          patrimoine: {
            proprietaire: null,
            valeurLocative: null,
            taxeFonciere: null,
            vehicules: [],
            patrimoineIFI: null,
          },
          consommation: {
            mode: null,
          },
          familleServices: {
            nombreEnfants: 0,
            enfants: [],
            frequenceServices: {
              transportsCommun: "jamais",
              hopitalMedecin: "jamais",
              bibliotheque: "jamais",
              equipementsSportifs: "jamais",
            },
            aides: {
              caf: false,
              apl: false,
              rsa: false,
              bourses: false,
              chomage: false,
              cmuc: false,
            },
          },
          statusData: {},
        });
      }
    } catch (error) {
      console.error("Error loading profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfil = async (showFeedback = false) => {
    if (!profilData || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profilData,
          wizardStep: currentStep,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profil");
      }

      if (showFeedback) {
        // Could show a toast notification here
        console.log("Profil saved successfully");
      }
    } catch (error) {
      console.error("Error saving profil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfilData = (field: keyof ProfilFiscalComplete, value: any) => {
    setProfilData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
    saveProfil(true);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      const nextStepNum = (currentStep + 1) as WizardStep;
      goToStep(nextStepNum);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      const prevStepNum = (currentStep - 1) as WizardStep;
      goToStep(prevStepNum);
    }
  };

  const completeProfil = async () => {
    if (!profilData) return;

    setIsSaving(true);
    try {
      // Prepare the completed profil data
      const completedProfilData = {
        ...profilData,
        isComplete: true,
        lastCompletedAt: new Date(),
        wizardStep: 5,
      };

      // Save directly with completed flag
      const response = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completedProfilData),
      });

      if (!response.ok) {
        throw new Error("Failed to complete profil");
      }

      console.log("✅ Profil completed successfully!");

      // Update local state
      setProfilData(completedProfilData);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing profil:", error);
      alert("Erreur lors de la finalisation du profil. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profilData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil Fiscal</h1>
          <p className="text-gray-600">
            Complétez votre profil pour obtenir votre score fiscal personnalisé
          </p>
          {isSaving && (
            <p className="text-sm text-blue-600 mt-2">💾 Sauvegarde automatique...</p>
          )}
        </div>

        {/* Progress */}
        <WizardProgress currentStep={currentStep} onStepClick={goToStep} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          {currentStep === 1 && (
            <Step1Situation
              data={profilData.situation || { statut: null, nombreParts: null, commune: null, age: null }}
              onChange={(data) => updateProfilData("situation", data)}
            />
          )}
          {currentStep === 2 && (
            <Step2Revenus
              data={profilData.revenus || {
                salaireBrut: null,
                salaireNet: null,
                typeContrat: null,
                revenusFonciers: null,
                revenusCapitaux: null,
                autresRevenus: null,
              }}
              onChange={(data) => updateProfilData("revenus", data)}
            />
          )}
          {currentStep === 3 && (
            <Step3Patrimoine
              data={profilData.patrimoine || {
                proprietaire: null,
                valeurLocative: null,
                taxeFonciere: null,
                vehicules: [],
                patrimoineIFI: null,
              }}
              onChange={(data) => updateProfilData("patrimoine", data)}
            />
          )}
          {currentStep === 4 && (
            <Step4Consommation
              data={profilData.consommation || { mode: null }}
              onChange={(data) => updateProfilData("consommation", data)}
            />
          )}
          {currentStep === 5 && (
            <Step5FamilleServices
              data={profilData.familleServices || {
                nombreEnfants: 0,
                enfants: [],
                frequenceServices: {
                  transportsCommun: "jamais",
                  hopitalMedecin: "jamais",
                  bibliotheque: "jamais",
                  equipementsSportifs: "jamais",
                },
                aides: {
                  caf: false,
                  apl: false,
                  rsa: false,
                  bourses: false,
                  chomage: false,
                  cmuc: false,
                },
              }}
              onChange={(data) => updateProfilData("familleServices", data)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
          >
            ← Précédent
          </Button>

          {currentStep < 5 ? (
            <Button onClick={nextStep} disabled={isSaving}>Suivant →</Button>
          ) : (
            <Button onClick={completeProfil} disabled={isSaving}>
              {isSaving ? "Finalisation..." : "Terminer et voir mon score"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
