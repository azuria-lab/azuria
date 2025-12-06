const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuração
const TARGET_URL = 'http://localhost:5173/calculadora/basica'; // Ajuste conforme porta local
const LOG_FILE = path.join(__dirname, 'reactive-test.log');

(async () => {
  console.log('>>> Iniciando Teste Reativo (Modo Deus)...');
  
  const browser = await chromium.launch({ headless: false }); // Headless false para ver acontecer
  const page = await browser.newPage();

  // Redirecionar logs do console para arquivo
  page.on('console', msg => {
    const text = `[BROWSER] ${msg.text()}`;
    console.log(text);
    fs.appendFileSync(LOG_FILE, text + '\n');
  });

  try {
    // 1. Acessar Calculadora
    console.log(`Navegando para ${TARGET_URL}...`);
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');

    // 2. Simular Interação do Usuário
    console.log('Preenchendo inputs...');
    
    // Seletores (ajuste conforme seus data-test-id ou classes reais)
    // Assumindo existência de inputs comuns baseados em labels ou placeholders
    const custoInput = page.locator('input[placeholder*="Custo"], input[name="custoProduto"]');
    const margemInput = page.locator('input[placeholder*="Margem"], input[name="margemDesejada"]');
    
    // Fallback se seletores não existirem (apenas demostração)
    if (await custoInput.count() > 0) {
        await custoInput.fill('100');
    } else {
        console.warn('⚠️ Input de custo não encontrado. Verifique coletores.');
    }

    if (await margemInput.count() > 0) {
        await margemInput.fill('20');
    }

    // 3. Aguardar Evento/Insight
    console.log('Aguardando insight gerado...');
    
    // Opção A: Verificar se um Toast apareceu
    // const toast = page.locator('.azuria-toast'); 
    // await toast.waitFor({ state: 'visible', timeout: 5000 });

    // Opção B: Injetar script para ouvir o EventBus (se exposto) ou apenas aguardar log no console
    // Como não expusemos o eventBus globalmente, vamos confiar nos logs do console 
    // que o sistema já emite ('Insight generated' ou eventos do watcher)
    
    // Aguarda um tempo para debounce e processamento
    await page.waitForTimeout(2000);

    console.log('✅ Teste Reativo Concluído (Verifique logs para confirmação do evento calc:completed)');

  } catch (error) {
    console.error('❌ Erro no teste reativo:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
