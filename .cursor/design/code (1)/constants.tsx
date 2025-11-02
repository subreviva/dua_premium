
import React from 'react';
import { Tool } from './types';

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const TOOLS: Tool[] = [
  {
    id: 'generate-image',
    name: 'Gerar Imagem',
    description: 'Crie uma nova imagem a partir de uma instrução de texto.',
    icon: (
      <IconWrapper>
        <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
        <path d="m9 12 2-2 2 2" />
        <path d="m12 15-2-2" />
      </IconWrapper>
    ),
  },
  {
    id: 'edit-image',
    name: 'Editar Imagem',
    description: 'Modifique a imagem atual com uma instrução de edição.',
    icon: (
      <IconWrapper>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </IconWrapper>
    ),
  },
  {
    id: 'generate-logo',
    name: 'Gerar Logótipo',
    description: 'Crie um logótipo único para a sua marca ou projeto.',
    icon: (
      <IconWrapper>
        <path d="M12 15-3 21l.9-5.2L3 11l5.2-.9L12 3l3.8 7.1L21 11l-4.8 4.8.9 5.2z" />
      </IconWrapper>
    ),
  },
  {
    id: 'generate-icon',
    name: 'Gerar Ícone',
    description: 'Desenhe um ícone simples e limpo para qualquer finalidade.',
    icon: (
      <IconWrapper>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </IconWrapper>
    ),
  },
  {
    id: 'generate-svg',
    name: 'Gerador de Vetor (SVG)',
    description: 'Crie gráficos vetoriais escaláveis a partir de uma descrição.',
    icon: (
      <IconWrapper>
        <path d="M20.42 10.18a.5.5 0 0 0-.42-.18H10.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h6.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5H8" />
        <path d="M4.5 12.5v-3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v3" />
        <path d="M19.5 12.5v-3a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5v3" />
      </IconWrapper>
    ),
  },
  {
    id: 'generate-pattern',
    name: 'Gerador de Padrões',
    description: 'Crie padrões contínuos e repetíveis para fundos e texturas.',
    icon: (
      <IconWrapper>
        <path d="M2 12h2.5" />
        <path d="M19.5 12h2.5" />
        <path d="M12 2v2.5" />
        <path d="M12 19.5v2.5" />
        <path d="M4.5 4.5l1.8 1.8" />
        <path d="M17.7 17.7l1.8 1.8" />
        <path d="M4.5 19.5l1.8-1.8" />
        <path d="M17.7 6.3l1.8-1.8" />
        <circle cx="12" cy="12" r="2.5" />
      </IconWrapper>
    ),
  },
  {
    id: 'color-palette',
    name: 'Paleta de Cores',
    description: 'Extraia a paleta de cores dominante da imagem na tela.',
    icon: (
      <IconWrapper>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m12 2 4 10-4 10-4-10Z"></path>
        <path d="M2 12h20"></path>
      </IconWrapper>
    ),
  },
  {
    id: 'product-mockup',
    name: 'Mockup de Produto',
    description: 'Coloque o seu design num produto ou cena.',
    icon: (
      <IconWrapper>
        <path d="m21 16-4 4-4-4"></path>
        <path d="M17 20V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"></path>
        <path d="M17 10h.01"></path>
        <path d="M17 14h.01"></path>
      </IconWrapper>
    ),
  },
  {
    id: 'generate-variations',
    name: 'Gerador de Variações',
    description: 'Crie variações artísticas da imagem atual.',
    icon: (
      <IconWrapper>
        <path d="M6 2.5V1" />
        <path d="M6 7.5V6" />
        <path d="M3.5 4h5" />
        <path d="M18 10V8" />
        <path d="M18 15v-2" />
        <path d="M15.5 12.5h5" />
        <path d="M12 21v-2" />
        <path d="M12 16v-2" />
        <path d="M9.5 18.5h5" />
        <path d="M18 3.5V2" />
        <path d="M12 3.5V2" />
        <path d="M6 3.5V2" />
        <path d="M18 22v-1.5" />
        <path d="M12 22v-1.5" />
        <path d="M6 22v-1.5" />
        <path d="M22 18h-1.5" />
        <path d="M22 12h-1.5" />
        <path d="M22 6h-1.5" />
        <path d="M2 18h1.5" />
        <path d="M2 12h1.5" />
        <path d="M2 6h1.5" />
      </IconWrapper>
    ),
  },
  {
    id: 'analyze-image',
    name: 'Analisador de Imagem',
    description: 'Gere uma descrição detalhada (alt-text) da imagem na tela.',
    icon: (
      <IconWrapper>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 17a5 5 0 0 0 5-5" />
        <path d="M12 7a5 5 0 0 1 5 5" />
      </IconWrapper>
    ),
  },
  {
    id: 'design-trends',
    name: 'Pesquisa de Tendências',
    description: 'Pesquise as últimas tendências de design com o nosso motor de busca.',
    icon: (
      <IconWrapper>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
        <circle cx="12" cy="5" r="2" />
      </IconWrapper>
    ),
  },
  {
    id: 'design-assistant',
    name: 'Assistente de Design',
    description: 'Converse em tempo real com DUA, a sua assistente de design.',
    icon: (
      <IconWrapper>
        <path d="M12 6V2m0 20v-4m7.3-1.7-2.8-2.8M6.7 8.5 3.9 5.7M20 12h4m-24 0h4m15.6 5.6-2.8-2.8M8.5 6.7 5.7 3.9" />
        <circle cx="12" cy="12" r="2" />
      </IconWrapper>
    ),
  },
  {
    id: 'export-project',
    name: 'Exportar Projeto',
    description: 'Exporte os ativos e as instruções da sua sessão atual.',
    icon: (
      <IconWrapper>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </IconWrapper>
    ),
  },
];
