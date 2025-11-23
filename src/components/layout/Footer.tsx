
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/performance/OptimizedImage";

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render basic footer without Link components until router is ready
  if (!mounted) {
    return (
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto py-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <OptimizedImage 
                src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
                alt="Logo Azuria+" 
                className="h-8 w-auto" 
                width={128} 
                height={36} 
              />
              <p className="text-sm text-gray-600 leading-relaxed">
                Precificação inteligente para vender com mais lucro e menos esforço.
              </p>
            </div>

            {/* Sobre */}
            <div>
              <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Sobre</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Sobre o Azuria</li>
                <li>Nossa missão</li>
                <li>Segurança</li>
                <li>Termos</li>
                <li>Privacidade</li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Recursos</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>IA de precificação</li>
                <li>Marketplace integrado</li>
                <li>Precificação em lote</li>
                <li>Analytics</li>
                <li>Comparação de concorrentes</li>
              </ul>
            </div>

            {/* Contato / Suporte */}
            <div>
              <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Contato / Suporte</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Central de ajuda</li>
                <li>Email</li>
                <li>API</li>
              </ul>
            </div>
          </div>

          <Separator className="my-12" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2025 Azuria. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span>Política de Privacidade</span>
              <span>Termos de Uso</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/">
              <OptimizedImage 
                src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
                alt="Logo Azuria+" 
                className="h-8 w-auto hover:opacity-90 transition-opacity" 
                width={128} 
                height={36} 
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Precificação inteligente para vender com mais lucro e menos esforço.
            </p>
          </div>

          {/* Sobre */}
          <div>
            <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Sobre</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="#sobre" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Sobre o Azuria
                </Link>
              </li>
              <li>
                <Link 
                  to="#sobre" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Nossa missão
                </Link>
              </li>
              <li>
                <a 
                  href="#seguranca" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Segurança
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Termos
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Recursos</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="#recursos" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  IA de precificação
                </Link>
              </li>
              <li>
                <Link 
                  to="#recursos" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Marketplace integrado
                </Link>
              </li>
              <li>
                <Link 
                  to="#recursos" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Precificação em lote
                </Link>
              </li>
              <li>
                <Link 
                  to="#recursos" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link 
                  to="#recursos" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Comparação de concorrentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato / Suporte */}
          <div>
            <h4 className="font-bold mb-6 text-[#0A1930] text-lg">Contato / Suporte</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://docs.lovable.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Central de ajuda
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contato@azuria.com.br" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <Link 
                  to="/api" 
                  className="text-gray-600 hover:text-[#005BFF] transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2025 Azuria. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="/privacy" 
              className="hover:text-[#005BFF] transition-colors"
            >
              Política de Privacidade
            </a>
            <a 
              href="/terms" 
              className="hover:text-[#005BFF] transition-colors"
            >
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
