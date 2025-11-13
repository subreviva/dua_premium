/**
 * 🎨 DESIGN STUDIO - PROMPT ADAPTER
 * 
 * Adapta cada ferramenta do Design Studio para usar gemini-2.5-flash-image (5 créditos)
 * seguindo as melhores práticas da documentação oficial.
 * 
 * Todas as ferramentas agora usam o MESMO modelo, mas com prompts otimizados.
 */

import { ToolId, AspectRatio } from '@/types/designstudio';

export interface AdaptedPrompt {
  prompt: string;
  aspectRatio?: AspectRatio;
  responseModalities?: Array<'Text' | 'Image'>;
}

/**
 * Adapta o prompt baseado na ferramenta selecionada
 */
export function adaptPromptForTool(
  toolId: ToolId,
  userPrompt: string,
  options?: {
    aspectRatio?: AspectRatio;
    style?: string;
    mood?: string;
  }
): AdaptedPrompt {
  const { aspectRatio = '1:1', style, mood } = options || {};

  switch (toolId) {
    // ============================================
    // 🖼️ GERAR IMAGEM (GENÉRICO)
    // ============================================
    case 'generate-image':
    case 'gemini-flash-image':
      return {
        prompt: userPrompt,
        aspectRatio,
        responseModalities: ['Image'], // Só imagem, sem texto
      };

    // ============================================
    // ✨ GERAR LOGO
    // ============================================
    case 'generate-logo':
      return {
        prompt: `Create a professional logo design for "${userPrompt}". 
The logo should be clean, modern, and memorable. 
Use a balanced composition with clear shapes and professional typography.
The design should work well at any size and be suitable for branding.
The background must be transparent.
Style: minimalist, professional, iconic.`,
        aspectRatio: '1:1', // Logos são sempre quadrados
        responseModalities: ['Image'],
      };

    // ============================================
    // 🎯 GERAR ÍCONE
    // ============================================
    case 'generate-icon':
      return {
        prompt: `Create a clean, minimalist icon for "${userPrompt}".
The icon should be simple, recognizable, and work well at small sizes.
Use solid colors or gradients with clear shapes.
The background must be transparent.
Style: flat design, modern, scalable.`,
        aspectRatio: '1:1', // Ícones são sempre quadrados
        responseModalities: ['Image'],
      };

    // ============================================
    // 🎨 EDITAR IMAGEM
    // ============================================
    case 'edit-image':
      // Este caso será tratado no endpoint com imagem de entrada
      return {
        prompt: `Using the provided image, ${userPrompt}. 
Ensure the change integrates naturally with the original style, lighting, and composition.
Preserve the overall quality and aesthetic of the image.`,
        aspectRatio,
        responseModalities: ['Image'],
      };

    // ============================================
    // 🔲 GERAR PADRÃO
    // ============================================
    case 'generate-pattern':
      return {
        prompt: `Create a seamless repeating pattern based on "${userPrompt}".
The pattern should be tileable and work when repeated infinitely.
Use consistent spacing and balanced composition.
Style: ${style || 'modern, clean'}.
The pattern should be suitable for backgrounds, textiles, or wallpapers.`,
        aspectRatio: '1:1', // Padrões funcionam melhor em quadrado
        responseModalities: ['Image'],
      };

    // ============================================
    // 📦 MOCKUP DE PRODUTO
    // ============================================
    case 'product-mockup':
      return {
        prompt: `A high-resolution, studio-lit product photograph of ${userPrompt}.
The lighting is a three-point softbox setup to create even illumination with soft shadows.
The camera angle is a 3/4 view to showcase the product's key features.
Ultra-realistic, with sharp focus on product details.
Clean white or gradient background.
Professional e-commerce quality.
${aspectRatio === '16:9' ? 'Horizontal composition.' : aspectRatio === '9:16' ? 'Vertical composition.' : 'Square composition.'}`,
        aspectRatio,
        responseModalities: ['Image'],
      };

    // ============================================
    // 🎭 GERAR VARIAÇÕES
    // ============================================
    case 'generate-variations':
      // Este caso será tratado com a imagem original como input
      return {
        prompt: `Create a variation of the provided image maintaining the core concept but with ${userPrompt}.
Keep the overall composition and subject, but introduce creative changes.
Maintain professional quality and consistent style.`,
        aspectRatio,
        responseModalities: ['Image'],
      };

    // ============================================
    // 🎨 GERAR SVG (renderizado como imagem)
    // ============================================
    case 'generate-svg':
      return {
        prompt: `Create a clean, vector-style illustration for "${userPrompt}".
The design should have crisp edges, flat colors, and simple geometric shapes.
Style: vector art, flat design, suitable for logos or icons.
The background must be transparent.`,
        aspectRatio: '1:1',
        responseModalities: ['Image'],
      };

    // ============================================
    // 🧹 REMOVER FUNDO
    // ============================================
    case 'remove-background':
      return {
        prompt: `Using the provided image, remove the background completely, keeping only the main subject.
The edges should be clean and precise.
Output the subject isolated on a transparent background.
Preserve all details of the main subject.`,
        aspectRatio,
        responseModalities: ['Image'],
      };

    // ============================================
    // 🔍 UPSCALE IMAGEM
    // ============================================
    case 'upscale-image':
      return {
        prompt: `Enhance and upscale the provided image to higher resolution.
Preserve all original details and improve sharpness.
Add realistic texture details where appropriate.
Maintain the original composition and colors.`,
        aspectRatio,
        responseModalities: ['Image'],
      };

    // ============================================
    // 🎨 PALETA DE CORES
    // ============================================
    case 'color-palette':
      // Este caso retorna texto + imagem mostrando a paleta
      return {
        prompt: `Based on "${userPrompt}", create a color palette visualization showing 5-8 harmonious colors.
Display each color as a large swatch with its hex code.
Arrange the colors in an aesthetically pleasing layout.
Include the palette name at the top.
Style: clean, modern, professional.`,
        aspectRatio: '16:9', // Horizontal para mostrar paleta
        responseModalities: ['Image'],
      };

    // ============================================
    // 🔍 ANALISAR IMAGEM
    // ============================================
    case 'analyze-image':
      // Este caso retorna texto + imagem com anotações
      return {
        prompt: `Analyze the provided image and create a visual breakdown showing:
- Composition analysis with guide lines
- Color palette used
- Key design elements highlighted
- Typography assessment (if applicable)
Include text annotations explaining the analysis.`,
        aspectRatio,
        responseModalities: ['Text', 'Image'], // Texto E imagem
      };

    // ============================================
    // 📈 TENDÊNCIAS DE DESIGN
    // ============================================
    case 'design-trends':
      // Este caso retorna texto + imagens de exemplo
      return {
        prompt: `Create a visual mood board showing current design trends for "${userPrompt}".
Include 2-4 example images showcasing:
- Color trends
- Typography trends
- Layout styles
- Visual aesthetics
Arrange in a professional mood board layout with labels.`,
        aspectRatio: '16:9',
        responseModalities: ['Text', 'Image'],
      };

    // ============================================
    // 🤖 ASSISTENTE DE DESIGN
    // ============================================
    case 'design-assistant':
      // Este caso retorna principalmente texto com imagens de suporte
      return {
        prompt: `${userPrompt}
Provide design advice with visual examples where helpful.
Include best practices and actionable recommendations.`,
        aspectRatio: '16:9',
        responseModalities: ['Text', 'Image'],
      };

    // ============================================
    // 📤 EXPORTAR PROJETO
    // ============================================
    case 'export-project':
      // Este caso é especial, não gera imagem
      return {
        prompt: '',
        aspectRatio: '1:1',
        responseModalities: ['Image'],
      };

    // ============================================
    // DEFAULT
    // ============================================
    default:
      return {
        prompt: userPrompt,
        aspectRatio,
        responseModalities: ['Image'],
      };
  }
}

/**
 * Mapeia cada ferramenta para exemplos de prompts otimizados
 */
export const TOOL_PROMPT_EXAMPLES: Record<ToolId, string[]> = {
  'generate-image': [
    'A photorealistic shot of a coffee cup on a wooden table, illuminated by soft morning light',
    'A minimalist composition featuring a single flower positioned in the center',
    'A vibrant abstract pattern with geometric shapes in purple and gold',
  ],
  
  'gemini-flash-image': [
    'Create a stunning sunset over mountains',
    'Design a futuristic cityscape at night',
    'Generate an abstract art piece with flowing colors',
  ],
  
  'generate-logo': [
    'Tech startup focused on AI solutions',
    'Organic food delivery service',
    'Fitness coaching brand for women',
  ],
  
  'generate-icon': [
    'Settings gear icon',
    'Shopping cart icon',
    'User profile icon',
  ],
  
  'edit-image': [
    'Change the sky to a dramatic sunset',
    'Add a vintage film grain effect',
    'Transform the scene to winter with snow',
  ],
  
  'generate-pattern': [
    'Tropical leaves pattern in green and gold',
    'Geometric hexagon pattern in navy and white',
    'Watercolor floral pattern with soft pastels',
  ],
  
  'product-mockup': [
    'Wireless headphones in matte black',
    'Glass perfume bottle with gold accents',
    'Minimalist watch with leather strap',
  ],
  
  'generate-variations': [
    'Different color scheme',
    'Alternative composition',
    'Different time of day',
  ],
  
  'generate-svg': [
    'Mountain range icon',
    'Abstract wave logo',
    'Geometric badge design',
  ],
  
  'remove-background': [
    'Keep only the main subject',
  ],
  
  'upscale-image': [
    'Enhance to 4K resolution',
  ],
  
  'color-palette': [
    'Ocean sunset vibes',
    'Forest autumn colors',
    'Corporate professional palette',
  ],
  
  'analyze-image': [
    'Analyze composition and design elements',
  ],
  
  'design-trends': [
    'Modern web design 2025',
    'Minimalist branding trends',
    'Bold typography in advertising',
  ],
  
  'design-assistant': [
    'How can I improve the contrast in my design?',
    'What color palette works for a luxury brand?',
    'Best practices for mobile UI design',
  ],
  
  'export-project': [],
};
