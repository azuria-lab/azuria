"use client";

import React from 'react';
import { SaasFeatureHub } from '@/components/business-intelligence/SaasFeatureHub';

export const dynamic = 'force-dynamic'; // Para poder testar com dados dinâmicos

export default function BusinessIntelligencePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Business Intelligence Hub
          </h1>
          <p className="text-muted-foreground">
            Sistema completo de BI com dashboards, relatórios e análises avançadas.
          </p>
        </header>
        
        <div className="w-full">
          <SaasFeatureHub />
        </div>
      </div>
    </main>
  );
}