import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Componente wrapper para lazy loading de seções com IntersectionObserver
 * Melhora performance em dispositivos mais fracos
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = <div className="h-96" />,
  rootMargin = '100px',
  threshold = 0.01,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) {return;}

    // Se já estiver visível, não precisa observar
    if (isVisible) {return;}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold]);

  return (
    <div ref={sectionRef} className="w-full">
      {isVisible ? children : fallback}
    </div>
  );
};

