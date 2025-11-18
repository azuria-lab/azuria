/**
 * Cards de visão geral do Dashboard
 */

import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import type { MarketplaceDashboardData } from '@/types/marketplace-api';

interface OverviewCardsProps {
  data: MarketplaceDashboardData;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="metrics-cards">
      <StatCard
        title="Total de Produtos"
        value={data.overview.totalProducts}
        icon={Package}
        iconColor="#8b5cf6"
        iconBgColor="#f3e8ff"
        delay={0.1}
        footer={
          <span>
            {data.overview.activeListings} ativos • {data.overview.inactiveListings} inativos
          </span>
        }
      />

      <StatCard
        title="Vendas Totais"
        value={data.overview.totalSales}
        change={12}
        changeLabel="vs mês anterior"
        icon={ShoppingCart}
        iconColor="#10b981"
        iconBgColor="#d1fae5"
        trend="up"
        delay={0.2}
      />

      <StatCard
        title="Receita Bruta"
        value={data.overview.grossRevenue}
        prefix="R$ "
        change={8.5}
        changeLabel="vs mês anterior"
        icon={DollarSign}
        iconColor="#3b82f6"
        iconBgColor="#dbeafe"
        trend="up"
        delay={0.3}
      />

      <StatCard
        title="Margem Média"
        value={data.overview.averageMargin}
        suffix="%"
        decimals={2}
        icon={TrendingUp}
        iconColor="#f59e0b"
        iconBgColor="#fef3c7"
        delay={0.4}
        footer={
          <Progress value={data.overview.averageMargin} className="h-2" />
        }
      />
    </div>
  );
}

