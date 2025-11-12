import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dua.2lados.pt'
  
  // Data atual para lastModified
  const now = new Date()
  
  return [
    // Página principal - Prioridade máxima
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Estúdios - Alta prioridade
    {
      url: `${baseUrl}/chat`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/video-studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/music-studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/image-studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/design-studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // Páginas importantes
    {
      url: `${baseUrl}/comunidade`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comprar`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // Páginas de acesso
    {
      url: `${baseUrl}/acesso`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/registo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // Páginas legais
    {
      url: `${baseUrl}/privacidade`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/rgpd`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // Blog (se existir)
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    
    // Carreiras
    {
      url: `${baseUrl}/carreiras`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
