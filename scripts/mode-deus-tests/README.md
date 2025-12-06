# Testes Automatizados - Modo Deus

Coleção de scripts para validar as funcionalidades da IA Contextual e Proativa da Azuria.

## Pré-requisitos
- Node.js instalado
- Navegador instalado (para Playwright)
- Aplicação rodando localmente (`npm run dev`) em `http://localhost:5173`

## Instalação

Dentro desta pasta, se necessário:
```bash
npm install playwright
```
(Ou use as dependências da raiz se já incluírem `playwright` core).

## Scripts Disponíveis

### 1. Teste Reativo
Simula um usuário usando a calculadora e verifica se a IA reage.
```bash
node run-reactive-test.js
```

### 2. Teste Proativo
Abre o Dashboard e aguarda o ciclo do motor proativo (30s) para verificar geração de insights.
```bash
node run-proactive-test.js
```

### 3. Verificar Logs
Lê os outputs gerados pelos testes acima.
```bash
./check-logs.sh
```

### 4. Rodar Tudo
Executa a suite completa e gera um JSON de report em `/reports`.
```bash
./run-all.sh
```

## Estrutura
- `*.js`: Scripts de execução com Playwright.
- `*.log`: Logs de saída gerados durante a execução.
