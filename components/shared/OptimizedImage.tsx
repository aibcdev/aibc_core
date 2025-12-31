import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
}

/**
 * OptimizedImage - Image component with lazy loading, WebP/AVIF support, and blur placeholder
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  priority = false,
  sizes,
  aspectRatio,
  className = '',
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState<string | undefined>(blurDataURL || placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    // Try to load WebP/AVIF versions first
    const image = new Image();
    
    // Check if browser supports AVIF
    const supportsAVIF = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    // Check if browser supports WebP
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

    // Determine best format
    let optimizedSrc = src;
    if (supportsAVIF) {
      // Try AVIF first (best compression)
      const avifSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
      optimizedSrc = avifSrc;
    } else if (supportsWebP) {
      // Fallback to WebP
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      optimizedSrc = webpSrc;
    }

    image.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoaded(true);
    };

    image.onerror = () => {
      // Fallback to original if optimized version fails
      setImageSrc(src);
      setIsLoaded(true);
    };

    image.src = optimizedSrc;
  }, [isInView, src]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && {
      aspectRatio,
    }),
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0.5,
    filter: isLoaded ? 'none' : blurDataURL ? 'blur(10px)' : 'none',
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    display: isLoaded ? 'none' : 'block',
    ...(blurDataURL && {
      backgroundImage: `url(${blurDataURL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(10px)',
    }),
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {!isLoaded && <div style={placeholderStyle} aria-hidden="true" />}
      <img
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={imageStyle}
        sizes={sizes}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;




