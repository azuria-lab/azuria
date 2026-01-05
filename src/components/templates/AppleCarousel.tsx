import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppleCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppleCarousel({ children, className }: AppleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) {return;}
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) {return;}
    const cardWidth = 320 + 16; // card width + gap
    const scrollAmount = cardWidth * 2; // scroll 2 cards at a time
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  useEffect(() => {
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
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-0 bottom-0 z-10 h-full w-12 bg-gradient-to-r from-white dark:from-gray-900 via-white/90 dark:via-gray-900/90 to-transparent hover:from-white/95 dark:hover:from-gray-900/95 rounded-none"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-gray-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={checkScrollability}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="snap-start">
            {child}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 bottom-0 z-10 h-full w-12 bg-gradient-to-l from-white dark:from-gray-900 via-white/90 dark:via-gray-900/90 to-transparent hover:from-white/95 dark:hover:from-gray-900/95 rounded-none"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5 text-gray-900 dark:text-gray-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]" />
        </Button>
      )}
    </div>
  );
}

