// Test script to verify SunoAPI integration
// Run with: node test-sunoapi.js

const SUNOAPI_KEY = '88cff88fcfae127759fa1f329f2abf84';
const SUNOAPI_BASE_URL = 'https://api.sunoapi.org';

async function testTextGeneration() {
  console.log('Testing text-based music generation...');
  
  try {
    const response = await fetch(`${SUNOAPI_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNOAPI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'A happy pop song about summer',
        make_instrumental: false,
        tags: 'pop, happy, summer',
        title: 'Test Summer Song',
        model: 'chirp-v3-5'
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Generation started successfully!');
      console.log('IDs:', data.data.map(c => c.id));
      return data.data[0].id;
    } else if (data.id) {
      console.log('✅ Generation started successfully!');
      console.log('ID:', data.id);
      return data.id;
    } else {
      console.error('❌ No clips returned');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function checkStatus(clipId) {
  console.log(`\nChecking status for clip: ${clipId}`);
  
  try {
    const response = await fetch(
      `${SUNOAPI_BASE_URL}/api/get?ids=${clipId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUNOAPI_KEY}`
        }
      }
    );

    const data = await response.json();
    console.log('Status response:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data) && data.length > 0) {
      const clip = data[0];
      console.log('Status:', clip.status);
      console.log('Audio URL:', clip.audio_url || 'Not ready yet');
      return clip.status === 'complete' || clip.status === 'completed' || clip.status === 'streaming';
    } else if (data.data && Array.isArray(data.data)) {
      const clip = data.data[0];
      console.log('Status:', clip.status);
      console.log('Audio URL:', clip.audio_url || 'Not ready yet');
      return clip.status === 'complete' || clip.status === 'completed' || clip.status === 'streaming';
    }
    
    return false;
  } catch (error) {
    console.error('❌ Status check error:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🎵 Starting SunoAPI Test...\n');
  console.log('API Key:', SUNOAPI_KEY.substring(0, 10) + '...');
  console.log('Base URL:', SUNOAPI_BASE_URL);
  console.log('-----------------------------------\n');

  const clipId = await testTextGeneration();
  
  if (clipId) {
    console.log('\n⏳ Waiting 10 seconds before checking status...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await checkStatus(clipId);
  }
  
  console.log('\n✅ Test completed!');
}

// Run the test
runTest();
