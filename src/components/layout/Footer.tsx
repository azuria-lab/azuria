
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
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <OptimizedImage 
                src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
                alt="Logo Azuria+" 
                className="h-7 w-auto" 
                width={112} 
                height={32} 
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A plataforma completa para precificar seus produtos com precisão e aumentar seus lucros.
              </p>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Calculadora Básica</li>
                <li>Calculadora PRO</li>
                <li>Análise de Rentabilidade</li>
                <li>Histórico</li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Sobre</li>
                <li>Contato</li>
                <li>Planos</li>
                <li>Configurações</li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Central de Ajuda</li>
                <li>Tutoriais</li>
                <li>API</li>
                <li>Status</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Azuria. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span>Política de Privacidade</span>
              <span>Termos de Uso</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/">
              <OptimizedImage 
                src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
                alt="Logo Azuria+" 
                className="h-7 w-auto hover:opacity-90 transition-opacity" 
                width={112} 
                height={32} 
              />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A plataforma completa para precificar seus produtos com precisão e aumentar seus lucros.
            </p>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/calculadora-simples" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Calculadora Básica
                </Link>
              </li>
              <li>
                <Link 
                  to="/calculadora-pro" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Calculadora PRO
                </Link>
              </li>
              <li>
                <Link 
                  to="/analise-rentabilidade" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Análise de Rentabilidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/historico" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Histórico
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/welcome" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contato@azuria.com.br" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <Link 
                  to="/planos" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link 
                  to="/configuracoes" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Configurações
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://docs.lovable.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Tutoriais
                </a>
              </li>
              <li>
                <Link 
                  to="/api" 
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <a 
                  href="https://status.azuria.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Azuria. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="/privacy" 
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Política de Privacidade
            </a>
            <a 
              href="/terms" 
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
