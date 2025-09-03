# 📋 Lista de Marketplaces - Precifica+

## 🎯 Status Atual

### ✅ Integrados (3)
- **Mercado Livre** - Taxa: 11% - Prioridade: Alta
- **Amazon** - Taxa: 15% - Prioridade: Alta  
- **Shopee** - Taxa: 7.5% - Prioridade: Média

### 📋 Como Adicionar os Logos

1. **Pastas de Assets:**
   - Salve as imagens em: `src/assets/logos/`
   - Nomes sugeridos:
     - `mercado-livre-logo.png`
     - `amazon-logo.png` 
     - `shopee-logo.png`

2. **Atualizar o Componente:**
   - Edite `src/components/marketplace/MarketplaceLogos.tsx`
   - Substitua os placeholders pelas imagens reais
   - Exemplo:
   ```tsx
   import shopeeLogoImg from "@/assets/logos/shopee-logo.png";
   
   const ShopeeLogoComponent = () => (
     <img src={shopeeLogoImg} alt="Shopee" className="w-24 h-16 object-contain" />
   );
   ```

## 🚀 Próximas Integrações

### 🔥 Alta Prioridade - Brasileiros
1. **Magazine Luiza** - Taxa: 12% - Magalu
2. **Americanas** - Taxa: 13% - Tradicional brasileiro
3. **Casas Bahia** - Taxa: 12.5% - Via Varejo

### 🎯 Média Prioridade - Brasileiros
4. **Extra** - Taxa: 11.5% - Pão de Açúcar
5. **Submarino** - Taxa: 12% - Tradicional
6. **Carrefour** - Taxa: 10% - Varejo

### 👕 Especializados - Moda/Esporte
7. **Netshoes** - Taxa: 14% - Artigos esportivos
8. **Dafiti** - Taxa: 13.5% - Moda e lifestyle
9. **Zattini** - Taxa: 14% - Moda (Netshoes)
10. **Kanui** - Taxa: 13% - Moda esportiva

### 🌎 Internacionais - América Latina
11. **Falabella** - Taxa: 16% - Chile/Colômbia
12. **Linio** - Taxa: 15.5% - México/Latam

### 🌍 Internacionais - Globais
13. **eBay** - Taxa: 12.5% - Leilões
14. **Wish** - Taxa: 10% - Produtos baratos
15. **AliExpress** - Taxa: 8% - China/Alibaba
16. **Etsy** - Taxa: 6.5% - Artesanais

### 🏪 Especializados Internacionais
17. **Walmart Marketplace** - Taxa: 15% - EUA
18. **Facebook Marketplace** - Taxa: 5% - Social
19. **Instagram Shopping** - Taxa: 5% - Social

### 🏢 B2B Marketplaces
20. **Alibaba** - Taxa: 3% - B2B China
21. **Sieve** - Taxa: 4% - B2B Brasil

## 📊 Estatísticas

- **Total:** 21 marketplaces
- **Integrados:** 3 (14%)
- **Planejados:** 10 (48%)
- **Solicitados:** 8 (38%)
- **Nacionais:** 13 (62%)
- **Internacionais:** 8 (38%)

## 🎨 Onde Encontrar os Logos

### 🇧🇷 Nacionais
- **Magazine Luiza:** https://logoeps.com/magazine-luiza/
- **Americanas:** https://logoeps.com/americanas/
- **Casas Bahia:** https://logoeps.com/casas-bahia/
- **Extra:** Site oficial ou kit de imprensa
- **Submarino:** Site oficial ou kit de imprensa
- **Carrefour:** https://logoeps.com/carrefour/
- **Netshoes:** Site oficial ou kit de imprensa
- **Dafiti:** Site oficial ou kit de imprensa

### 🌍 Internacionais
- **eBay:** https://www.ebayinc.com/company/brand-guidelines/
- **AliExpress:** https://logoeps.com/aliexpress/
- **Etsy:** https://www.etsy.com/legal/brand/
- **Walmart:** https://corporate.walmart.com/media-library/
- **Facebook/Instagram:** https://about.meta.com/brand/resources/

## 💡 Dicas de Design

1. **Tamanho Padrão:** 96x64px (w-24 h-16)
2. **Formato:** PNG ou SVG com fundo transparente
3. **Estilo:** Manter proporções originais
4. **Qualidade:** Preferir versões vetoriais (SVG)
5. **Fallback:** Manter placeholders coloridos atuais

## ⚡ Implementação Técnica

Os logos estão integrados no componente `MarketplaceLogos.tsx` que:
- ✅ Suporta grid e layout horizontal
- ✅ Tem animações suaves (Framer Motion)  
- ✅ É responsivo (mobile-first)
- ✅ Mostra status de integração
- ✅ Tooltip com informações detalhadas

## 🔄 Próximos Passos

1. ⬆️ **Adicionar imagens reais** dos 3 marketplaces integrados
2. 🎨 **Criar seção de "Em Breve"** com logos dos próximos
3. 📊 **Dashboard de marketplaces** com métricas
4. 🔗 **API de sincronização** para cada plataforma
5. 📱 **Otimização mobile** dos logos