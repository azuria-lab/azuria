# CHANGELOG

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

---

## 🧠 [3.0.0] - 2025-12-11 - MODO DEUS v1.0

### ✨ Modo Deus - O Cérebro Central Inteligente

O **Modo Deus v1.0** é a camada de inteligência artificial autônoma do Azuria, operando como um "cérebro central" que observa, entende, analisa e age proativamente.

#### 🏗️ Infraestrutura Core
- **ModeDeusOrchestrator** - Orquestrador central unificando todos os engines
- **ModeDeusProvider** - Provider React para inicialização automática
- **EventBus** com canais separados (`admin:*`, `user:*`, `system:*`)
- **AdminGuard** com proteção de APIs e rate limiting (100 req/15min)

#### 🤖 65 Engines de IA
- **Estratégicos:** Creator, Governance, Strategic, Truth, Coherence, Perception
- **Operacionais:** OperationalAI, UserContext, UIWatcher, Explanation, Tutorial
- **Auto-Evolução:** FeedbackLoop, PatternLearning, Personalization, Adaptive
- **Avançados:** NLPProcessor, Predictive, ProactiveAssistant, Cognitive
- **Personalidade:** Personality, BrandVoice, Storytelling, Affective
- **Segurança:** SafetyLimits, SafeAction, EthicalGuard, Stability

#### 🎨 UI Components
- `<CoPilot />` - Widget flutuante do Co-Piloto
- `<AzuriaBubble />` - Indicador de status da IA
- `<InsightToast />` - Notificações contextuais

#### 🪝 React Hooks
- `useCoPilot` - Hook principal do Co-Piloto
- `useAIContext` - Contexto de IA
- `useCalcWatcher` - Observador de cálculos

#### 🗄️ Persistência (8 tabelas Supabase)
- `user_suggestions`, `suggestion_feedback`, `user_copilot_preferences`
- `user_behavior_patterns`, `user_skill_metrics`, `user_tutorial_progress`
- `user_achievements`, `user_personalization`

#### 🧪 Testes
- **219 testes passando** ✅
- Cobertura completa dos engines críticos

#### 📚 Documentação
- **[MASTER_BOOK_V1.md](docs/mode-deus/MASTER_BOOK_V1.md)** - O Livro Mestre (800+ linhas)
- README e Changelog atualizados

---

## <small>2.0.1 (2025-11-18)</small>

* fix: adicionar timeouts aos comandos do health-check para evitar travamentos ([fd7dc29](https://github.com/azuria-lab/azuria/commit/fd7dc29))

## 2.0.0 (2025-11-18)

* feat: adicionar migrações do Supabase e documentação de recuperação ([40cef92](https://github.com/azuria-lab/azuria/commit/40cef92))
* feat: Centralizar navegação e remover logo do header (#39) ([55e3c5f](https://github.com/azuria-lab/azuria/commit/55e3c5f)), closes [#39](https://github.com/azuria-lab/azuria/issues/39)
* feat: implementação de sistema de assinaturas e integração Mercado Pago ([7a3b631](https://github.com/azuria-lab/azuria/commit/7a3b631))
* feat: implementação de sistema de assinaturas e integração Mercado Pago ([b16d986](https://github.com/azuria-lab/azuria/commit/b16d986))
* feat: Módulo de Licitações - Dashboard e Calculadora (#42) ([19c5069](https://github.com/azuria-lab/azuria/commit/19c5069)), closes [#42](https://github.com/azuria-lab/azuria/issues/42)
* feat: Otimizações de Performance - Code Splitting e Lazy Loading (#26) ([8e97655](https://github.com/azuria-lab/azuria/commit/8e97655)), closes [#26](https://github.com/azuria-lab/azuria/issues/26)
* feat: recuperação completa de todas features perdidas ([cdc5a11](https://github.com/azuria-lab/azuria/commit/cdc5a11))
* feat: recuperacao completa de todas features perdidas e refatoracao estrutural ([200d775](https://github.com/azuria-lab/azuria/commit/200d775)), closes [#43](https://github.com/azuria-lab/azuria/issues/43) [#44](https://github.com/azuria-lab/azuria/issues/44)
* feat: recuperar Calculadora Tributária e Saudação Personalizada ([2e83c06](https://github.com/azuria-lab/azuria/commit/2e83c06))
* fix: ajustar manualChunks para evitar vendor circular (#38) ([373e1fe](https://github.com/azuria-lab/azuria/commit/373e1fe)), closes [#38](https://github.com/azuria-lab/azuria/issues/38)
* fix: corrige AIContext em useAIChatbot ([e6f729a](https://github.com/azuria-lab/azuria/commit/e6f729a))
* fix: corrige tipos do AIContext/AIAction e resolve todos os erros do advancedTaxService ([fe5a4a3](https://github.com/azuria-lab/azuria/commit/fe5a4a3))
* fix: corrige tipos e erros de TypeScript nos serviços AI ([e55c708](https://github.com/azuria-lab/azuria/commit/e55c708))
* fix: corrige tipos e implementação do chatService ([42817de](https://github.com/azuria-lab/azuria/commit/42817de))
* fix: corrige vulnerabilidades de segurança CodeQL e tipos do AzuriaAIChat ([ad33d80](https://github.com/azuria-lab/azuria/commit/ad33d80))
* fix: corrigir problemas críticos de segurança e otimizar logs antes do deploy ([17dc8db](https://github.com/azuria-lab/azuria/commit/17dc8db))
* fix: corrigir referÃªncia de licenÃ§a no MULTIMARKETPLACE_DASHBOARD.md ([b67b942](https://github.com/azuria-lab/azuria/commit/b67b942))
* fix: exclude static assets from SPA fallback routing ([c493662](https://github.com/azuria-lab/azuria/commit/c493662))
* fix: exclude static assets from SPA fallback routing (#23) ([9913e95](https://github.com/azuria-lab/azuria/commit/9913e95)), closes [#23](https://github.com/azuria-lab/azuria/issues/23)
* fix: force clean build in Vercel buildCommand (#34) ([cfa3fad](https://github.com/azuria-lab/azuria/commit/cfa3fad)), closes [#34](https://github.com/azuria-lab/azuria/issues/34)
* fix: force clean build on Vercel with prebuild script (#33) ([7a07568](https://github.com/azuria-lab/azuria/commit/7a07568)), closes [#33](https://github.com/azuria-lab/azuria/issues/33)
* fix: force fresh build with cache bust comment (#31) ([cd65698](https://github.com/azuria-lab/azuria/commit/cd65698)), closes [#31](https://github.com/azuria-lab/azuria/issues/31)
* fix: force Vercel cache invalidation with timestamp file (#35) ([d2d4fae](https://github.com/azuria-lab/azuria/commit/d2d4fae)), closes [#35](https://github.com/azuria-lab/azuria/issues/35)
* fix: inline all imports to reduce to 14 files for Azure Free tier ([d9565b5](https://github.com/azuria-lab/azuria/commit/d9565b5))
* fix: invalidate Vercel build cache with config comment (#32) ([104d272](https://github.com/azuria-lab/azuria/commit/104d272)), closes [#32](https://github.com/azuria-lab/azuria/issues/32)
* fix: prevent aggressive caching and remove unused preload warnings (#29) ([3e72939](https://github.com/azuria-lab/azuria/commit/3e72939)), closes [#29](https://github.com/azuria-lab/azuria/issues/29)
* fix: refatora taxService.ts para usar estrutura TaxRegime completa ([6d5f4fd](https://github.com/azuria-lab/azuria/commit/6d5f4fd))
* fix: remove manual module preload of main entry ([d966cdd](https://github.com/azuria-lab/azuria/commit/d966cdd))
* fix: vercel rewrite rule to exclude all files with extensions ([cd57d28](https://github.com/azuria-lab/azuria/commit/cd57d28))
* fix(deploy): skip redundant build and fix app location path ([3b21cc8](https://github.com/azuria-lab/azuria/commit/3b21cc8))
* fix(lint): corrigir erros de lint - imports e console.log ([06f4806](https://github.com/azuria-lab/azuria/commit/06f4806))
* docs: add comprehensive release v1.0.0 success report (#16) ([7722c6c](https://github.com/azuria-lab/azuria/commit/7722c6c)), closes [#16](https://github.com/azuria-lab/azuria/issues/16)
* docs: JSDoc completo para 5 módulos prioritários (#41) ([be1cdf0](https://github.com/azuria-lab/azuria/commit/be1cdf0)), closes [#41](https://github.com/azuria-lab/azuria/issues/41)
* chore: Force Vercel redeploy with fresh build (#30) ([c30ccb8](https://github.com/azuria-lab/azuria/commit/c30ccb8)), closes [#30](https://github.com/azuria-lab/azuria/issues/30)
* chore: prepare for Vercel deployment (#25) ([3303c00](https://github.com/azuria-lab/azuria/commit/3303c00)), closes [#25](https://github.com/azuria-lab/azuria/issues/25)
* chore: remove workflows e arquivos de configuração do Azure ([f60674a](https://github.com/azuria-lab/azuria/commit/f60674a))
* chore: resolve merge conflicts with main - remove staticwebapp.config.json ([e85b811](https://github.com/azuria-lab/azuria/commit/e85b811))
* HOTFIX: Fix Vercel MIME type - Production site down (#28) ([b5046f4](https://github.com/azuria-lab/azuria/commit/b5046f4)), closes [#28](https://github.com/azuria-lab/azuria/issues/28)
* Merge pull request #24 from azuria-lab/fix/deploy-output-location ([5bc229a](https://github.com/azuria-lab/azuria/commit/5bc229a)), closes [#24](https://github.com/azuria-lab/azuria/issues/24)
* perf: aggressive build optimization for Azure Free tier (<5MB) ([8dd87a7](https://github.com/azuria-lab/azuria/commit/8dd87a7))
* ci: enable Azure Static Web Apps deployment with SPA routing (#22) ([258b01b](https://github.com/azuria-lab/azuria/commit/258b01b)), closes [#22](https://github.com/azuria-lab/azuria/issues/22)


### BREAKING CHANGE

* Alguns tipos AI foram refatorados de type para enum
TODO: Corrigir erros de tipo remanescentes nos serviços de IA

# CHANGELOG

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato segue *Keep a Changelog* e datas em ISO (YYYY-MM-DD). Versões seguem *SemVer*.

## [Unreleased]

### Adicionado

- Estrutura inicial de governança (licença proprietária, políticas e automações)
- Script de verificação de gerenciador de pacotes (npm-only)
- Workflow de guarda de lockfiles alternativos
- Placeholder de workflow de deploy para futura integração com Azure

### Alterado

- Padronização de pipeline CI com concurrency e artifact de build
- Dependabot configurado para apenas atualizações de segurança

### Segurança

- Política de segurança revisada com contato [security@azuria.com](mailto:security@azuria.com)

## [0.1.0] - 2025-09-13

### Base Inicial

- Plataforma (frontend React/Vite + Supabase)
- Scripts de build, lint, type-check e smoke tests

[Unreleased]: https://github.com/azuria-lab/azuria/compare/0.1.0...HEAD
