"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTerme } from "@/modules/pedagogie/glossaire";

interface FiscalTooltipProps {
  terme: string;
  children: ReactNode;
}

/**
 * Tooltip pédagogique affichant la définition d'un terme fiscal
 * Usage: <FiscalTooltip terme="impot_revenu">Impôt sur le revenu</FiscalTooltip>
 */
export function FiscalTooltip({ terme, children }: FiscalTooltipProps) {
  const definition = getTerme(terme);

  if (!definition) {
    // Si le terme n'existe pas dans le glossaire, afficher juste le texte
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-blue-500 cursor-help">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{definition.terme}</h4>
            <p className="text-sm text-gray-700">{definition.definition}</p>
            {definition.exemple && (
              <p className="text-xs text-gray-600 italic">
                <strong>Exemple :</strong> {definition.exemple}
              </p>
            )}
            {definition.source && (
              <p className="text-xs text-gray-500">
                <strong>Source :</strong> {definition.source}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
