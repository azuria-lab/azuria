# 📝 Nota sobre Azure Static Web Apps SKU

**Data**: 1 de Outubro de 2025

## ⚠️ Limitação Identificada

Tentamos fazer downgrade do Azure Static Web Apps de **Standard** para **Free**, mas o Azure retornou erro:

```
Operation returned an invalid status 'Bad Request'
```

## 🔍 Investigação

### Possíveis Motivos:

1. **Custom Domain Configurado**
   - Atualmente: `www.azuria.app.br` está configurado
   - Free tier: Permite apenas 1 custom domain
   - **Solução**: Manter como está (já está dentro do limite)

2. **Downgrade Não Permitido via CLI**
   - Azure pode exigir downgrade via Portal
   - Ou pode ter período de carência

3. **Features em Uso**
   - Staging environments (habilitado)
   - Enterprise CDN (desabilitado)

## 💡 Alternativas

### Opção A: Manter Standard (RECOMENDADO)

**Custo**: R$ 9/mês (~R$ 108/ano)

**Vantagens**:
- ✅ Staging environments (testes seguros)
- ✅ Mais custom domains se precisar
- ✅ Melhor performance
- ✅ Prioridade no suporte

**Com crédito de R$ 1.063**:
- Duração: **~118 meses** (9.8 anos!)
- Ou seja, você tem crédito de SOBRA!

**Análise**:
- Com apenas **1 assinante PRO** (R$ 9.90/mês), você já cobre o custo!
- Não vale a pena economizar R$ 9/mês se perder features importantes

### Opção B: Tentar Downgrade via Portal

**Passos**:
1. Acessar portal.azure.com
2. Navegar até Static Web Apps
3. Settings → Configuration → Change tier
4. Selecionar Free

**Observação**: Pode precisar remover features primeiro (staging envs)

### Opção C: Criar Novo Static Web App Free

**Passos**:
1. Criar novo SWA com SKU Free
2. Migrar domínio
3. Deletar o Standard

**Risco**: Downtime durante migração

## 🎯 Decisão Recomendada

### ✅ MANTER STANDARD

**Motivos**:

1. **Custo Insignificante**
   - R$ 9/mês vs R$ 1.063 de crédito = 118 meses
   - 1 assinante PRO já cobre o custo

2. **Features Importantes**
   - Staging environments = deploy seguro
   - Mais custom domains se precisar
   - Performance melhor

3. **Foco no Importante**
   - Economizar R$ 9/mês não é prioritário
   - Melhor focar em conseguir assinantes!

4. **Break-even Muito Baixo**
   - Com 1 PRO (R$ 9.90) você cobre o custo
   - Com 2 PRO você já tem lucro
   - Com 100 PRO você tem R$ 990/mês

## 📊 Análise Financeira

### Cenário: Manter Standard

```
Custo Azure/mês: R$ 13-17
Break-even: 2 assinantes PRO

Mês 1: 0 PRO → -R$ 13 (pago com crédito)
Mês 2: 5 PRO → +R$ 37 (lucro!)
Mês 3: 15 PRO → +R$ 129 (lucro!)
Mês 6: 100 PRO → +R$ 923 (lucro!)
```

### Cenário: Downgrade para Free (se possível)

```
Custo Azure/mês: R$ 3-5
Break-even: 1 assinante PRO

Economia: R$ 9/mês
Perda: Staging environments
```

**Economia anual**: R$ 108  
**Valor vs Perda**: Não compensa perder staging envs

## ✅ Otimizações Já Feitas

1. ✅ **Log Analytics**: Retenção reduzida para 30 dias (free tier)
2. ⏳ **Application Insights**: Ajustar sampling para 10% (próximo passo)
3. ⏳ **Azure DNS**: Deletar zone (usar registro.br)

**Economia atual**: ~R$ 2-3/mês

## 🎯 Conclusão

**MANTER STANDARD** é a melhor decisão:
- ✅ Custo baixo (R$ 9/mês)
- ✅ Features importantes preservadas
- ✅ Crédito dura ~10 anos
- ✅ 1 assinante já cobre o custo
- ✅ Foco em crescer, não em economizar migalhas

**Próximo passo**: Implementar Mercado Pago e conseguir assinantes! 🚀

---

*Nota: Se no futuro você quiser mesmo fazer downgrade, pode tentar via Portal Azure*
