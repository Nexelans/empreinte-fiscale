import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FiscalDayData } from "@/modules/animations/types";

/**
 * POST /api/animations/share
 * Create an anonymous shareable link for an animation
 *
 * Body:
 * - data: FiscalDayData object to share
 * - expiryDays?: number (default: 7, max: 90)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { data, expiryDays = 7 } = body;

    if (!data) {
      return NextResponse.json(
        { error: "Missing data field" },
        { status: 400 }
      );
    }

    // Validate expiry days
    if (expiryDays < 1 || expiryDays > 90) {
      return NextResponse.json(
        { error: "expiryDays must be between 1 and 90" },
        { status: 400 }
      );
    }

    // Anonymize the data (Task 25.4)
    const anonymizedData = anonymizeFiscalDayData(data);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // TODO: SharedAnimation table not yet created in migration
    // For MVP, return stub response
    console.warn("[Animations] SharedAnimation table not yet implemented - returning stub");

    // Generate a placeholder ID
    const stubId = `stub-${Date.now()}`;

    // Build shareable URL (stub)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/shared/animation/${stubId}`;

    console.log(`[Animations] Would create shareable link: ${stubId}, expires ${expiresAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      shareLink: {
        id: stubId,
        url: shareUrl,
        expiresAt: expiresAt.toISOString(),
        isAnonymous: true,
        viewCount: 0,
      },
      warning: "Animation sharing is not yet fully implemented - this is a stub response",
    });
  } catch (error) {
    console.error("[Animations] Error creating shareable link:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Task 25.4: Anonymization logic
 * Remove personal information and round amounts
 */
function anonymizeFiscalDayData(data: FiscalDayData): FiscalDayData {
  const anonymized = { ...data };

  // Remove user ID
  anonymized.userId = "anonymous";

  // Round all amounts to nearest 5€
  anonymized.scenes = anonymized.scenes.map((scene) => ({
    ...scene,
    totalSpent: scene.totalSpent ? roundToNearest5(scene.totalSpent) : undefined,
    taxes: scene.taxes.map((tax) => ({
      ...tax,
      amount: roundToNearest5(tax.amount),
      label: makeGeneric(tax.label),
    })),
    servicesReceived: scene.servicesReceived?.map((service) => ({
      ...service,
      value: roundToNearest5(service.value),
      label: makeGeneric(service.label),
    })),
  }));

  // Round summary amounts
  anonymized.summary = {
    ...anonymized.summary,
    totalSpent: roundToNearest5(anonymized.summary.totalSpent),
    totalTaxes: roundToNearest5(anonymized.summary.totalTaxes),
    totalServicesReceived: roundToNearest5(anonymized.summary.totalServicesReceived),
    netContribution: roundToNearest5(anonymized.summary.netContribution),
    taxBreakdown: Object.fromEntries(
      Object.entries(anonymized.summary.taxBreakdown).map(([key, value]) => [
        key,
        roundToNearest5(value),
      ])
    ),
    servicesBreakdown: Object.fromEntries(
      Object.entries(anonymized.summary.servicesBreakdown).map(([key, value]) => [
        key,
        roundToNearest5(value),
      ])
    ),
  };

  return anonymized;
}

/**
 * Round to nearest 5€ for privacy
 */
function roundToNearest5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Make labels generic (remove specific details)
 */
function makeGeneric(label: string): string {
  // Remove specific percentages in parentheses
  return label.replace(/\([^)]+%\)/g, "");
}

/**
 * GET /api/animations/share/:id
 * Retrieve a shared animation (handled by separate route)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: "/api/animations/share",
    method: "POST",
    description: "Create an anonymous shareable link for an animation",
    body: {
      data: "FiscalDayData object",
      expiryDays: "number (optional, default: 7, max: 90)",
    },
    anonymization: {
      userId: "Removed",
      amounts: "Rounded to nearest 5€",
      labels: "Generic (percentages removed)",
    },
  });
}
