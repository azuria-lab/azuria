'use client';

import { BarChart3, Brain, Calculator, MessageCircle, TrendingUp, Users } from "lucide-react";
import { AzuriaAIChat } from "@/components/ai/AzuriaAIChat";
import { useAzuriaAI } from "@/hooks/useAzuriaAI";

export default function DashboardPage() {
  const { isOpen, openChat, closeChat, hasActiveSession } = useAzuriaAI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhe suas métricas, cálculos e análises em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h2 className="text-xl font-semibold">Cálculos Realizados</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">127</p>
            <p className="text-gray-600">Este mês</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h2 className="text-xl font-semibold">Margem Média</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">32.5%</p>
            <p className="text-gray-600">Últimos 30 dias</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-purple-600" />
              <h2 className="text-xl font-semibold">Produtos Ativos</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">89</p>
            <p className="text-gray-600">Em seu catálogo</p>
          </div>
        </div>

        {/* Seção da Azuria AI */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8" />
            <h2 className="text-2xl font-semibold">Azuria AI - Sua Assistente Inteligente</h2>
          </div>
          <p className="mb-6 opacity-90">
            Converse com a Azuria para análises de precificação, tributação e monitoramento de concorrentes.
            Tenha insights instantâneos para otimizar seu negócio! 🚀
          </p>
          <button
            onClick={openChat}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            {hasActiveSession ? 'Continuar conversa com Azuria' : 'Conversar com Azuria AI'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard em Desenvolvimento</h2>
          <p className="text-gray-600 mb-6">
            Esta página está sendo migrada para o Next.js. Em breve estará disponível com widgets personalizáveis, 
            gráficos interativos e métricas detalhadas.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Recursos planejados: Widgets drag & drop, múltiplos dashboards, métricas em tempo real, 
              relatórios personalizados e muito mais.
            </p>
          </div>
        </div>

        {/* Chat da Azuria AI */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Azuria AI - Sua Assistente Inteligente</h3>
                  {hasActiveSession && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Ativa
                    </span>
                  )}
                </div>
                <button
                  onClick={closeChat}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AzuriaAIChat />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}