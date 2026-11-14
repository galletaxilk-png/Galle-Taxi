/**
 * Client-side automatic image compression & WebP conversion utility.
 * Converts uploaded JPG, PNG, and other raster images into optimized WebP on the fly
 * while preserving PNG alpha transparency and enforcing safe size budgets.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  maxBytes?: number;
}

export interface OptimizedImageResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
}

function toWebpFileName(originalName: string, mimeType: string): string {
  const base = (originalName || 'image')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^_+|_+$/g, '') || 'image';
  const ext =
    mimeType === 'image/webp'
      ? 'webp'
      : mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/svg+xml'
      ? 'svg'
      : 'jpg';
  return `${base}.${ext}`;
}

function estimateBase64Bytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return dataUrl.length;
  const b64 = dataUrl.slice(commaIdx + 1);
  return Math.floor((b64.length * 3) / 4);
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    } catch {
      resolve(null);
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

async function decodeImageSource(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  // Prefer createImageBitmap for fast native decoding & automatic EXIF orientation handling
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width || 1200,
        height: bitmap.height || 800,
        cleanup: () => {
          try {
            bitmap.close();
          } catch {
            // ignore
          }
        },
      };
    } catch {
      // Fall back to HTMLImageElement
    }
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Timed out while decoding uploaded image.'));
      }
    }, 15000);

    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        source: img,
        width: img.naturalWidth || img.width || 1200,
        height: img.naturalHeight || img.height || 800,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };

    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode uploaded image file.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Automatically compresses and converts any uploaded JPG/PNG/WebP/raster image into
 * an optimized WebP format on the fly, returning both a Blob/File (for storage/disk uploads)
 * and a compressed WebP Data URL (for instant previews and Firestore/API persistence).
 */
export async function optimizeImageToWebP(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 960,
    initialQuality = 0.84,
    minQuality = 0.56,
    maxBytes = 220 * 1024,
  } = options;

  // Keep SVG vector logos/icons as crisp SVG
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const dataUrl = await blobToDataUrl(file);
    return {
      dataUrl,
      blob: file,
      file,
      fileName: toWebpFileName(file.name, 'image/svg+xml'),
      mimeType: 'image/svg+xml',
      width: 0,
      height: 0,
      originalBytes: file.size,
      optimizedBytes: file.size,
    };
  }

  const decoded = await decodeImageSource(file);

  try {
    let targetW = Math.max(10, decoded.width);
    let targetH = Math.max(10, decoded.height);

    // Constrain within maxWidth x maxHeight preserving aspect ratio
    if (targetW > maxWidth) {
      targetH = Math.round((targetH * maxWidth) / targetW);
      targetW = maxWidth;
    }
    if (targetH > maxHeight) {
      targetW = Math.round((targetW * maxHeight) / targetH);
      targetH = maxHeight;
    }
    targetW = Math.max(10, targetW);
    targetH = Math.max(10, targetH);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(decoded.source, 0, 0, targetW, targetH);

    // Encode to WebP (with transparency preserved) and step quality/dimensions if over maxBytes
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    let bestDataUrl = '';
    let bestBlob: Blob | null = null;
    let currentCanvas = canvas;
    let currentW = targetW;
    let currentH = targetH;
    let activeMime = 'image/webp';

    for (let scalePass = 0; scalePass < 4; scalePass++) {
      let quality = initialQuality;

      for (let qPass = 0; qPass < 3; qPass++) {
        const testDataUrl = currentCanvas.toDataURL('image/webp', quality);
        if (testDataUrl.startsWith('data:image/webp')) {
          activeMime = 'image/webp';
          bestDataUrl = testDataUrl;
          bestBlob = await canvasToBlob(currentCanvas, 'image/webp', quality);
        } else {
          // Rare browser fallback if WebP canvas encoding is unsupported
          activeMime = isPng ? 'image/png' : 'image/jpeg';
          bestDataUrl = isPng
            ? currentCanvas.toDataURL('image/png')
            : currentCanvas.toDataURL('image/jpeg', quality);
          bestBlob = await canvasToBlob(currentCanvas, activeMime, quality);
        }

        const byteSize = bestBlob ? bestBlob.size : estimateBase64Bytes(bestDataUrl);
        if (byteSize <= maxBytes) {
          const finalFileName = toWebpFileName(file.name, activeMime);
          const finalBlob = bestBlob || file;
          const finalFile = new File([finalBlob], finalFileName, {
            type: activeMime,
            lastModified: Date.now(),
          });
          return {
            dataUrl: bestDataUrl,
            blob: finalBlob,
            file: finalFile,
            fileName: finalFileName,
            mimeType: activeMime,
            width: currentW,
            height: currentH,
            originalBytes: file.size,
            optimizedBytes: byteSize,
          };
        }

        if (quality <= minQuality) break;
        quality = Math.max(minQuality, Number((quality - 0.12).toFixed(2)));
      }

      // Downscale slightly and retry if still above byte budget
      if (scalePass < 3) {
        const nextW = Math.max(240, Math.round(currentW * 0.78));
        const nextH = Math.max(160, Math.round(currentH * 0.78));
        if (nextW === currentW && nextH === currentH) break;

        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = nextW;
        nextCanvas.height = nextH;
        const nextCtx = nextCanvas.getContext('2d', { alpha: true });
        if (!nextCtx) break;
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.clearRect(0, 0, nextW, nextH);
        nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);
        currentCanvas = nextCanvas;
        currentW = nextW;
        currentH = nextH;
      }
    }

    // Return the most optimized result achieved
    const finalFileName = toWebpFileName(file.name, activeMime);
    const finalBlob = bestBlob || file;
    const finalBytes = bestBlob ? bestBlob.size : estimateBase64Bytes(bestDataUrl);
    const finalFile = new File([finalBlob], finalFileName, {
      type: activeMime,
      lastModified: Date.now(),
    });

    return {
      dataUrl: bestDataUrl,
      blob: finalBlob,
      file: finalFile,
      fileName: finalFileName,
      mimeType: activeMime,
      width: currentW,
      height: currentH,
      originalBytes: file.size,
      optimizedBytes: finalBytes,
    };
  } finally {
    decoded.cleanup();
  }
}
