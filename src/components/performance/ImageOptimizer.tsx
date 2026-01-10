/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: string;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

interface LazyImageProps extends ImageOptimizerProps {
  threshold?: number;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallback = '/placeholder.svg',
  placeholder = 'blur',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallback);
    onError?.();
  };

  useEffect(() => {
    if (priority) {
      setCurrentSrc(src);
    }
  }, [src, priority]);

  // Otimizar URL se for do Unsplash
  const optimizeImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') {
      return '';
    }

    // First, check for dangerous patterns in the raw string (before URL parsing)
    // This catches malformed URLs that might bypass URL() constructor
    const dangerousPatterns = [
      /\bjavascript\s*:\s*/i,
      /\bvbscript\s*:\s*/i,
      /\bfile\s*:\s*\/\/\/?/i,
      /\bdata\s*:\s*text\/html/i  // Block data URLs with HTML content
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(url)) {
        // eslint-disable-next-line no-console
        console.warn('Dangerous URL pattern detected');
        return '';
      }
    }

    // Validate URL scheme with proper URL parsing
    try {
      // Handle relative URLs first
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        // Relative URLs are safe, but validate they don't contain dangerous substrings
        if (!dangerousPatterns.some(p => p.test(url))) {
          return url;
        }
        return '';
      }

      // Parse absolute URLs
      const urlObj = new URL(url);
      
      // Only allow http, https, and safe data URLs (for base64 images)
      const allowedSchemes = ['http:', 'https:'];
      const allowedDataSchemes = ['data:image/'];
      
      if (allowedSchemes.includes(urlObj.protocol)) {
        // HTTP/HTTPS URLs are safe
        // Check hostname from parsed URL object instead of string substring (more secure)
        if (urlObj.hostname === 'unsplash.com' || urlObj.hostname.endsWith('.unsplash.com')) {
          const params = new URLSearchParams();
          if (width) {params.set('w', width.toString());}
          if (height) {params.set('h', height.toString());}
          params.set('fit', 'crop');
          params.set('crop', 'center');
          params.set('auto', 'format,compress');
          params.set('q', '85');
          
          return `${url.split('?')[0]}?${params.toString()}`;
        }
        return url;
      } else if (urlObj.protocol === 'data:' && allowedDataSchemes.some(scheme => url.toLowerCase().startsWith(scheme))) {
        // Only allow data URLs for images
        return url;
      } else {
        // eslint-disable-next-line no-console
        console.warn('Invalid URL scheme:', urlObj.protocol);
        return '';
      }
    } catch (_e) {
      // URL parsing failed - likely invalid format
      // eslint-disable-next-line no-console
      console.warn('Invalid URL format');
      return '';
    }
  };

  const optimizedSrc = currentSrc ? optimizeImageUrl(currentSrc) : '';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {placeholder === 'blur' && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
      
      {!isLoaded && !hasError && !optimizedSrc && (
        <div 
          className="flex items-center justify-center bg-muted text-muted-foreground"
          style={{ width, height }}
        >
          Carregando...
        </div>
      )}
    </div>
  );
};

const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 0.1,
  priority = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isVisible) {return;}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, priority, isVisible]);

  return (
    <div ref={imgRef}>
      {isVisible ? (
        <ImageOptimizer {...props} priority={priority} />
      ) : (
        <div 
          className={cn('bg-muted animate-pulse', props.className)}
          style={{ width: props.width, height: props.height }}
        />
      )}
    </div>
  );
};

// Progressive JPEG/WebP loader
const ProgressiveImage: React.FC<ImageOptimizerProps & { 
  lowQualitySrc?: string;
  webpSrc?: string;
}> = ({
  src,
  lowQualitySrc,
  webpSrc,
  alt,
  className,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || '');
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    // Carregar imagem de alta qualidade em background
    const img = new Image();
    
    // Preferir WebP se suportado
    const targetSrc = webpSrc && supportsWebP() ? webpSrc : src;
    
    img.onload = () => {
      setCurrentSrc(targetSrc);
      setIsHighQualityLoaded(true);
    };
    
    img.src = targetSrc;
  }, [src, webpSrc]);

  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  return (
    <div className={cn('relative', className)}>
      {lowQualitySrc && !isHighQualityLoaded && (
        <ImageOptimizer
          src={lowQualitySrc}
          alt={alt}
          className={cn('filter blur-sm scale-110', className)}
          {...props}
        />
      )}
      
      <ImageOptimizer
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-500',
          isHighQualityLoaded ? 'opacity-100' : 'opacity-0',
          lowQualitySrc && !isHighQualityLoaded && 'absolute inset-0',
          className
        )}
        {...props}
      />
    </div>
  );
};

// Hook para precarregar imagens
export const useImagePreloader = (urls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadImages = urls.map(url => {
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(url); // Resolve anyway to continue
        img.src = url;
      });
    });

    Promise.all(loadImages).then(loaded => {
      setLoadedImages(new Set(loaded));
    });
  }, [urls]);

  return loadedImages;
};

// Batch image loader para galleries
export const useBatchImageLoader = (urls: string[], batchSize = 3) => {
  const [loadedBatches, setLoadedBatches] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = async () => {
    if (isLoading || loadedBatches * batchSize >= urls.length) {return;}

    setIsLoading(true);
    
    const nextBatch = urls.slice(
      loadedBatches * batchSize,
      (loadedBatches + 1) * batchSize
    );

    // Precarregar próximo lote
    await Promise.all(nextBatch.map(url => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = url;
      });
    }));

    setLoadedBatches(prev => prev + 1);
    setIsLoading(false);
  };

  const visibleUrls = urls.slice(0, loadedBatches * batchSize);

  return {
    visibleUrls,
    loadNextBatch,
    isLoading,
    hasMore: loadedBatches * batchSize < urls.length
  };
};

export { ImageOptimizer, LazyImage, ProgressiveImage };
export default ImageOptimizer;