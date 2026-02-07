import Tesseract from "tesseract.js";
import { OCRResult, OCRStatus } from "./types";

/**
 * Tesseract worker instance (singleton)
 * Initialized lazily on first use
 */
let worker: Tesseract.Worker | null = null;

/**
 * Initialize Tesseract worker with French language support
 */
async function initializeWorker(): Promise<Tesseract.Worker> {
  if (worker) {
    return worker;
  }

  worker = await Tesseract.createWorker("fra", 1, {
    logger: (m) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Tesseract]", m);
      }
    },
  });

  return worker;
}

/**
 * Terminate the Tesseract worker
 * Call this when OCR is no longer needed to free memory
 */
export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

/**
 * Perform OCR on an image buffer
 *
 * @param imageBuffer - Image data as Buffer or Uint8Array
 * @returns OCRResult with extracted text and confidence
 */
export async function performOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    const tesseractWorker = await initializeWorker();

    const {
      data: { text, confidence },
    } = await tesseractWorker.recognize(imageBuffer);

    const processingTimeMs = Date.now() - startTime;

    // Determine status based on confidence and text length
    let status: OCRStatus;
    if (confidence >= 70 && text.trim().length > 20) {
      status = "SUCCESS";
    } else if (confidence >= 40 && text.trim().length > 10) {
      status = "PARTIAL";
    } else {
      status = "FAILED";
    }

    return {
      status,
      confidence: Math.round(confidence),
      rawText: text,
      processingTimeMs,
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
  // Rough estimate: ~1 second per MB, with 2 second minimum
  const estimatedMs = Math.max(2000, (fileSizeBytes / (1024 * 1024)) * 1000);
  return Math.round(estimatedMs);
}
