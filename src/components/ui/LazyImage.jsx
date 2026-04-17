import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';

export function LazyImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  placeholderClassName = '',
  fallbackSrc,
  width,
  height,
  ...props
}) {
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image || !currentSrc) {
      return;
    }

    if (image.complete) {
      if (image.naturalWidth > 0) {
        handleLoad();
      } else {
        handleError();
      }
    }
  }, [currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    setIsLoaded(true);
    setHasError(true);
  };

  const renderPlaceholder = () => (
    <div
      className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ${placeholderClassName}`}
      aria-hidden="true"
    >
      <ImageIcon className="h-6 w-6" />
    </div>
  );

  const shouldShowPlaceholder = !isLoaded || hasError;
  const imageClass = `${className} ${isLoaded && !hasError ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-out`;

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ width, height, minHeight: height ? undefined : 64 }}
    >
      {shouldShowPlaceholder && renderPlaceholder()}

      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={imageClass}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        {...props}
      />
    </div>
  );
}
