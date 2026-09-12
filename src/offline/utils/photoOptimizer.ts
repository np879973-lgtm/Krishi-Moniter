// Photo Compression & Optimization Utility for Krishi Mentor (Part 8)
// Balances low bandwidth constraints with agricultural diagnostic fidelity

import { LocalAttachment } from '../types';
import { saveAttachment } from '../storage/repositories/attachmentRepository';

export interface OptimizePhotoOptions {
  maxDimension?: number;
  quality?: number; // 0.1 - 1.0
  lowDataMode?: boolean;
}

export interface OptimizedPhotoResult {
  attachmentId: string;
  originalDataUri: string;
  optimizedDataUri: string;
  byteSize: number;
  width: number;
  height: number;
}

/**
 * Optimizes an image for local storage and bandwidth-constrained transmission.
 * Preserves high diagnostic fidelity (leaf margins, pustules, lesions, insect damage).
 */
export async function optimizeCropImage(
  dataUri: string,
  options: OptimizePhotoOptions = {}
): Promise<OptimizedPhotoResult> {
  const isLowData = options.lowDataMode ?? false;
  const maxDim = options.maxDimension || (isLowData ? 1024 : 1600);
  const quality = options.quality || (isLowData ? 0.65 : 0.82);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional scaling
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback: return uncompressed
        resolve({
          attachmentId: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalDataUri: dataUri,
          optimizedDataUri: dataUri,
          byteSize: Math.round((dataUri.length * 3) / 4),
          width: img.width,
          height: img.height,
        });
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedUri = canvas.toDataURL('image/jpeg', quality);
      const byteSize = Math.round((optimizedUri.length * 3) / 4);
      const attachmentId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      resolve({
        attachmentId,
        originalDataUri: dataUri,
        optimizedDataUri: optimizedUri,
        byteSize,
        width,
        height,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load crop image for optimization'));
    };

    img.src = dataUri;
  });
}

/**
 * Creates and stores a local attachment record before queueing
 */
export async function storeLocalAttachment(params: {
  dataUri: string;
  fileName?: string;
  caseId?: string;
  lowDataMode?: boolean;
}): Promise<LocalAttachment> {
  const optimized = await optimizeCropImage(params.dataUri, {
    lowDataMode: params.lowDataMode,
  });

  const attachment: LocalAttachment = {
    attachmentId: optimized.attachmentId,
    caseId: params.caseId,
    fileName: params.fileName || `crop-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
    localDataUri: optimized.originalDataUri,
    optimizedDataUri: optimized.optimizedDataUri,
    byteSize: optimized.byteSize,
    capturedAt: Date.now(),
    status: 'LOCAL_ONLY',
  };

  await saveAttachment(attachment);
  return attachment;
}
