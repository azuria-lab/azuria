import { TooltipContent, TooltipProvider, Tooltip as TooltipRoot, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  title?: string;
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

// Tooltip ainda mais sutil, anima delay, sombra e transição leve.
export const TutorialTooltip = ({
  title,
  content,
  children,
  side = "right",
  align = "center",
  contentClassName,
}: TooltipProps) => (
  <TooltipProvider>
    <TooltipRoot delayDuration={450}>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="relative group inline-flex items-center outline-none">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side={side}
        align={align}
        className={cn(
          "max-w-xs space-y-1 shadow-smooth rounded-md bg-white/95 border border-brand-100/60 text-gray-800 opacity-95 ring-1 ring-brand-100/60 backdrop-blur-[2px] z-50 px-3 py-2",
          "transition-all duration-200 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto scale-95 group-hover:scale-100 group-focus-within:scale-100",
          contentClassName
        )}
        aria-label={title || content}
      >
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-xs mt-1 leading-snug">{content}</p>
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
);

// Alias export to support existing imports like `import { Tooltip } from "@/components/ui/TutorialTooltip";`
export { TutorialTooltip as Tooltip };
