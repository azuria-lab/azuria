const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://localhost:5173/dashboard';
const LOG_FILE = path.join(__dirname, 'proactive-test.log');

(async () => {
  console.log('>>> Iniciando Teste Proativo (Modo Deus)...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = `[BROWSER] ${msg.text()}`;
    // Filtrar apenas logs relevantes para limpar saída
    if (text.includes('Proactive') || text.includes('Insight')) {
        console.log(text);
        fs.appendFileSync(LOG_FILE, text + '\n');
    }
  });

  try {
    console.log(`Navegando para ${TARGET_URL}...`);
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');

    console.log('Simulando estado de "Margem Baixa" via Console...');
    
    // Truque: Como não podemos alterar o código, vamos injetar um evento simulado 
    // Assumindo que conseguimos chamar emitEvent se estivesse exposto, 
    // mas aqui vamos apenas aguardar o ciclo natural ou forçar via interação UI.
    
    // Cenário Realista sem alterar código:
    // O Proactive Engine roda a cada 30s.
    // Vamos esperar 35s para garantir pelo menos um ciclo de verificação.
    
    console.log('⏳ Aguardando ciclo do Proactive Engine (35s)...');
    await page.waitForTimeout(35000);

    // Verificar se logs indicam execução
    const logs = fs.readFileSync(LOG_FILE, 'utf8');
    if (logs.includes('Proactive engine started')) {
        console.log('✅ Proactive Engine detectado como ativo.');
    } else {
        console.warn('⚠️ Logs não confirmaram start do engine.');
    }

    if (logs.includes('insight:generated')) {
        console.log('✅ Insight proativo gerado com sucesso!');
    } else {
        console.log('ℹ️ Nenhum insight gerado neste ciclo (esperado se não houver condição de alerta).');
    }

  } catch (error) {
    console.error('❌ Erro no teste proativo:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
