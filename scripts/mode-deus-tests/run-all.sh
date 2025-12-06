#!/bin/bash

# Script orquestrador de todos os testes do Modo Deus
# Requer node.js instalado

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="../../reports"
REPORT_FILE="$REPORT_DIR/mode-deus-test-report-$TIMESTAMP.json"

mkdir -p "$REPORT_DIR"

echo ">>> Iniciando Suite de Testes Modo Deus - $TIMESTAMP" | tee -a "$REPORT_FILE.log"

# 1. Instalar dependências se necessário (check rápido)
if [ ! -d "node_modules" ]; then
  echo "Instalando dependências isoladas para scripts..."
  npm install playwright
fi

# 2. Executar Reativo
echo ">>> [1/2] Rodando Teste Reativo..."
node run-reactive-test.js
STATUS_REACTIVE=$?

# 3. Executar Proativo
echo ">>> [2/2] Rodando Teste Proativo..."
node run-proactive-test.js
STATUS_PROACTIVE=$?

# 4. Gerar Relatório JSON simples
echo "{" > "$REPORT_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$REPORT_FILE"
echo "  \"results\": {" >> "$REPORT_FILE"
if [ $STATUS_REACTIVE -eq 0 ]; then
  echo "    \"reactive\": \"PASS\"," >> "$REPORT_FILE"
else
  echo "    \"reactive\": \"FAIL\"," >> "$REPORT_FILE"
fi

if [ $STATUS_PROACTIVE -eq 0 ]; then
  echo "    \"proactive\": \"PASS\"" >> "$REPORT_FILE"
else
  echo "    \"proactive\": \"FAIL\"" >> "$REPORT_FILE"
fi
echo "  }" >> "$REPORT_FILE"
echo "}" >> "$REPORT_FILE"

echo ""
echo ">>> Suite Finalizada."
echo "Relatório salvo em: $REPORT_FILE"
cat "$REPORT_FILE"
