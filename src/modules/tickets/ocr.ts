import { OCRResult } from "./types";

/**
 * Perform OCR on an image buffer
 *
 * MVP Implementation: Skips real OCR (tesseract.js has issues in Next.js server-side)
 * Instead, returns a PARTIAL status prompting the user to manually enter ticket details
 *
 * Future enhancement: Implement client-side OCR or use a cloud OCR service
 *
 * @param imageBuffer - Image data as Buffer or Uint8Array
 * @returns OCRResult with status prompting manual entry
 */
export async function performOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    // MVP: Skip actual OCR processing
    // The user will manually enter the ticket details while viewing the image

    const processingTimeMs = Date.now() - startTime;

    return {
      status: "PARTIAL",
      confidence: 0,
      rawText: "",
      processingTimeMs,
      error: "OCR automatique désactivé pour le MVP. Veuillez saisir les informations manuellement.",
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    console.error("[performOCR] Error:", error);

    return {
      status: "FAILED",
      confidence: 0,
      rawText: "",
      processingTimeMs,
      error: error instanceof Error ? error.message : "OCR failed",
    };
  }
}

/**
 * Preprocess image for better OCR results
 * This is a placeholder for future image preprocessing
 * (e.g., deskewing, contrast enhancement, noise reduction)
 *
 * @param imageBuffer - Original image buffer
 * @returns Preprocessed image buffer
 */
export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  // For now, return original buffer
  // Future: implement image preprocessing with sharp or jimp
  return imageBuffer;
}

/**
 * Estimate OCR processing time based on image size
 *
 * @param fileSizeBytes - Size of image file in bytes
 * @returns Estimated processing time in milliseconds
 */
export function estimateProcessingTime(fileSizeBytes: number): number {
  // Since we're skipping OCR, processing is instant
  return 100;
}
