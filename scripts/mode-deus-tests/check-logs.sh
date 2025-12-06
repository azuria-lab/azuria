#!/bin/bash

# Script para verificar logs de insights gerados
# Tenta ler logs dos testes recentes ou simulado

LOG_FILES=(
  "./reactive-test.log"
  "./proactive-test.log"
)

echo ">>> Buscando últimos insights nos logs locais..."

FOUND_ANY=0

for FILE in "${LOG_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "--- Lendo $FILE ---"
    
    # Filtra linhas que parecem JSON de insight ou mensagens de log
    # Assume que o log gerado pelo JS tem formato textual, mas vamos tentar extrair o core
    
    grep -i "insight" "$FILE" | tail -n 50
    FOUND_ANY=1
  fi
done

if [ $FOUND_ANY -eq 0 ]; then
  echo "Nenhum arquivo de log encontrado. Execute os testes primeiro."
  echo "Esperado: reactive-test.log ou proactive-test.log"
else
  echo ""
  echo ">>> Fim da verificação."
fi
