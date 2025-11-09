import { validatePassword } from '../lib/password-validation';

console.log('🔍 DEBUG: Testando passwords específicas\n');

const tests = [
  'MyP@ssw0rd12',
  'MyVeryStr0ng!P@ssword2024',
];

tests.forEach(password => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Password: "${password}"`);
  console.log(`Comprimento: ${password.length}`);
  
  const result = validatePassword(password, { 
    name: 'João Silva', 
    email: 'joao@example.com' 
  });
  
  console.log(`\n📊 Resultado:`);
  console.log(`  isValid: ${result.isValid}`);
  console.log(`  score: ${result.score}`);
  console.log(`  feedback: ${JSON.stringify(result.feedback, null, 2)}`);
  console.log(`  suggestions: ${JSON.stringify(result.suggestions, null, 2)}`);
  
  if (result.containsPersonalInfo !== undefined) {
    console.log(`  containsPersonalInfo: ${result.containsPersonalInfo}`);
  }
});
