import { Metadata } from 'next'

interface SEOMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogType?: string
  canonical?: string
  noindex?: boolean
}

export function generateSEOMetadata({
  title = "DUA IA - Assistente de IA Criativa Portuguesa | Estúdios de Criação com Inteligência Artificial",
  description = "DUA é a primeira assistente de IA criativa lusófona. Crie música, vídeos, designs e imagens com inteligência artificial. Plataforma portuguesa de criação digital com IA generativa para artistas, criadores e marcas.",
  keywords = [
    // Termos principais - PT
    "ia portugal",
    "inteligencia artificial portugal",
    "criação com ia",
    "assistente ia português",
    "dua ia",
    "2 lados",
    
    // Estúdios específicos
    "criar musica com ia",
    "gerar imagens ia portugal",
    "editor video ia",
    "design grafico ia",
    "chat ia portugues",
    
    // Long-tail keywords
    "como criar musica com inteligencia artificial",
    "melhor ia para criadores portugal",
    "plataforma criativa portuguesa",
    "ia generativa em portugues",
    "ferramentas ia para artistas",
    
    // Serviços e produtos
    "music studio ia",
    "image studio ia",
    "video studio ia", 
    "design studio ia",
    "chat ia criativo",
    
    // Localização
    "startup portuguesa ia",
    "tecnologia portuguesa",
    "inovacao portugal",
    "lusofonia tecnologia",
    
    // Competição
    "alternativa midjourney portugal",
    "alternativa chatgpt portugues",
    "alternativa suno portugal",
    
    // Ecossistema
    "kyntal",
    "dua coin",
    "distribuicao musical portugal",
    "blockchain criativo",
    
    // Termos técnicos
    "ia generativa",
    "machine learning criativo",
    "neural networks arte",
    "deep learning musica",
  ],
  ogImage = "/og-image-dua.jpg",
  ogType = "website",
  canonical,
  noindex = false,
}: SEOMetadataProps): Metadata {
  const baseUrl = "https://dua.2lados.pt"
  const fullTitle = title.includes("DUA") ? title : `${title} | DUA IA`
  
  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "2 LADOS", url: "https://www.2lados.pt" }],
    creator: "2 LADOS",
    publisher: "2 LADOS",
    
    // Open Graph
    openGraph: {
      type: ogType as any,
      locale: "pt_PT",
      alternateLocale: ["pt_BR", "pt_AO", "pt_MZ"],
      url: canonical || baseUrl,
      title: fullTitle,
      description,
      siteName: "DUA IA",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "DUA - Assistente de IA Criativa Portuguesa",
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: "@2lados",
    },
    
    // Robots
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verificação
    verification: {
      google: "adicionar-codigo-google-search-console",
      yandex: "adicionar-codigo-yandex",
    },
    
    // Alternativas de idioma
    alternates: {
      canonical: canonical || baseUrl,
      languages: {
        'pt-PT': baseUrl,
        'pt-BR': `${baseUrl}/br`,
        'pt-AO': `${baseUrl}/ao`,
      },
    },
    
    // Categorização
    category: "Technology",
    
    // Outros metadados
    other: {
      'google-site-verification': 'adicionar-codigo-verificacao',
      'facebook-domain-verification': 'adicionar-codigo-facebook',
    },
  }
}

// JSON-LD Schema para SEO avançado
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '2 LADOS',
    alternateName: 'DUA IA',
    url: 'https://www.2lados.pt',
    logo: 'https://dua.2lados.pt/logo.png',
    description: 'Plataforma de criação com inteligência artificial para artistas e criadores lusófonos',
    
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PT',
        addressLocality: 'Portugal',
      },
    },
    
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+351-964-696-576',
        contactType: 'Customer Service',
        email: 'info@2lados.pt',
        availableLanguage: ['pt', 'pt-PT', 'pt-BR'],
      },
    ],
    
    sameAs: [
      'https://www.instagram.com/_2lados/',
      'https://www.instagram.com/soudua_/',
      'https://www.instagram.com/kyntal_/',
      'https://www.facebook.com/p/2-Lados-61575605463692/',
      'https://www.tiktok.com/@2.lados',
      'https://www.tiktok.com/@soudua',
    ],
    
    areaServed: {
      '@type': 'Country',
      name: ['Portugal', 'Brasil', 'Angola', 'Moçambique', 'Cabo Verde'],
    },
    
    brand: [
      {
        '@type': 'Brand',
        name: 'DUA IA',
        url: 'https://dua.2lados.pt',
      },
      {
        '@type': 'Brand',
        name: 'Kyntal',
        url: 'https://kyntal.pt',
      },
      {
        '@type': 'Brand',
        name: 'DUA Coin',
        url: 'https://duacoin.2lados.pt',
      },
    ],
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DUA IA',
    url: 'https://dua.2lados.pt',
    description: 'Assistente de IA criativa portuguesa para criação de música, imagens, vídeos e designs',
    
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://dua.2lados.pt/pesquisar?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    
    publisher: {
      '@type': 'Organization',
      name: '2 LADOS',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dua.2lados.pt/logo.png',
      },
    },
    
    inLanguage: 'pt-PT',
  }
}

export function generateSoftwareAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DUA IA',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web, iOS, Android',
    
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    
    description: 'Plataforma de criação com IA: música, imagens, vídeos, designs e chat inteligente em português',
    
    featureList: [
      'Chat IA em Português',
      'Music Studio - Criação Musical com IA',
      'Image Studio - Geração de Imagens',
      'Video Studio - Edição e Criação de Vídeos',
      'Design Studio - Design Gráfico Inteligente',
    ],
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
