import { WizardStep } from "@/modules/profil/types";

interface WizardProgressProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

const steps = [
  { number: 1, label: "Situation" },
  { number: 2, label: "Revenus" },
  { number: 3, label: "Patrimoine" },
  { number: 4, label: "Consommation" },
  { number: 5, label: "Famille & Services" },
];

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
        {/* Progress bar fill */}
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isAccessible = step.number <= currentStep;

          return (
            <button
              key={step.number}
              onClick={() => isAccessible && onStepClick(step.number as WizardStep)}
              disabled={!isAccessible}
              className={`
                flex flex-col items-center focus:outline-none group
                ${isAccessible ? "cursor-pointer" : "cursor-not-allowed"}
              `}
            >
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-300 border-2
                  ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 scale-110"
                      : isCompleted
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-400 border-gray-300"
                  }
                  ${isAccessible && !isCurrent ? "group-hover:border-blue-400" : ""}
                `}
              >
                {isCompleted ? "✓" : step.number}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-2 text-xs sm:text-sm font-medium text-center
                  ${isCurrent ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
