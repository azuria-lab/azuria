
import { Link } from 'react-router-dom';

export default function HeaderLogo() {
  // Cache-busting para forçar carregamento da logo
  const cacheBuster = `?v=${Date.now()}`;
  
  return (
    <Link to="/" className="flex items-center space-x-3">
      <img 
        src={`/lovable-uploads/1b60dc50-10b8-4a67-8b97-a83c4cb83ba6.png${cacheBuster}`}
        alt="Logo Azuria+"
        className="h-8 w-auto object-contain"
        width={112}
        height={32}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onError={(e) => {
          // Fallback em caso de erro
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="h-8 px-3 bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg flex items-center"><span class="text-white font-bold text-sm">Azuria</span></div>';
          }
        }}
      />
    </Link>
  );
}
