/**
 * Competitor Service - Azuria AI
 *
 * Serviço responsável por monitoramento de preços da concorrência
 *
 * ⚠️ VERSÃO INICIAL: Simulação com dados fictícios
 * 🚀 FUTURO: Integração com APIs de web scraping (ScraperAPI, Bright Data, etc.)
 */

import { CompetitorAlert, CompetitorData } from '@/types/azuriaAI';

/**
 * Simula busca de preços da concorrência
 *
 * 🎯 No futuro, isso será substituído por chamadas a APIs reais
 */
export async function fetchCompetitorPrices(
  productName: string
): Promise<CompetitorData[]> {
  // Simulação de delay de API
  await new Promise(resolve => setTimeout(resolve, 800));

  // Dados simulados - No futuro virão de APIs reais
  const mockCompetitors: CompetitorData[] = [
    {
      competitor_name: 'Concorrente A',
      product_name: productName,
      current_price: Math.random() * 100 + 50,
      last_checked: new Date(),
      price_trend: Math.random() > 0.5 ? 'rising' : 'falling',
      source_url: 'https://exemplo.com/produto',
      confidence_score: 0.85,
    },
    {
      competitor_name: 'Concorrente B',
      product_name: productName,
      current_price: Math.random() * 120 + 40,
      last_checked: new Date(),
      price_trend: Math.random() > 0.5 ? 'rising' : 'falling',
      source_url: 'https://exemplo2.com/produto',
      confidence_score: 0.92,
    },
    {
      competitor_name: 'Concorrente C',
      product_name: productName,
      current_price: Math.random() * 90 + 60,
      last_checked: new Date(),
      price_trend: 'stable',
      source_url: 'https://exemplo3.com/produto',
      confidence_score: 0.78,
    },
  ];

  return mockCompetitors;
}

/**
 * Analisa alertas de preços da concorrência
 */
export function analyzeCompetitorAlerts(
  ourPrice: number,
  competitors: CompetitorData[]
): CompetitorAlert[] {
  const alerts: CompetitorAlert[] = [];

  // Encontrar preço mais baixo
  const lowestCompetitor = competitors.reduce((min, curr) =>
    curr.current_price < min.current_price ? curr : min
  );

  // Alerta se estivermos muito acima
  const priceDifference =
    ((ourPrice - lowestCompetitor.current_price) /
      lowestCompetitor.current_price) *
    100;

  if (priceDifference > 20) {
    alerts.push({
      type: 'price_too_high',
      message: `⚠️ Seu preço está ${priceDifference.toFixed(
        1
      )}% acima do concorrente mais barato (${
        lowestCompetitor.competitor_name
      })`,
      competitor: lowestCompetitor,
      suggested_action: `Considere reduzir para R$ ${(
        lowestCompetitor.current_price * 1.05
      ).toFixed(2)} (5% acima do concorrente)`,
      urgency: priceDifference > 40 ? 'high' : 'medium',
    });
  }

  // Alerta para tendências de queda
  const fallingPrices = competitors.filter(c => c.price_trend === 'falling');
  if (fallingPrices.length >= 2) {
    alerts.push({
      type: 'market_trend',
      message: `📉 Tendência de queda de preços no mercado (${fallingPrices.length} concorrentes baixando preços)`,
      competitor: fallingPrices[0],
      suggested_action:
        'Monitore de perto e prepare estratégia de precificação competitiva',
      urgency: 'medium',
    });
  }

  // Alerta de oportunidade se estivermos abaixo
  if (ourPrice < lowestCompetitor.current_price * 0.9) {
    alerts.push({
      type: 'opportunity',
      message: `✅ Seu preço está competitivo! ${Math.abs(
        priceDifference
      ).toFixed(1)}% abaixo do mercado`,
      competitor: lowestCompetitor,
      suggested_action:
        'Você pode considerar aumentar levemente para maximizar margem',
      urgency: 'low',
    });
  }

  return alerts;
}

/**
 * Gera recomendação de preço baseado em concorrência
 */
export function suggestCompetitivePrice(
  ourCost: number,
  minMargin: number,
  competitors: CompetitorData[]
): {
  suggested_price: number;
  reasoning: string;
  market_position: 'leader' | 'competitive' | 'follower';
} {
  if (competitors.length === 0) {
    const price = ourCost * (1 + minMargin);
    return {
      suggested_price: price,
      reasoning:
        'Sem dados de concorrência. Preço baseado em custo + margem mínima.',
      market_position: 'competitive',
    };
  }

  const avgPrice =
    competitors.reduce((sum, c) => sum + c.current_price, 0) /
    competitors.length;
  const lowestPrice = Math.min(...competitors.map(c => c.current_price));
  const highestPrice = Math.max(...competitors.map(c => c.current_price));

  // Garantir margem mínima
  const minAcceptablePrice = ourCost * (1 + minMargin);

  let suggested_price: number;
  let reasoning: string;
  let market_position: 'leader' | 'competitive' | 'follower';

  // Estratégia: Competitivo (ligeiramente abaixo da média)
  const competitivePrice = avgPrice * 0.97;

  if (competitivePrice >= minAcceptablePrice) {
    suggested_price = competitivePrice;
    reasoning = `Preço competitivo, 3% abaixo da média do mercado (R$ ${avgPrice.toFixed(
      2
    )}), mantendo margem de ${((suggested_price / ourCost - 1) * 100).toFixed(
      1
    )}%`;
    market_position = 'competitive';
  } else {
    suggested_price = minAcceptablePrice;
    reasoning = `Mercado com preços baixos. Manter margem mínima de ${(
      minMargin * 100
    ).toFixed(0)}% é mais importante que competir por preço`;
    market_position = 'leader';
  }

  // Verificar se estamos muito acima
  if (suggested_price > highestPrice * 1.1) {
    market_position = 'leader';
    reasoning +=
      '. ⚠️ Atenção: seu preço ficará acima do mercado - garanta diferenciação!';
  }

  // Verificar se estamos no range ideal
  if (suggested_price >= lowestPrice && suggested_price <= avgPrice) {
    market_position = 'competitive';
  }

  return {
    suggested_price: Math.round(suggested_price * 100) / 100,
    reasoning,
    market_position,
  };
}

/**
 * Formata dados de concorrência para exibição
 */
export function formatCompetitorReport(competitors: CompetitorData[]): string {
  if (competitors.length === 0) {
    return '📊 Nenhum dado de concorrência disponível no momento.';
  }

  const avgPrice =
    competitors.reduce((sum, c) => sum + c.current_price, 0) /
    competitors.length;
  const lowestPrice = Math.min(...competitors.map(c => c.current_price));
  const highestPrice = Math.max(...competitors.map(c => c.current_price));

  let report = `📊 **Análise de Concorrência:**\n\n`;
  report += `🎯 Preço Médio: R$ ${avgPrice.toFixed(2)}\n`;
  report += `📉 Menor Preço: R$ ${lowestPrice.toFixed(2)}\n`;
  report += `📈 Maior Preço: R$ ${highestPrice.toFixed(2)}\n\n`;
  report += `**Concorrentes Monitorados:**\n\n`;

  competitors.forEach((c, i) => {
    const trend =
      c.price_trend === 'rising'
        ? '📈'
        : c.price_trend === 'falling'
        ? '📉'
        : '➡️';
    report += `${i + 1}. **${c.competitor_name}**: R$ ${c.current_price.toFixed(
      2
    )} ${trend}\n`;
  });

  return report;
}

/**
 * 🚀 ROADMAP FUTURO - Integração Real
 *
 * Para substituir a simulação por dados reais:
 *
 * 1. **ScraperAPI** (https://www.scraperapi.com/)
 *    - Plano gratuito: 1.000 requisições/mês
 *    - Bypass de anti-bot automático
 *
 * 2. **Bright Data** (https://brightdata.com/)
 *    - Web scraping profissional
 *    - Acesso via API
 *
 * 3. **Custom Scraper**
 *    - Puppeteer/Playwright em Edge Function
 *    - Mais controle, mas mais manutenção
 *
 * 4. **Integração com Marketplaces**
 *    - API Mercado Livre
 *    - API Amazon (Product Advertising API)
 *    - API B2W/Americanas
 *
 * Exemplo de implementação futura:
 *
 * ```typescript
 * async function fetchRealCompetitorPrices(productName: string) {
 *   const response = await fetch('https://api.scraperapi.com/?api_key=YOUR_KEY&url=...');
 *   const html = await response.text();
 *   // Parse HTML com cheerio ou similar
 *   return parsedCompetitorData;
 * }
 * ```
 */
