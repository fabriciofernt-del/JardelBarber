import React, { useState, useEffect } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const ImageFallback = ({ src, alt, className, fallback = 'https://via.placeholder.com/400x300/333/fff?text=Serviço' }: ImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className || 'w-full h-64 object-cover rounded-lg'}
      onError={(e) => (e.currentTarget.src = fallback)}
      loading="lazy"
    />
  );
};