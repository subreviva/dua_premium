/**
 * Testes para validação de password enterprise-grade
 */

import { validatePassword, generateStrongPassword, meetsMinimumRequirements, estimateCrackTime } from '../lib/password-validation';

console.log('🧪 INICIANDO TESTES DE VALIDAÇÃO DE PASSWORD...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => boolean) {
  totalTests++;
  try {
    const result = fn();
    if (result) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      failedTests++;
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    failedTests++;
    console.log(`❌ ${name} - ERROR: ${error}`);
  }
}

// ════════════════════════════════════════════════════════════════
// TESTE 1: Passwords FRACAS (devem ser rejeitadas)
// ════════════════════════════════════════════════════════════════
console.log('📋 Teste 1: Passwords Fracas (devem ser REJEITADAS)\n');

test('Rejeita password com apenas 6 caracteres', () => {
  const result = validatePassword('abc123', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.feedback.includes('Password deve ter no mínimo 12 caracteres');
});

test('Rejeita password sem maiúsculas', () => {
  const result = validatePassword('abcdefgh1234!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.score < 4;
});

test('Rejeita password sem minúsculas', () => {
  const result = validatePassword('ABCDEFGH1234!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.score < 4;
});

test('Rejeita password sem números', () => {
  const result = validatePassword('AbcdefghIJKL!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.score < 4;
});

test('Rejeita password sem símbolos', () => {
  const result = validatePassword('Abcdefgh1234', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.score < 4;
});

test('Rejeita password comum (password123)', () => {
  const result = validatePassword('Password123!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.feedback.some(f => f.includes('comum'));
});

test('Rejeita password com nome do utilizador', () => {
  const result = validatePassword('JoaoSilva123!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.containsPersonalInfo === true;
});

test('Rejeita password com parte do email', () => {
  const result = validatePassword('Joao@Email123!', { name: 'João Silva', email: 'joao@example.com' });
  return !result.isValid && result.containsPersonalInfo === true;
});

// ════════════════════════════════════════════════════════════════
// TESTE 2: Passwords FORTES (devem ser aceites)
// ════════════════════════════════════════════════════════════════
console.log('\n📋 Teste 2: Passwords Fortes (devem ser ACEITES)\n');

test('Aceita password forte (12 chars, complexa)', () => {
  const result = validatePassword('MyP@ssw0rd12', { name: 'João Silva', email: 'joao@example.com' });
  return result.isValid && result.score >= 4;
});

test('Aceita password muito forte (16+ chars)', () => {
  const result = validatePassword('MyVeryStr0ng!P@ssword2024', { name: 'João Silva', email: 'joao@example.com' });
  return result.isValid && result.score === 5;
});

test('Aceita frase-passe (passphrase)', () => {
  const result = validatePassword('C0rr3ct-H0rs3-B@tt3ry-St@pl3', { name: 'João Silva', email: 'joao@example.com' });
  return result.isValid && result.score === 5;
});

test('Aceita password aleatória forte', () => {
  const result = validatePassword('X7$mK9#pL2@qR5!', { name: 'João Silva', email: 'joao@example.com' });
  return result.isValid && result.score >= 4;
});

// ════════════════════════════════════════════════════════════════
// TESTE 3: Funções auxiliares
// ════════════════════════════════════════════════════════════════
console.log('\n📋 Teste 3: Funções Auxiliares\n');

test('meetsMinimumRequirements retorna true para password válida', () => {
  return meetsMinimumRequirements('MyP@ssw0rd12');
});

test('meetsMinimumRequirements retorna false para password fraca', () => {
  return !meetsMinimumRequirements('abc123');
});

test('generateStrongPassword gera password válida', () => {
  const password = generateStrongPassword(16);
  const result = validatePassword(password);
  return password.length === 16 && result.isValid;
});

test('estimateCrackTime retorna string não vazia', () => {
  const time = estimateCrackTime('MyP@ssw0rd12');
  return time.length > 0;
});

// ════════════════════════════════════════════════════════════════
// TESTE 4: Edge cases
// ════════════════════════════════════════════════════════════════
console.log('\n📋 Teste 4: Edge Cases\n');

test('Rejeita password maior que 128 caracteres', () => {
  const longPassword = 'A1!'.repeat(50); // 150 chars
  const result = validatePassword(longPassword);
  return !result.isValid;
});

test('Aceita password exatamente com 12 caracteres', () => {
  const result = validatePassword('MyP@ssw0rd12');
  return result.isValid;
});

test('Score aumenta com comprimento (16+ chars)', () => {
  const result12 = validatePassword('MyP@ssw0rd12');
  const result16 = validatePassword('MyP@ssw0rd123456');
  return result16.score > result12.score;
});

// ════════════════════════════════════════════════════════════════
// RESULTADOS
// ════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(80));
console.log('📊 RESULTADOS DOS TESTES');
console.log('═'.repeat(80));
console.log(`Total de testes: ${totalTests}`);
console.log(`✅ Passou: ${passedTests}`);
console.log(`❌ Falhou: ${failedTests}`);
console.log(`📈 Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);
console.log('═'.repeat(80));

if (failedTests === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failedTests} teste(s) falharam\n`);
  process.exit(1);
}
