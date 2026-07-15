import { useState, useEffect } from "react";

interface AIImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AIImage({ src, alt, className }: AIImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retries, setRetries] = useState(0);
  const [loading, setLoading] = useState(true);

  // If the initial src changes from the parent, reset our state
  useEffect(() => {
    setCurrentSrc(src);
    setRetries(0);
    setLoading(true);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={`${className} ${loading ? 'animate-pulse bg-[#111]' : ''}`}
      onLoad={() => setLoading(false)}
      onError={() => {
        // Pollinations can return 429 Too Many Requests if we ask for too many images at once.
        // We stagger retries progressively to allow the AI queue to clear.
        if (retries < 4) {
          const delay = 2000 * (retries + 1) + Math.random() * 1000;
          setTimeout(() => {
            setRetries(r => r + 1);
            // Append a retry parameter to bust browser cache and force a new request
            setCurrentSrc(`${src}&retry=${retries + 1}`);
          }, delay);
        } else {
          setLoading(false);
        }
      }}
    />
  );
}
