# 📊 Diagramas do Azuria

Este documento contém diagramas de arquitetura, fluxos e estrutura do Azuria. Os diagramas estão em formato **Mermaid**, que pode ser renderizado no GitHub, GitLab e em várias ferramentas de documentação.

---

## 🏗️ Arquitetura Geral

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[App.tsx] --> B[Router]
        B --> C[Pages]
        C --> D[Components]
        D --> E[Hooks]
        E --> F[Services]
    end
    
    subgraph "Backend (Supabase)"
        G[Edge Functions] --> H[PostgreSQL]
        I[Auth] --> H
        J[Storage] --> H
        K[Realtime] --> H
    end
    
    subgraph "External Services"
        L[OpenAI API]
        M[Google Generative AI]
        N[Stripe]
        O[Mercado Pago]
        P[Marketplace APIs]
    end
    
    F --> G
    F --> L
    F --> M
    F --> N
    F --> O
    F --> P
    
    style A fill:#3b82f6
    style G fill:#10b981
    style H fill:#10b981
    style L fill:#f59e0b
    style M fill:#f59e0b
```

---

## 🔄 Fluxo de Dados - Calculadora Avançada

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Component
    participant H as Hook
    participant S as Service
    participant DB as Supabase
    participant AI as OpenAI
    
    U->>C: Preenche dados
    C->>H: useAdvancedCalculator()
    H->>S: calculatePrice()
    S->>S: Valida dados
    S->>S: Calcula custos
    S->>S: Aplica taxas
    S->>AI: Sugestão de preço (opcional)
    AI-->>S: Preço sugerido
    S-->>H: Resultado
    H->>DB: Salva histórico
    H-->>C: Estado atualizado
    C-->>U: Exibe resultado
```

---

## 🧠 Fluxo de IA - Azuria AI

```mermaid
graph LR
    A[Usuário] --> B[AzuriaAIHub]
    B --> C{Seção?}
    C -->|Assistente| D[Chat Service]
    C -->|Precificação| E[Pricing Service]
    C -->|Competitividade| F[Competitor Service]
    C -->|Tributário| G[Tax Service]
    
    D --> H[OpenAI GPT-4]
    E --> H
    F --> H
    G --> H
    
    H --> I[Resposta]
    I --> J[Salva no Supabase]
    J --> K[Exibe para usuário]
    
    style B fill:#3b82f6
    style H fill:#f59e0b
    style J fill:#10b981
```

---

## 🏪 Fluxo Multi-Marketplace

```mermaid
graph TB
    A[Usuário] --> B[Marketplace Dashboard]
    B --> C[Product Management]
    C --> D{Marketplace?}
    
    D -->|Mercado Livre| E[MercadoLivreHandler]
    D -->|Amazon| F[AmazonHandler]
    D -->|Shopee| G[ShopeeHandler]
    D -->|Custom| H[CustomHandler]
    
    E --> I[API Marketplace]
    F --> I
    G --> I
    H --> I
    
    I --> J[Sincronização]
    J --> K[Supabase]
    K --> L[Atualiza Dashboard]
    
    style B fill:#3b82f6
    style I fill:#f59e0b
    style K fill:#10b981
```

---

## 💳 Fluxo de Assinatura

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as Pricing Page
    participant S as Stripe/MP
    participant E as Edge Function
    participant DB as Supabase
    
    U->>P: Seleciona plano
    P->>S: Cria checkout
    S->>U: Redireciona pagamento
    U->>S: Completa pagamento
    S->>E: Webhook
    E->>DB: Atualiza assinatura
    E->>DB: Atualiza plano
    DB->>U: Notificação
    U->>P: Retorna sucesso
```

---

## 🏛️ Estrutura de Domínios (DDD)

```mermaid
graph TB
    subgraph "Domain: auth"
        A1[AuthContext]
        A2[AuthService]
        A3[AuthHooks]
    end
    
    subgraph "Domain: calculator"
        B1[CalculatorContext]
        B2[CalculatorService]
        B3[CalculatorHooks]
    end
    
    subgraph "Domain: marketplace"
        C1[MarketplaceContext]
        C2[MarketplaceService]
        C3[MarketplaceHooks]
    end
    
    subgraph "Domain: analytics"
        D1[AnalyticsContext]
        D2[AnalyticsService]
        D3[AnalyticsHooks]
    end
    
    subgraph "Domain: subscription"
        E1[SubscriptionService]
        E2[SubscriptionHooks]
    end
    
    subgraph "Shared"
        F1[Shared Types]
        F2[Shared Utils]
        F3[Shared Hooks]
    end
    
    A1 --> F1
    B1 --> F1
    C1 --> F1
    D1 --> F1
    E1 --> F1
    
    style A1 fill:#3b82f6
    style B1 fill:#3b82f6
    style C1 fill:#3b82f6
    style D1 fill:#3b82f6
    style F1 fill:#10b981
```

---

## 🔐 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant L as Login Page
    participant S as Supabase Auth
    participant A as AuthContext
    participant P as Protected Route
    
    U->>L: Acessa /login
    L->>S: Login/Cadastro
    S-->>L: Token
    L->>A: setUser()
    A->>S: Valida token
    S-->>A: User data
    A->>P: isAuthenticated
    P->>U: Acesso permitido
```

---

## 📊 Fluxo de Analytics

```mermaid
graph LR
    A[Eventos] --> B[Analytics Service]
    B --> C{Destino?}
    C -->|Interno| D[Supabase]
    C -->|Externo| E[Google Analytics]
    C -->|Realtime| F[Realtime Subscription]
    
    D --> G[Dashboard]
    E --> G
    F --> G
    
    G --> H[Gráficos]
    G --> I[Métricas]
    G --> J[Relatórios]
    
    style B fill:#3b82f6
    style D fill:#10b981
    style E fill:#f59e0b
    style G fill:#8b5cf6
```

---

## ⚙️ Fluxo de Automação

```mermaid
graph TB
    A[Usuário] --> B[Cria Regra]
    B --> C[Rule Builder]
    C --> D[Salva Regra]
    D --> E[Automation Service]
    
    E --> F{Trigger?}
    F -->|Evento| G[Event Listener]
    F -->|Agendado| H[Cron Job]
    F -->|Webhook| I[Webhook Handler]
    
    G --> J[Executa Ação]
    H --> J
    I --> J
    
    J --> K{Resultado?}
    K -->|Sucesso| L[Notifica Usuário]
    K -->|Erro| M[Log de Erro]
    
    style C fill:#3b82f6
    style E fill:#10b981
    style J fill:#f59e0b
```

---

## 🔄 Fluxo de Colaboração

```mermaid
sequenceDiagram
    participant O as Owner
    participant C as Collaborator
    participant S as Share Service
    participant DB as Supabase
    participant N as Notification
    
    O->>S: Compartilha cálculo
    S->>DB: Cria compartilhamento
    DB->>N: Notifica colaborador
    N->>C: Notificação recebida
    C->>S: Acessa cálculo
    S->>DB: Registra acesso
    C->>S: Adiciona comentário
    S->>DB: Salva comentário
    DB->>N: Notifica owner
    N->>O: Novo comentário
```

---

## 📦 Estrutura de Componentes

```mermaid
graph TB
    A[App.tsx] --> B[Router]
    B --> C[ProtectedRoute]
    C --> D[DashboardLayout]
    
    D --> E[DashboardSidebar]
    D --> F[Header]
    D --> G[Main Content]
    
    G --> H{Page?}
    H -->|Calculator| I[Calculator Components]
    H -->|AI| J[AI Components]
    H -->|Marketplace| K[Marketplace Components]
    H -->|Analytics| L[Analytics Components]
    
    I --> M[UI Components]
    J --> M
    K --> M
    L --> M
    
    M --> N[Shadcn/UI]
    
    style A fill:#3b82f6
    style D fill:#10b981
    style M fill:#f59e0b
    style N fill:#8b5cf6
```

---

## 🚀 Fluxo de Deploy

```mermaid
graph LR
    A[Git Push] --> B[GitHub]
    B --> C[GitHub Actions]
    C --> D{Tests?}
    D -->|Pass| E[Build]
    D -->|Fail| F[Notify]
    E --> G[Vercel]
    G --> H[Deploy]
    H --> I[Production]
    
    style A fill:#3b82f6
    style C fill:#10b981
    style G fill:#000000
    style I fill:#f59e0b
```

---

## 📝 Como Usar

### No GitHub/GitLab

Os diagramas Mermaid são renderizados automaticamente quando você visualiza o arquivo `.md` no GitHub ou GitLab.

### Em Outras Ferramentas

1. **VS Code**: Instale a extensão "Markdown Preview Mermaid Support"
2. **Documentação Online**: Use ferramentas como [Mermaid Live Editor](https://mermaid.live/)
3. **Exportar**: Use ferramentas online para exportar como PNG/SVG

### Editar Diagramas

1. Edite o código Mermaid neste arquivo
2. Teste no [Mermaid Live Editor](https://mermaid.live/)
3. Commit as mudanças

---

**Última atualização:** Janeiro 2025

