import React, { useEffect, useState } from 'react';
import { normalizeAssetUrl, resolvePreferredWebpUrl } from '../lib/imageOptimizer';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  preferWebp?: boolean;
}

/**
 * Drop-in image renderer that preferentially serves optimized WebP assets
 * and seamlessly falls back through:
 * 1) Preferred WebP URL (e.g. /assets/.../img.webp or Unsplash ?fm=webp)
 * 2) Original source URL (e.g. /assets/.../img.png or .jpg)
 * 3) Optional fallbackSrc WebP -> raw fallbackSrc
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  preferWebp = true,
  decoding = 'async',
  onError,
  ...rest
}) => {
  const rawOriginal = normalizeAssetUrl(src);
  const preferred = preferWebp ? resolvePreferredWebpUrl(rawOriginal) : rawOriginal;

  const normalizedFallback = normalizeAssetUrl(fallbackSrc);
  const preferredFallback = normalizedFallback
    ? preferWebp
      ? resolvePreferredWebpUrl(normalizedFallback)
      : normalizedFallback
    : '';

  const candidates: string[] = [];
  if (preferred) candidates.push(preferred);
  if (rawOriginal && rawOriginal !== preferred) candidates.push(rawOriginal);
  if (preferredFallback && !candidates.includes(preferredFallback)) candidates.push(preferredFallback);
  if (normalizedFallback && !candidates.includes(normalizedFallback)) candidates.push(normalizedFallback);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [src, fallbackSrc, preferWebp]);

  const activeSrc = candidates[candidateIndex] || rawOriginal || '';

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
      return;
    }
    if (onError) {
      onError(e);
    }
  };

  return <img {...rest} src={activeSrc} decoding={decoding} onError={handleError} />;
};
