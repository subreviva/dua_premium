#!/usr/bin/env node

/**
 * ATUALIZAR TABELA service_costs
 * Limpar dados antigos e inserir os 29 serviços do Sistema V4.0
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔄 ATUALIZAÇÃO: service_costs → Sistema V4.0\n');
console.log('============================================================\n');

// Novos 29 serviços
const services = [
  // MUSIC STUDIO (6 serviços)
  { service_name: 'music_generate_v5', service_label: 'Gerar Música V5', service_description: 'Geração de música com IA (última versão)', credits_cost: 6, icon: 'Music', category: 'music' },
  { service_name: 'music_add_instrumental', service_label: 'Adicionar Instrumental', service_description: 'Adicionar faixa instrumental à música', credits_cost: 6, icon: 'Music', category: 'music' },
  { service_name: 'music_add_vocals', service_label: 'Adicionar Vocais', service_description: 'Adicionar vocais à música', credits_cost: 6, icon: 'Mic', category: 'music' },
  { service_name: 'music_separate_vocals', service_label: 'Separar Vocais', service_description: 'Separar vocais e instrumental', credits_cost: 5, icon: 'SplitSquare', category: 'music' },
  { service_name: 'music_convert_wav', service_label: 'Converter para WAV', service_description: 'Converter música para formato WAV', credits_cost: 1, icon: 'FileAudio', category: 'music' },
  { service_name: 'music_generate_midi', service_label: 'Gerar MIDI', service_description: 'Converter música para arquivo MIDI', credits_cost: 1, icon: 'Piano', category: 'music' },
  
  // DESIGN STUDIO (16 serviços)
  { service_name: 'generate_image', service_label: 'Gerar Imagem', service_description: 'Criar imagem com IA', credits_cost: 4, icon: 'Image', category: 'design' },
  { service_name: 'generate_logo', service_label: 'Gerar Logo', service_description: 'Criar logo profissional', credits_cost: 6, icon: 'Shapes', category: 'design' },
  { service_name: 'generate_icon', service_label: 'Gerar Ícone', service_description: 'Criar ícone personalizado', credits_cost: 4, icon: 'Star', category: 'design' },
  { service_name: 'generate_pattern', service_label: 'Gerar Padrão', service_description: 'Criar padrão decorativo', credits_cost: 4, icon: 'Grid', category: 'design' },
  { service_name: 'generate_svg', service_label: 'Gerar SVG', service_description: 'Criar gráfico vetorial SVG', credits_cost: 6, icon: 'PenTool', category: 'design' },
  { service_name: 'edit_image', service_label: 'Editar Imagem', service_description: 'Editar imagem com IA', credits_cost: 5, icon: 'Edit', category: 'design' },
  { service_name: 'remove_background', service_label: 'Remover Fundo', service_description: 'Remover fundo de imagem', credits_cost: 5, icon: 'Layers', category: 'design' },
  { service_name: 'upscale_image', service_label: 'Aumentar Resolução', service_description: 'Upscale de imagem com IA', credits_cost: 6, icon: 'Maximize', category: 'design' },
  { service_name: 'product_mockup', service_label: 'Mockup de Produto', service_description: 'Criar mockups de produtos', credits_cost: 5, icon: 'Package', category: 'design' },
  { service_name: 'generate_variations', service_label: 'Gerar Variações', service_description: 'Criar variações de design', credits_cost: 8, icon: 'Copy', category: 'design' },
  { service_name: 'analyze_image', service_label: 'Analisar Imagem', service_description: 'Análise de imagem com IA', credits_cost: 2, icon: 'Eye', category: 'design' },
  { service_name: 'extract_colors', service_label: 'Extrair Cores', service_description: 'Extrair paleta de cores', credits_cost: 2, icon: 'Palette', category: 'design' },
  { service_name: 'design_trends', service_label: 'Tendências Design', service_description: 'Sugestões de tendências', credits_cost: 3, icon: 'TrendingUp', category: 'design' },
  { service_name: 'design_assistant', service_label: 'Assistente Design', service_description: 'Chat assistente de design', credits_cost: 1, icon: 'MessageCircle', category: 'design' },
  { service_name: 'export_png', service_label: 'Exportar PNG', service_description: 'Exportar como PNG (GRÁTIS)', credits_cost: 0, icon: 'Download', category: 'design' },
  { service_name: 'export_svg', service_label: 'Exportar SVG', service_description: 'Exportar como SVG (GRÁTIS)', credits_cost: 0, icon: 'Download', category: 'design' },
  
  // VIDEO STUDIO (11 serviços)
  { service_name: 'video_gen4_5s', service_label: 'Vídeo Gen4 5s', service_description: 'Gerar vídeo 5 segundos (Gen-4 Turbo)', credits_cost: 20, icon: 'Video', category: 'video' },
  { service_name: 'video_gen4_10s', service_label: 'Vídeo Gen4 10s', service_description: 'Gerar vídeo 10 segundos (Gen-4 Turbo)', credits_cost: 40, icon: 'Video', category: 'video' },
  { service_name: 'video_gen3a_5s', service_label: 'Vídeo Gen3a 5s', service_description: 'Gerar vídeo 5 segundos (Gen-3 Alpha Turbo)', credits_cost: 18, icon: 'Film', category: 'video' },
  { service_name: 'video_gen3a_10s', service_label: 'Vídeo Gen3a 10s', service_description: 'Gerar vídeo 10 segundos (Gen-3 Alpha Turbo)', credits_cost: 35, icon: 'Film', category: 'video' },
  { service_name: 'video_image_to_video_5s', service_label: 'Imagem → Vídeo 5s', service_description: 'Converter imagem em vídeo 5 segundos', credits_cost: 18, icon: 'ImagePlay', category: 'video' },
  { service_name: 'video_image_to_video_10s', service_label: 'Imagem → Vídeo 10s', service_description: 'Converter imagem em vídeo 10 segundos', credits_cost: 35, icon: 'ImagePlay', category: 'video' },
  { service_name: 'video_to_video', service_label: 'Vídeo → Vídeo', service_description: 'Transformar/editar vídeo existente', credits_cost: 50, icon: 'Clapperboard', category: 'video' },
  { service_name: 'video_act_two', service_label: 'Act-Two Performance', service_description: 'Animar personagem com áudio', credits_cost: 35, icon: 'Drama', category: 'video' },
  { service_name: 'video_upscale_5s', service_label: 'Upscale Vídeo 5s', service_description: 'Melhorar resolução vídeo 5s', credits_cost: 10, icon: 'Maximize2', category: 'video' },
  { service_name: 'video_upscale_10s', service_label: 'Upscale Vídeo 10s', service_description: 'Melhorar resolução vídeo 10s', credits_cost: 20, icon: 'Maximize2', category: 'video' },
  { service_name: 'video_gen4_aleph_5s', service_label: 'Vídeo Aleph 5s', service_description: 'Vídeo premium Aleph 5s', credits_cost: 60, icon: 'Zap', category: 'video' },
  
  // IMAGE STUDIO (4 serviços)
  { service_name: 'image_fast', service_label: 'Imagen Fast 1K', service_description: 'Rápida e econômica (~2-3s)', credits_cost: 15, icon: 'Zap', category: 'image' },
  { service_name: 'image_standard', service_label: 'Imagen Standard 2K', service_description: 'Perfeita para web (~5-8s)', credits_cost: 25, icon: 'Image', category: 'image' },
  { service_name: 'image_ultra', service_label: 'Imagen Ultra 4K', service_description: 'Máxima qualidade (~10-15s)', credits_cost: 35, icon: 'Sparkles', category: 'image' },
  { service_name: 'image_3', service_label: 'Imagen 3', service_description: 'Econômico (~5s)', credits_cost: 10, icon: 'ImageIcon', category: 'image' },
  
  // CHAT STUDIO (2 serviços)
  { service_name: 'chat_basic', service_label: 'Chat Básico', service_description: 'Chat IA básico (GRÁTIS 50/dia)', credits_cost: 0, icon: 'MessageSquare', category: 'chat' },
  { service_name: 'chat_advanced', service_label: 'Chat Avançado', service_description: 'Chat IA avançado com mais contexto', credits_cost: 1, icon: 'MessagesSquare', category: 'chat' },
  
  // LIVE STUDIO (2 serviços)
  { service_name: 'live_audio_1min', service_label: 'Áudio Live 1min', service_description: 'Processamento áudio ao vivo 1 minuto', credits_cost: 3, icon: 'Radio', category: 'live' },
  { service_name: 'live_audio_5min', service_label: 'Áudio Live 5min', service_description: 'Processamento áudio ao vivo 5 minutos', credits_cost: 13, icon: 'Radio', category: 'live' }
];

async function updateServiceCosts() {
  try {
    // PASSO 1: Limpar tabela antiga
    console.log('🗑️  PASSO 1: Limpando dados antigos...\n');
    const { error: deleteError } = await supabase
      .from('service_costs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log(`⚠️  Aviso ao limpar: ${deleteError.message}\n`);
    } else {
      console.log('✅ Dados antigos removidos\n');
    }
    
    // PASSO 2: Inserir novos serviços
    console.log('📝 PASSO 2: Inserindo 41 serviços do Sistema V4.0...\n');
    
    const { data, error: insertError } = await supabase
      .from('service_costs')
      .insert(services)
      .select();
    
    if (insertError) {
      console.log(`❌ Erro ao inserir: ${insertError.message}\n`);
      return;
    }
    
    console.log(`✅ ${data.length} serviços inseridos com sucesso!\n`);
    
    // PASSO 3: Verificar resultado
    console.log('============================================================\n');
    console.log('🔍 PASSO 3: Verificando serviços por categoria...\n');
    
    const { data: allServices, error: selectError } = await supabase
      .from('service_costs')
      .select('*')
      .order('category', { ascending: true })
      .order('credits_cost', { ascending: false });
    
    if (selectError) {
      console.log(`❌ Erro: ${selectError.message}\n`);
      return;
    }
    
    // Agrupar por categoria
    const byCategory = {};
    let totalCredits = 0;
    let freeServices = 0;
    
    allServices.forEach(s => {
      if (!byCategory[s.category]) {
        byCategory[s.category] = [];
      }
      byCategory[s.category].push(s);
      totalCredits += s.credits_cost;
      if (s.credits_cost === 0) freeServices++;
    });
    
    // Exibir por categoria
    const categoryIcons = {
      music: '🎵',
      design: '🎨',
      video: '🎬',
      chat: '💬',
      live: '📡'
    };
    
    Object.entries(byCategory).forEach(([category, items]) => {
      const icon = categoryIcons[category] || '📦';
      console.log(`\n${icon} ${category.toUpperCase()} (${items.length} serviços):`);
      items.forEach(s => {
        const freeLabel = s.credits_cost === 0 ? ' [GRÁTIS]' : '';
        console.log(`   • ${s.service_label}: ${s.credits_cost} créditos${freeLabel}`);
      });
    });
    
    // Estatísticas
    console.log('\n============================================================\n');
    console.log('📊 ESTATÍSTICAS FINAIS:\n');
    console.log(`📌 Total de serviços: ${allServices.length}`);
    console.log(`💰 Total de créditos (soma): ${totalCredits}`);
    console.log(`📈 Média de créditos: ${Math.round(totalCredits / allServices.length)}`);
    console.log(`🎁 Serviços gratuitos: ${freeServices}`);
    console.log(`💵 Serviços pagos: ${allServices.length - freeServices}`);
    
    console.log('\n============================================================\n');
    console.log('🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!\n');
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

updateServiceCosts();
