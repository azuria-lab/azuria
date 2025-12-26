import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TemplateCarouselProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function TemplateCarousel({ children, title, className }: TemplateCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) {return;}
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) {return;}
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  React.useEffect(() => {
    checkScrollability();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, []);

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <h2 className="text-2xl font-semibold mb-4 text-foreground">{title}</h2>
      )}
      
      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-0 bottom-0 z-10 h-full w-16 bg-gradient-to-r from-background via-background/80 to-transparent hover:from-background/95 rounded-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onScroll={checkScrollability}
        >
          {children}
        </div>

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 bottom-0 z-10 h-full w-16 bg-gradient-to-l from-background via-background/80 to-transparent hover:from-background/95 rounded-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}

