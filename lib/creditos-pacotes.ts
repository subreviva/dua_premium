/**
 * PACOTES DE CRÉDITOS DUA IA
 * 
 * Conversão: 1 DUA COIN (€0,30) = 10 CRÉDITOS
 * Tabela otimizada para máximo lucro
 */

export interface CreditPackage {
  id: string;
  name: string;
  icon: string;
  dua: number;
  priceEUR: number;
  creditsBase: number;
  bonusPercent: number;
  bonusCredits: number;
  totalCredits: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
  description?: string;
  features?: string[];
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🎯',
    dua: 10,
    priceEUR: 3.00,
    creditsBase: 100,
    bonusPercent: 0,
    bonusCredits: 0,
    totalCredits: 100,
    pricePerCredit: 0.030,
    description: 'Ideal para experimentar',
    features: [
      '33 imagens',
      '16 músicas',
      '3 vídeos 5s',
      '100 mensagens chat'
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: '💡',
    dua: 25,
    priceEUR: 7.50,
    creditsBase: 250,
    bonusPercent: 5,
    bonusCredits: 12,
    totalCredits: 262,
    pricePerCredit: 0.029,
    description: 'Para uso casual',
    savings: 'Economize 3%',
    features: [
      '87 imagens',
      '43 músicas',
      '8 vídeos 5s',
      '262 mensagens chat',
      '+5% bônus'
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    icon: '⭐',
    dua: 50,
    priceEUR: 15.00,
    creditsBase: 500,
    bonusPercent: 10,
    bonusCredits: 50,
    totalCredits: 550,
    pricePerCredit: 0.027,
    popular: true,
    description: 'Mais popular!',
    savings: 'Economize 10%',
    features: [
      '183 imagens',
      '91 músicas',
      '18 vídeos 5s',
      '550 mensagens chat',
      '+10% bônus'
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: '🔥',
    dua: 100,
    priceEUR: 30.00,
    creditsBase: 1000,
    bonusPercent: 15,
    bonusCredits: 150,
    totalCredits: 1150,
    pricePerCredit: 0.026,
    description: 'Para criadores ativos',
    savings: 'Economize 13%',
    features: [
      '383 imagens',
      '191 músicas',
      '38 vídeos 5s',
      '1150 mensagens chat',
      '+15% bônus'
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '💎',
    dua: 200,
    priceEUR: 60.00,
    creditsBase: 2000,
    bonusPercent: 20,
    bonusCredits: 400,
    totalCredits: 2400,
    pricePerCredit: 0.025,
    description: 'Para profissionais',
    savings: 'Economize 17%',
    features: [
      '800 imagens',
      '400 músicas',
      '80 vídeos 5s',
      '2400 mensagens chat',
      '+20% bônus',
      'Suporte prioritário'
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: '👑',
    dua: 500,
    priceEUR: 150.00,
    creditsBase: 5000,
    bonusPercent: 25,
    bonusCredits: 1250,
    totalCredits: 6250,
    pricePerCredit: 0.024,
    description: 'Melhor valor!',
    savings: 'Economize 20%',
    features: [
      '2083 imagens',
      '1041 músicas',
      '208 vídeos 5s',
      '6250 mensagens chat',
      '+25% bônus',
      'Suporte VIP',
      'Acesso antecipado'
    ],
  },
];

/**
 * Retorna um pacote pelo ID
 */
export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

/**
 * Retorna o pacote mais popular
 */
export function getPopularPackage(): CreditPackage {
  return CREDIT_PACKAGES.find(pkg => pkg.popular) || CREDIT_PACKAGES[2];
}

/**
 * Calcula quantas operações o pacote permite
 */
export function calculatePackageValue(pkg: CreditPackage) {
  return {
    // ESTÚDIO DE IMAGENS (3 créditos cada)
    imagens: Math.floor(pkg.totalCredits / 3),
    imagensEdit: Math.floor(pkg.totalCredits / 2),
    imagensUpscale: Math.floor(pkg.totalCredits / 1),
    
    // ESTÚDIO DE MÚSICA (6 créditos música simples)
    musicas: Math.floor(pkg.totalCredits / 6),
    musicasFull: Math.floor(pkg.totalCredits / 18),
    musicasExtend: Math.floor(pkg.totalCredits / 8),
    convertWAV: Math.floor(pkg.totalCredits / 1),
    separateVocals: Math.floor(pkg.totalCredits / 5),
    stemSplit: Math.floor(pkg.totalCredits / 25),
    
    // ESTÚDIO DE VÍDEO (30 créditos vídeo 5s fast)
    videos5sFast: Math.floor(pkg.totalCredits / 30),
    videos15sFast: Math.floor(pkg.totalCredits / 90),
    videos5sStandard: Math.floor(pkg.totalCredits / 60),
    videos15sStandard: Math.floor(pkg.totalCredits / 180),
    
    // ESTÚDIO DE DESIGN
    designs: Math.floor(pkg.totalCredits / 4),
    designsSVG: Math.floor(pkg.totalCredits / 3),
    designsVariations: Math.floor(pkg.totalCredits / 2),
    
    // CHAT
    chatMessages: Math.floor(pkg.totalCredits / 1),
    chatMessagesLong: Math.floor(pkg.totalCredits / 2),
  };
}

/**
 * Compara dois pacotes
 */
export function comparePackages(packageId1: string, packageId2: string) {
  const pkg1 = getPackageById(packageId1);
  const pkg2 = getPackageById(packageId2);
  
  if (!pkg1 || !pkg2) {
    throw new Error('Pacote não encontrado');
  }
  
  const diff = {
    creditsDiff: pkg2.totalCredits - pkg1.totalCredits,
    priceDiff: pkg2.priceEUR - pkg1.priceEUR,
    pricePerCreditDiff: pkg2.pricePerCredit - pkg1.pricePerCredit,
    savingsPercent: ((pkg1.pricePerCredit - pkg2.pricePerCredit) / pkg1.pricePerCredit * 100).toFixed(1),
  };
  
  return {
    package1: pkg1,
    package2: pkg2,
    difference: diff,
    recommendation: diff.creditsDiff > 0 && diff.savingsPercent > 5 
      ? `Upgrade para ${pkg2.name} e economize ${diff.savingsPercent}%!`
      : `${pkg1.name} é suficiente para suas necessidades`,
  };
}

/**
 * Sugere pacote baseado em uso estimado
 */
export function suggestPackage(usage: {
  imagens?: number;
  musicas?: number;
  videos5s?: number;
  chatMessages?: number;
}) {
  // Calcula créditos necessários
  const creditosNecessarios = 
    (usage.imagens || 0) * 3 +
    (usage.musicas || 0) * 6 +
    (usage.videos5s || 0) * 30 +
    (usage.chatMessages || 0) * 1;
  
  // Encontra o pacote mais adequado (com ~20% de margem)
  const creditosComMargem = creditosNecessarios * 1.2;
  
  for (const pkg of CREDIT_PACKAGES) {
    if (pkg.totalCredits >= creditosComMargem) {
      return {
        suggestedPackage: pkg,
        creditosNecessarios,
        creditosComMargem: Math.ceil(creditosComMargem),
        sobraEstimada: pkg.totalCredits - creditosNecessarios,
        economia: pkg.savings || 'Sem bônus',
      };
    }
  }
  
  // Se nenhum pacote for suficiente, sugere o maior
  return {
    suggestedPackage: CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1],
    creditosNecessarios,
    creditosComMargem: Math.ceil(creditosComMargem),
    sobraEstimada: 0,
    observacao: 'Uso muito intenso! Considere múltiplas recargas ou plano empresarial.',
  };
}

/**
 * Calcula ROI (Return on Investment) de cada pacote
 */
export function calculatePackageROI() {
  return CREDIT_PACKAGES.map(pkg => {
    const value = calculatePackageValue(pkg);
    
    // Estima valor de mercado (quanto custaria em outros serviços)
    const marketValue = 
      value.imagens * 0.10 + // DALL-E ~€0.10/img
      value.musicas * 0.50 + // Suno ~€0.50/música
      value.videos5sFast * 2.00; // Runway ~€2/vídeo 5s
    
    const roi = ((marketValue - pkg.priceEUR) / pkg.priceEUR * 100).toFixed(0);
    
    return {
      package: pkg,
      marketValue: marketValue.toFixed(2),
      savings: (marketValue - pkg.priceEUR).toFixed(2),
      roi: `${roi}%`,
    };
  });
}

/**
 * Exporta estatísticas de todos os pacotes
 */
export function getPackageStats() {
  return {
    totalPackages: CREDIT_PACKAGES.length,
    cheapest: CREDIT_PACKAGES[0],
    mostExpensive: CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1],
    popular: getPopularPackage(),
    averagePrice: (CREDIT_PACKAGES.reduce((sum, pkg) => sum + pkg.priceEUR, 0) / CREDIT_PACKAGES.length).toFixed(2),
    totalCreditsAvailable: CREDIT_PACKAGES.reduce((sum, pkg) => sum + pkg.totalCredits, 0),
    bestValue: CREDIT_PACKAGES.reduce((best, pkg) => 
      pkg.pricePerCredit < best.pricePerCredit ? pkg : best
    ),
  };
}
