
import { Link } from 'react-router-dom';

export default function HeaderLogo() {
  // Cache-busting para forçar carregamento da logo
  const cacheBuster = `?v=${Date.now()}`;
  
  return (
    <Link to="/" className="flex items-center space-x-3">
      <img 
        src={`/images/azuria-logo-official.png${cacheBuster}`}
        alt="Logo Azuria+"
        className="h-24 w-auto object-contain"
        width={336}
        height={96}
        loading="eager"
        decoding="async"
        onError={(e) => {
          // Fallback em caso de erro
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="h-24 px-6 bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg flex items-center"><span class="text-white font-bold text-xl">Azuria</span></div>';
          }
        }}
      />
    </Link>
  );
}
