import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

type AuthMode = 'login' | 'register';

function AuthDemo() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { user, logout, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
              <p className="text-gray-600 mt-2">Você está autenticado com sucesso</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Informações do Usuário</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nome:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Função:</span> {user.role}</p>
                  <p><span className="font-medium">Permissões:</span> {user.permissions.join(', ')}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Configurações</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">Tema:</span> {user.settings.theme}</p>
                  <p><span className="font-medium">Idioma:</span> {user.settings.language}</p>
                  <p><span className="font-medium">Notificações:</span> {user.settings.notifications ? 'Ativadas' : 'Desativadas'}</p>
                  <p><span className="font-medium">2FA:</span> {user.settings.twoFactorEnabled ? 'Ativado' : 'Desativado'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {mode === 'login' ? (
          <LoginForm 
            onToggleMode={() => setMode('register')}
            onForgotPassword={() => alert('Funcionalidade de recuperação de senha em desenvolvimento')}
          />
        ) : (
          <RegisterForm 
            onToggleMode={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}

// Demonstração de rotas protegidas
function AdminOnlySection() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-medium text-yellow-800 mb-2">🔒 Área Restrita - Admin</h3>
      <p className="text-yellow-700 text-sm">
        Este conteúdo só é visível para usuários com função de administrador.
      </p>
    </div>
  );
}

function ManagerOnlySection() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 className="font-medium text-purple-800 mb-2">👔 Área de Gerentes</h3>
      <p className="text-purple-700 text-sm">
        Este conteúdo é visível para gerentes e administradores.
      </p>
    </div>
  );
}

function PermissionBasedSection() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-medium text-green-800 mb-2">📊 Relatórios</h3>
      <p className="text-green-700 text-sm">
        Este conteúdo requer a permissão 'reports:read'.
      </p>
    </div>
  );
}

// Exemplo de uso das rotas protegidas
export function AuthenticationDemo() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthDemo />
      
      {/* Demonstração de diferentes níveis de proteção */}
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Demonstração de Controle de Acesso
        </h2>
        
        <div className="grid gap-6">
          {/* Conteúdo para todos os usuários autenticados */}
          <ProtectedRoute>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">📝 Conteúdo Geral</h3>
              <p className="text-blue-700 text-sm">
                Este conteúdo é visível para todos os usuários autenticados.
              </p>
            </div>
          </ProtectedRoute>

          {/* Apenas administradores */}
          <ProtectedRoute requireRole="admin">
            <AdminOnlySection />
          </ProtectedRoute>

          {/* Gerentes e acima */}
          <ProtectedRoute requireRole="manager">
            <ManagerOnlySection />
          </ProtectedRoute>

          {/* Baseado em permissão específica */}
          <ProtectedRoute requirePermission="reports:read">
            <PermissionBasedSection />
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}