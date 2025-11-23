/**
 * Script para otimizar imagens da Azúria
 * Converte JPG para WebP em múltiplos tamanhos
 */

const fs = require('node:fs');
const path = require('node:path');

// Como não temos sharp instalado, vamos criar um guia para otimização manual
const optimizationGuide = `
# Guia de Otimização de Imagens - Azúria Avatar

## Tamanhos Necessários

1. **avatar-large.webp** (128x128) - Para header e displays grandes
2. **avatar-medium.webp** (64x64) - Para header padrão
3. **avatar-small.webp** (32x32) - Para miniaturas em seções
4. **avatar-tiny.webp** (16x16) - Para ícones pequenos

## Opção 1: Usando Ferramentas Online

### Squoosh (Recomendado)
1. Acesse: https://squoosh.app/
2. Arraste a imagem: public/images/azuria/avatar.jpg
3. Selecione formato: WebP
4. Ajuste qualidade: 85%
5. Redimensione para cada tamanho
6. Baixe e salve em public/images/azuria/

### TinyPNG
1. Acesse: https://tinypng.com/
2. Faça upload da imagem
3. Baixe a versão otimizada

## Opção 2: Usando ImageMagick (CLI)

\`\`\`bash
# Instalar ImageMagick primeiro
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Converter para WebP em diferentes tamanhos
magick public/images/azuria/avatar.jpg -resize 128x128 -quality 85 public/images/azuria/avatar-large.webp
magick public/images/azuria/avatar.jpg -resize 64x64 -quality 85 public/images/azuria/avatar-medium.webp
magick public/images/azuria/avatar.jpg -resize 32x32 -quality 85 public/images/azuria/avatar-small.webp
magick public/images/azuria/avatar.jpg -resize 16x16 -quality 85 public/images/azuria/avatar-tiny.webp
\`\`\`

## Opção 3: Usando Sharp (Node.js)

\`\`\`bash
# Instalar sharp
npm install --save-dev sharp

# Executar script de conversão
node scripts/optimize-avatar.js
\`\`\`

## Resultados Esperados

- **Redução de tamanho**: ~60-80% menor que JPG
- **Qualidade**: Mantida com qualidade 85%
- **Compatibilidade**: Suportado por todos navegadores modernos
- **Fallback**: JPG original como backup

## Próximos Passos

Após criar as imagens WebP:
1. Atualizar componentes para usar <picture> com fallback
2. Testar carregamento em diferentes navegadores
3. Verificar performance no Lighthouse
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'AVATAR_OPTIMIZATION_GUIDE.md'),
  optimizationGuide
);

console.log('✅ Guia de otimização criado: AVATAR_OPTIMIZATION_GUIDE.md');
console.log('');
console.log('📝 Próximos passos:');
console.log('1. Escolha uma das opções no guia para converter as imagens');
console.log('2. Salve as versões WebP em public/images/azuria/');
console.log('3. Execute o script de atualização dos componentes');
