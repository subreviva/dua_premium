/**
 * Password Validation - Enterprise Grade
 * 
 * Padrões baseados em:
 * - NIST SP 800-63B (Digital Identity Guidelines)
 * - OWASP Password Guidelines
 * - Microsoft, Google, Stripe policies
 */

export interface PasswordStrength {
  score: number; // 0-5 (0: muito fraca, 5: muito forte)
  feedback: string[];
  suggestions: string[];
  isValid: boolean;
  containsPersonalInfo?: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
}

// Enterprise Password Policy (Microsoft/Google padrão)
export const ENTERPRISE_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
};

// Top 100 senhas mais comuns (haveibeenpwned.com)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', '12345678', '111111', '1234567', '123123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'sunshine', 'princess', 'qwertyuiop', 'starwars',
  '1234567890', 'password1', 'welcome123', 'admin123', 'root',
  'user', 'test', 'guest', 'login', 'pass',
  'passw0rd', 'p@ssw0rd', 'p@ssword', 'iloveyou', 'trustno1',
  'football', 'baseball', 'liverpool', 'cheese', 'batman',
];

/**
 * Valida password contra política enterprise
 */
export function validatePassword(
  password: string,
  userInfo?: {
    name?: string;
    email?: string;
    username?: string;
  }
): PasswordStrength {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // 1. Comprimento mínimo (OBRIGATÓRIO)
  if (password.length < ENTERPRISE_POLICY.minLength) {
    feedback.push(`Password deve ter no mínimo ${ENTERPRISE_POLICY.minLength} caracteres`);
    suggestions.push('Adiciona mais caracteres para aumentar a segurança');
    return {
      score: 0,
      feedback,
      suggestions,
      isValid: false,
    };
  }

  // 2. Comprimento máximo
  if (password.length > ENTERPRISE_POLICY.maxLength) {
    feedback.push(`Password não pode exceder ${ENTERPRISE_POLICY.maxLength} caracteres`);
    return {
      score: 0,
      feedback,
      suggestions: ['Reduza o comprimento da password'],
      isValid: false,
    };
  }

  // 3. Verificar complexidade
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) {
    feedback.push('Adiciona pelo menos uma letra MAIÚSCULA');
    suggestions.push('Exemplo: Password123!');
  } else {
    score += 1;
  }

  if (!hasLowercase) {
    feedback.push('Adiciona pelo menos uma letra minúscula');
    suggestions.push('Exemplo: Password123!');
  } else {
    score += 1;
  }

  if (!hasNumbers) {
    feedback.push('Adiciona pelo menos um número');
    suggestions.push('Exemplo: Password123!');
  } else {
    score += 1;
  }

  if (!hasSpecialChars) {
    feedback.push('Adiciona pelo menos um símbolo (!@#$%^&*)');
    suggestions.push('Símbolos aumentam significativamente a segurança');
  } else {
    score += 1;
  }

  // Se não atende requisitos básicos, retornar inválida
  if (score < 4) {
    return {
      score,
      feedback,
      suggestions,
      isValid: false,
    };
  }

  // 4. Prevenir senhas comuns (verificar se a password É uma senha comum, não se contém)
  const passwordLower = password.toLowerCase();
  
  // Verificar se a password é exatamente uma senha comum
  const isExactlyCommon = COMMON_PASSWORDS.includes(passwordLower);
  
  // Ou se usa APENAS uma senha comum com números/símbolos básicos
  const isBasicVariation = COMMON_PASSWORDS.some(common => {
    // Remove números e símbolos básicos da password
    const stripped = passwordLower.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
    return stripped === common;
  });

  if (isExactlyCommon || isBasicVariation) {
    feedback.push('Esta password é muito comum e fácil de adivinhar');
    suggestions.push('Usa uma combinação única de palavras e caracteres');
    return {
      score: 1,
      feedback,
      suggestions,
      isValid: false,
    };
  }

  // 5. Prevenir informações pessoais (apenas se fornecidas)
  if (userInfo) {
    const personalInfo = [
      userInfo.name?.toLowerCase().split(' ').filter(part => part.length > 2), // Ignorar partes muito curtas
      userInfo.email?.split('@')[0].toLowerCase(),
      userInfo.username?.toLowerCase(),
    ].flat().filter(Boolean) as string[];

    const containsPersonalInfo = personalInfo.some(info => 
      info && info.length > 2 && passwordLower.includes(info)
    );

    if (containsPersonalInfo) {
      feedback.push('Password não deve conter informações pessoais');
      suggestions.push('Evita usar o teu nome, email ou username na password');
      return {
        score: 2,
        feedback,
        suggestions,
        isValid: false,
        containsPersonalInfo: true,
      };
    }
  }

  // 6. Calcular score final (0-5)
  // Base score: 4 (todos os requisitos)
  // Bonus por comprimento
  if (password.length >= 16) score += 1; // 5 pontos
  
  // Feedback positivo
  if (score >= 4) {
    feedback.push('✅ Password forte');
    if (score === 5) {
      feedback.push('🎉 Excelente! Password muito segura');
    }
  }

  return {
    score,
    feedback,
    suggestions: suggestions.length > 0 ? suggestions : [
      '💡 Dica: Usa uma frase longa e única',
      '💡 Considera usar um gestor de passwords',
    ],
    isValid: true,
  };
}

/**
 * Gera password forte aleatória (para sugestão)
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Garantir pelo menos 1 de cada tipo
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Preencher o resto aleatoriamente
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Verifica se password atende requisitos mínimos (validação rápida)
 */
export function meetsMinimumRequirements(password: string): boolean {
  return (
    password.length >= ENTERPRISE_POLICY.minLength &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
}

/**
 * Estima tempo para quebrar password (brute force)
 */
export function estimateCrackTime(password: string): string {
  const charsetSize = 
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/[0-9]/.test(password) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 32 : 0);
  
  const possibilities = Math.pow(charsetSize, password.length);
  
  // Assumindo 1 bilhão de tentativas por segundo (GPU moderna)
  const secondsToBreak = possibilities / 1_000_000_000;
  
  if (secondsToBreak < 1) return 'Instantâneo ⚠️';
  if (secondsToBreak < 60) return `${Math.round(secondsToBreak)} segundos ⚠️`;
  if (secondsToBreak < 3600) return `${Math.round(secondsToBreak / 60)} minutos ⚠️`;
  if (secondsToBreak < 86400) return `${Math.round(secondsToBreak / 3600)} horas ⚠️`;
  if (secondsToBreak < 31536000) return `${Math.round(secondsToBreak / 86400)} dias`;
  if (secondsToBreak < 31536000 * 100) return `${Math.round(secondsToBreak / 31536000)} anos ✅`;
  
  return 'Milhares de anos ✅✅';
}
