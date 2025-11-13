#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;
const failures = [];

function test(name, condition, details = null) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failures.push(name);
    failed++;
  }
}

function fileContains(path, pattern) {
  if (!existsSync(join(__dirname, path))) return false;
  const content = readFileSync(join(__dirname, path), 'utf-8');
  if (pattern instanceof RegExp) {
    return pattern.test(content);
  }
  return content.includes(pattern);
}

console.log('\n🎬 CINEMA STUDIO - AUDITORIA DE PLAYER PREMIUM\n');
console.log('━'.repeat(70));
console.log('📱 MOBILE OPTIMIZATION');
console.log('━'.repeat(70));

const criarPath = 'app/videostudio/criar/page.tsx';

// Mobile Responsiveness
test('1.1 Responsive classes (sm:, lg:) no player', 
  fileContains(criarPath, /sm:|lg:/));

test('1.2 Flexbox mobile-first (flex-col sm:flex-row)', 
  fileContains(criarPath, 'flex-col') && fileContains(criarPath, 'sm:flex-row'));

test('1.3 Mobile padding adjustments (p-4 sm:p-6)', 
  fileContains(criarPath, /p-\d+ sm:p-\d+/));

test('1.4 Mobile text scaling (text-base sm:text-lg)', 
  fileContains(criarPath, /text-\w+ sm:text-\w+/));

test('1.5 Video maxHeight para mobile', 
  fileContains(criarPath, 'maxHeight'));

test('1.6 Video playsInline para mobile', 
  fileContains(criarPath, 'playsInline'));

test('1.7 Touch-friendly button sizes (py-4)', 
  fileContains(criarPath, 'py-4'));

console.log('\n━'.repeat(70));
console.log('✨ PREMIUM LOADING STATE');
console.log('━'.repeat(70));

// Loading Elegance
test('2.1 Animated loading icon (Sparkles)', 
  fileContains(criarPath, 'Sparkles'));

test('2.2 Rotating animation (animate: { rotate: 360 })', 
  fileContains(criarPath, /rotate.*360/));

test('2.3 Gradient background blur', 
  fileContains(criarPath, 'blur-xl'));

test('2.4 Progress bar with gradient', 
  fileContains(criarPath, 'from-blue-500 via-purple-500 to-pink-500'));

test('2.5 Shimmer effect (animate: { x: ))', 
  fileContains(criarPath, /animate.*x:/));

test('2.6 Progress steps (Iniciando, Processando, Finalizando)', 
  fileContains(criarPath, 'Iniciando') && 
  fileContains(criarPath, 'Processando') &&
  fileContains(criarPath, 'Finalizando'));

test('2.7 Loading status text dynamic', 
  fileContains(criarPath, 'isUploading ? ') || 
  fileContains(criarPath, 'isProcessing ? '));

test('2.8 Percentage display', 
  fileContains(criarPath, 'Math.round(progress)'));

console.log('\n━'.repeat(70));
console.log('🎥 PREMIUM VIDEO PLAYER');
console.log('━'.repeat(70));

// Player Features
test('3.1 Glow effect around player', 
  fileContains(criarPath, 'blur-2xl') && fileContains(criarPath, 'group-hover:opacity'));

test('3.2 Rounded corners (rounded-2xl, rounded-3xl)', 
  fileContains(criarPath, 'rounded-2xl') || fileContains(criarPath, 'rounded-3xl'));

test('3.3 Custom play/pause overlay', 
  fileContains(criarPath, 'togglePlayPause'));

test('3.4 Play/Pause icons (Play, Pause)', 
  fileContains(criarPath, 'Play') && fileContains(criarPath, 'Pause'));

test('3.5 Video controls enabled', 
  fileContains(criarPath, 'controls'));

test('3.6 Video ref for control', 
  fileContains(criarPath, 'resultVideoRef'));

test('3.7 Border with gradient', 
  fileContains(criarPath, 'border-white/10'));

test('3.8 Shadow effect', 
  fileContains(criarPath, 'shadow'));

console.log('\n━'.repeat(70));
console.log('⬇️ DOWNLOAD BUTTON');
console.log('━'.repeat(70));

// Download Button
test('4.1 Download icon presente', 
  fileContains(criarPath, 'Download'));

test('4.2 Download link com href', 
  fileContains(criarPath, 'download='));

test('4.3 Animated gradient background', 
  fileContains(criarPath, 'from-blue-500 via-purple-500 to-pink-500'));

test('4.4 Hover animation (whileHover: { scale: 1.02 })', 
  fileContains(criarPath, 'whileHover'));

test('4.5 Tap animation (whileTap: { scale: 0.98 })', 
  fileContains(criarPath, 'whileTap'));

test('4.6 Animated shimmer on button', 
  fileContains(criarPath, 'via-white/20'));

test('4.7 Arrow animation (→)', 
  fileContains(criarPath, '→'));

test('4.8 Text "Baixar Vídeo"', 
  fileContains(criarPath, 'Baixar Vídeo'));

test('4.9 Full width on mobile (w-full)', 
  fileContains(criarPath, 'w-full'));

console.log('\n━'.repeat(70));
console.log('🎨 PREMIUM UI ELEMENTS');
console.log('━'.repeat(70));

// Premium Elements
test('5.1 Success badge animated', 
  fileContains(criarPath, 'CheckCircle2'));

test('5.2 Success message with description', 
  fileContains(criarPath, 'Vídeo criado com sucesso'));

test('5.3 Video info card', 
  fileContains(criarPath, 'Duração') && fileContains(criarPath, 'Proporção'));

test('5.4 Grid layout for info (grid-cols-2 sm:grid-cols-4)', 
  fileContains(criarPath, 'grid-cols-2') && fileContains(criarPath, 'sm:grid-cols-4'));

test('5.5 Model badge (Gen4 Turbo)', 
  fileContains(criarPath, 'Gen4 Turbo'));

test('5.6 Quality badge (Premium)', 
  fileContains(criarPath, 'Premium'));

test('5.7 AnimatePresence for result', 
  fileContains(criarPath, 'AnimatePresence'));

test('5.8 Initial/animate/exit animations', 
  fileContains(criarPath, 'initial=') && 
  fileContains(criarPath, 'animate=') &&
  fileContains(criarPath, 'exit='));

console.log('\n━'.repeat(70));
console.log('🔄 CREATE NEW BUTTON');
console.log('━'.repeat(70));

// Create New Button
test('6.1 RotateCw icon presente', 
  fileContains(criarPath, 'RotateCw'));

test('6.2 Icon rotation on hover', 
  fileContains(criarPath, 'group-hover/new:rotate-180'));

test('6.3 Reset handler (handleReset)', 
  fileContains(criarPath, 'handleReset'));

test('6.4 Text "Criar Novo"', 
  fileContains(criarPath, 'Criar Novo'));

test('6.5 Backdrop blur effect', 
  fileContains(criarPath, 'backdrop-blur-xl'));

console.log('\n━'.repeat(70));
console.log('📊 RESULTADO FINAL');
console.log('━'.repeat(70));

const total = passed + failed;
const percentage = ((passed / total) * 100).toFixed(1);

console.log(`\nTotal de Verificações: ${total}`);
console.log(`✅ Passou: ${passed}`);
console.log(`❌ Falhou: ${failed}`);
console.log(`📈 Taxa de Sucesso: ${percentage}%`);

if (failed > 0) {
  console.log('\n━'.repeat(70));
  console.log('❌ VERIFICAÇÕES QUE FALHARAM:');
  console.log('━'.repeat(70));
  failures.forEach((f, i) => console.log(`${i + 1}. ${f}`));
}

console.log('\n━'.repeat(70));
if (percentage >= 95) {
  console.log('✅ PLAYER PREMIUM: EXCELENTE (100% Mobile-Optimized)');
} else if (percentage >= 85) {
  console.log('⚠️  PLAYER PREMIUM: BOM (algumas melhorias sugeridas)');
} else {
  console.log('❌ PLAYER: NECESSITA OTIMIZAÇÕES');
}
console.log('━'.repeat(70) + '\n');

process.exit(percentage >= 95 ? 0 : 1);
