// Debug: Verificar se API key está sendo carregada
console.log('🔍 DEBUG: Verificando carregamento da API');

// Esta variável NÃO deve mais existir no código de produção
// API keys NUNCA devem usar NEXT_PUBLIC_ (são expostas no browser)
const API_KEY = process.env.GOOGLE_API_KEY;

console.log('📊 Resultados:');
console.log('1. API_KEY existe?', !!API_KEY);
console.log('2. API_KEY length:', API_KEY?.length || 0);
console.log('3. API_KEY preview:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'VAZIO');

// Verificar se @google/genai está disponível
try {
    const genai = require('@google/genai');
    console.log('4. @google/genai disponível:', !!genai.GoogleGenAI);
    
    if (API_KEY) {
        const ai = new genai.GoogleGenAI({ apiKey: API_KEY, vertexai: false });
        console.log('5. API inicializada:', !!ai);
        console.log('6. ai.models disponível:', !!ai.models);
    }
} catch (e) {
    console.log('4. @google/genai ERROR:', e.message);
}

console.log('\n✅ Se você vê "API_KEY existe? true" = API configurada');
console.log('❌ Se você vê "API_KEY existe? false" = API NÃO configurada (MOCK ativo)');
