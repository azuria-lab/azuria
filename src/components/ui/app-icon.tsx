
import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
  size?: number;
  withShadow?: boolean;
  variant?: 'default' | 'minimal';
}

export function AppIcon({ className, size = 40, withShadow = false, variant = 'default' }: AppIconProps) {
  // Cache-busting para forçar carregamento da imagem
  const cacheBuster = `?v=${Date.now()}`;
  
  if (variant === 'minimal') {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-xl overflow-hidden",
          withShadow && "shadow-lg shadow-brand-500/25",
          className
        )}
        style={{ 
          width: `${size}px`, 
          height: `${size}px` 
        }}
      >
        <img 
          src={`/lovable-uploads/1b60dc50-10b8-4a67-8b97-a83c4cb83ba6.png${cacheBuster}`}
          alt="Azuria"
          className="w-full h-full object-contain"
          style={{ 
            maxWidth: `${size}px`,
            maxHeight: `${size}px`
          }}
          onError={(e) => {
            // Fallback em caso de erro
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center"><span class="text-white font-bold" style="font-size: ${size * 0.4}px">A</span></div>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-xl overflow-hidden",
        withShadow && "shadow-lg shadow-brand-500/25",
        className
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    >
      <img 
        src={`/lovable-uploads/1b60dc50-10b8-4a67-8b97-a83c4cb83ba6.png${cacheBuster}`}
        alt="Azuria"
        className="w-full h-full object-contain"
        style={{ 
          maxWidth: `${size}px`,
          maxHeight: `${size}px`
        }}
        onError={(e) => {
          // Fallback em caso de erro
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center"><span class="text-white font-bold" style="font-size: ${size * 0.4}px">A</span></div>`;
          }
        }}
      />
    </div>
  );
}
