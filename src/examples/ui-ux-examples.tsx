/**
 * Example: Como usar o Sistema de UI/UX
 * 
 * Este arquivo demonstra como integrar e usar os novos componentes
 */

import { useEffect } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { type Tour, TourButton, useTour } from '@/components/tour';
import { useKeyboardShortcuts, useRegisterShortcut } from '@/components/keyboard';

// ============================================
// EXEMPLO 1: Usar Dark Mode
// ============================================

export function HeaderWithDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4">
      <h1>Azuria Marketplace</h1>
      
      {/* Opção 1: Usar o componente ThemeToggle pronto */}
      <ThemeToggle />
      
      {/* Opção 2: Controle manual do tema */}
      <div>
        <p>Tema atual: {theme}</p>
        <p>Tema resolvido: {resolvedTheme}</p>
        <button onClick={() => setTheme('dark')}>Dark</button>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('system')}>System</button>
      </div>
    </header>
  );
}

// ============================================
// EXEMPLO 2: Iniciar Tour Guiado
// ============================================

export function DashboardWithTour() {
  const { startTour, isActive } = useTour();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>Dashboard</h2>
        
        {/* Opção 1: Usar o componente TourButton */}
        <TourButton 
          tourId="marketplace-dashboard"
          label="Ver Tour"
          variant="outline"
          size="sm"
        />
        
        {/* Opção 2: Botão customizado */}
        <button 
          onClick={() => startTour('marketplace-dashboard')}
          disabled={isActive}
        >
          🎯 Como usar este painel
        </button>
      </div>

      {/* Adicione data-tour nos elementos */}
      <div data-tour="metrics-cards">
        <h3>Métricas</h3>
        {/* Cards de métricas */}
      </div>

      <div data-tour="products-tab">
        <h3>Produtos</h3>
        {/* Lista de produtos */}
      </div>
    </div>
  );
}

// ============================================
// EXEMPLO 3: Controlar Tour Programaticamente
// ============================================

export function TourControlExample() {
  const { 
    currentTour, 
    currentStep, 
    isActive, 
    startTour, 
    nextStep, 
    prevStep, 
    endTour,
    skipTour 
  } = useTour();

  return (
    <div>
      {isActive && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow">
          <p>Tour: {currentTour?.name}</p>
          <p>Passo: {currentStep + 1} de {currentTour?.steps.length}</p>
          
          <div className="flex gap-2 mt-2">
            <button onClick={prevStep}>← Anterior</button>
            <button onClick={nextStep}>Próximo →</button>
            <button onClick={endTour}>✓ Concluir</button>
            <button onClick={skipTour}>✕ Pular</button>
          </div>
        </div>
      )}

      <button onClick={() => startTour('product-management')}>
        Iniciar Tour de Produtos
      </button>
    </div>
  );
}

// ============================================
// EXEMPLO 4: Registrar Atalhos de Teclado
// ============================================

export function PageWithShortcuts() {
  const { openShortcutsModal } = useKeyboardShortcuts();

  // Registrar atalho customizado
  useRegisterShortcut({
    id: 'save-dashboard',
    key: 's',
    ctrl: true,
    description: 'Salvar dashboard',
    category: 'actions',
    action: () => {
      console.log('Dashboard salvo!');
      // Sua lógica aqui
    }
  });

  // Registrar múltiplos atalhos
  useRegisterShortcut({
    id: 'export-data',
    key: 'e',
    ctrl: true,
    shift: true,
    description: 'Exportar dados',
    category: 'actions',
    action: () => {
      console.log('Exportando...');
    }
  });

  return (
    <div>
      <button onClick={openShortcutsModal}>
        Ver Atalhos (Ctrl + /)
      </button>
    </div>
  );
}

// ============================================
// EXEMPLO 5: Usar Atalhos de Navegação
// ============================================

export function NavigationShortcuts() {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Dashboard
  useRegisterShortcut({
    id: 'goto-dashboard',
    key: 'd',
    description: 'Ir para Dashboard',
    category: 'navigation',
    action: () => navigate('/dashboard')
  });

  // Produtos
  useRegisterShortcut({
    id: 'goto-products',
    key: 'p',
    description: 'Ir para Produtos',
    category: 'navigation',
    action: () => navigate('/produtos')
  });

  // Analytics
  useRegisterShortcut({
    id: 'goto-analytics',
    key: 'a',
    description: 'Ir para Analytics',
    category: 'navigation',
    action: () => navigate('/analytics')
  });

  return null; // Este componente só registra atalhos
}

// ============================================
// EXEMPLO 6: Atalho para Toggle Dark Mode
// ============================================

export function DarkModeShortcut() {
  const { theme, setTheme } = useTheme();

  useRegisterShortcut({
    id: 'toggle-dark-mode',
    key: 'd',
    ctrl: true,
    description: 'Alternar tema escuro/claro',
    category: 'view',
    action: () => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  });

  return null;
}

// ============================================
// EXEMPLO 7: Verificar se Tour foi Completado
// ============================================

export function WelcomeMessage() {
  useEffect(() => {
    const completedTours = JSON.parse(
      localStorage.getItem('azuria-completed-tours') || '[]'
    );

    if (!completedTours.includes('marketplace-dashboard')) {
      // Mostrar dica para fazer o tour
      console.log('Usuário ainda não fez o tour!');
    }
  }, []);

  return <div>Bem-vindo!</div>;
}

// ============================================
// EXEMPLO 8: Tour Automático no Primeiro Acesso
// ============================================

export function AutoStartTour() {
  const { startTour } = useTour();

  useEffect(() => {
    const hasSeenDashboardTour = localStorage.getItem('dashboard-tour-seen');
    
    if (!hasSeenDashboardTour) {
      // Aguarda 2 segundos para o usuário se orientar
      setTimeout(() => {
        startTour('marketplace-dashboard');
        localStorage.setItem('dashboard-tour-seen', 'true');
      }, 2000);
    }
  }, [startTour]);

  return null;
}

// ============================================
// EXEMPLO 9: Criar Tour Personalizado
// ============================================

export const customTour: Tour = {
  id: 'custom-feature',
  name: 'Nova Funcionalidade',
  steps: [
    {
      target: '[data-tour="feature-button"]',
      title: 'Novo Botão!',
      content: 'Clique aqui para acessar a nova funcionalidade.',
      placement: 'bottom'
    },
    {
      target: '[data-tour="feature-panel"]',
      title: 'Painel de Controle',
      content: 'Aqui você pode configurar todas as opções.',
      placement: 'right'
    },
    {
      target: '[data-tour="save-button"]',
      title: 'Salvar Alterações',
      content: 'Não esqueça de salvar suas configurações!',
      placement: 'top'
    }
  ]
};

// Adicionar ao arquivo tours.ts:
// export const TOURS = [...existingTours, customTour];

// ============================================
// EXEMPLO 10: Composição Completa
// ============================================

export function CompleteExample() {
  const { theme } = useTheme();
  const { startTour, isActive } = useTour();
  const { openShortcutsModal } = useKeyboardShortcuts();

  // Registrar atalhos
  useRegisterShortcut({
    id: 'start-tour',
    key: 't',
    ctrl: true,
    description: 'Iniciar tour guiado',
    category: 'general',
    action: () => startTour('marketplace-dashboard')
  });

  return (
    <div className={theme}>
      <header className="flex items-center justify-between p-4">
        <h1>Azuria Dashboard</h1>
        
        <div className="flex gap-2">
          <ThemeToggle />
          <TourButton tourId="marketplace-dashboard" />
          <button onClick={openShortcutsModal}>
            ⌨️ Atalhos
          </button>
        </div>
      </header>

      <main className="p-4">
        <div data-tour="welcome-message">
          <h2>Bem-vindo!</h2>
          <p>Use Ctrl+T para iniciar o tour ou Ctrl+/ para ver atalhos</p>
        </div>

        <div data-tour="dashboard-content">
          {/* Seu conteúdo aqui */}
        </div>
      </main>

      {isActive && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-2 rounded">
          Tour ativo! Use as setas ou Escape para navegar
        </div>
      )}
    </div>
  );
}

// ============================================
// TIPS & TRICKS
// ============================================

/*
1. DATA-TOUR ATTRIBUTES:
   - Use selectores específicos: [data-tour="nome-unico"]
   - Evite IDs dinâmicos ou classes genéricas
   - Prefira atributos data-tour a classes para tours

2. KEYBOARD SHORTCUTS:
   - Ctrl/Cmd é convertido automaticamente no Mac
   - Evite conflitos com atalhos do navegador
   - Use categorias para organizar no modal

3. DARK MODE:
   - Tailwind usa classes dark: automaticamente
   - Teste em ambos os temas durante desenvolvimento
   - Use CSS variables para cores customizadas

4. PERFORMANCE:
   - Tours são lazy-loaded
   - Atalhos só registram listeners quando necessário
   - Context values são memoizados

5. ACCESSIBILITY:
   - Navegação por teclado é obrigatória
   - Use labels corretos para screen readers
   - Teste com Tab navigation
*/
