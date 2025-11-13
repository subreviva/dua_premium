#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎬 RUNWAY ML - IMAGE TO VIDEO SHOWCASE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Professional demonstration of Gen4 Turbo and Gen3a Turbo capabilities
 * using real production examples from Runway ML's showcase.
 * 
 * FEATURED EXAMPLE:
 * Input:  https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/i2v-gen4_turbo-input.jpeg
 * Output: https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/videoframe_3270.png
 * 
 * MODELS TESTED:
 * • Gen4 Turbo - Latest generation (superior quality)
 * • Gen3a Turbo - Cost-effective alternative
 * 
 * @version 3.0.0
 * @author DUA Engineering Team
 */

const BASE_URL = 'http://localhost:3000';
const USER_ID = 'user_showcase_demo';

// Production example from Runway ML showcase
const SHOWCASE_IMAGE = 'https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/i2v-gen4_turbo-input.jpeg';

// Color codes for beautiful terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  header: (text) => console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓${colors.reset} ${text}`),
  info: (text) => console.log(`${colors.blue}ℹ${colors.reset} ${text}`),
  warning: (text) => console.log(`${colors.yellow}⚠${colors.reset} ${text}`),
  error: (text) => console.log(`${colors.red}✗${colors.reset} ${text}`),
  data: (label, value) => console.log(`  ${colors.cyan}${label}:${colors.reset} ${colors.bright}${value}${colors.reset}`),
};

/**
 * Display a beautifully formatted section separator
 */
function separator(title) {
  const line = '═'.repeat(80);
  console.log(`\n${colors.bright}${colors.magenta}${line}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}${line}${colors.reset}\n`);
}

/**
 * Display request details in a clean format
 */
function displayRequest(request) {
  log.info('Request Configuration:');
  console.log(JSON.stringify(request, null, 2)
    .split('\n')
    .map(line => `  ${colors.cyan}${line}${colors.reset}`)
    .join('\n'));
}

/**
 * Display response details with highlighting
 */
function displayResponse(response, data) {
  if (response.ok) {
    log.success(`Success (${response.status})`);
    log.data('Task ID', data.taskId || 'N/A');
    log.data('Model', data.model || 'N/A');
    log.data('Credits Used', data.credits?.used || 'N/A');
    log.data('Credits Remaining', data.credits?.remaining || 'N/A');
    log.data('Duration', data.metadata?.duration ? `${data.metadata.duration}s` : 'Default');
    log.data('Ratio', data.metadata?.ratio || 'N/A');
    log.data('Processing Time', data.timing?.elapsed || 'N/A');
    
    if (data.next) {
      log.info(`Next Step: ${data.next.action}`);
      log.data('Endpoint', data.next.endpoint);
    }
  } else {
    log.error(`Failed (${response.status})`);
    log.data('Error', data.error || 'Unknown error');
    if (data.code) log.data('Code', data.code);
    if (data.details) {
      console.log(`\n  ${colors.yellow}Details:${colors.reset}`);
      if (Array.isArray(data.details)) {
        data.details.forEach(detail => log.error(`  • ${detail}`));
      } else {
        log.error(`  ${data.details}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 SHOWCASE EXAMPLE 1: Gen4 Turbo - Landscape (16:9)
// ═══════════════════════════════════════════════════════════════════════════

async function showcase1_gen4_landscape() {
  separator('🎨 SHOWCASE 1: Gen4 Turbo - Professional Landscape (16:9)');
  
  const request = {
    model: 'gen4_turbo',
    user_id: USER_ID,
    promptImage: SHOWCASE_IMAGE,
    promptText: 'A cinematic shot with smooth camera movement, golden hour lighting, professional color grading',
    ratio: '1280:720',
    duration: 5,
    seed: 42,
  };
  
  displayRequest(request);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    displayResponse(response, data);
    
    return data;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📱 SHOWCASE EXAMPLE 2: Gen4 Turbo - Portrait for Social Media (9:16)
// ═══════════════════════════════════════════════════════════════════════════

async function showcase2_gen4_portrait() {
  separator('📱 SHOWCASE 2: Gen4 Turbo - Social Media Portrait (9:16)');
  
  const request = {
    model: 'gen4_turbo',
    user_id: USER_ID,
    promptImage: SHOWCASE_IMAGE,
    promptText: 'Dynamic movement optimized for Instagram Reels and TikTok, engaging and eye-catching',
    ratio: '720:1280',
    duration: 5,
  };
  
  displayRequest(request);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    displayResponse(response, data);
    
    return data;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 SHOWCASE EXAMPLE 3: Gen4 Turbo - Cinematic Ultra Wide (21:9)
// ═══════════════════════════════════════════════════════════════════════════

async function showcase3_gen4_cinematic() {
  separator('🎬 SHOWCASE 3: Gen4 Turbo - Cinematic Ultra Wide (21:9)');
  
  const request = {
    model: 'gen4_turbo',
    user_id: USER_ID,
    promptImage: SHOWCASE_IMAGE,
    promptText: 'Epic cinematic shot with blockbuster quality, dramatic atmosphere, Hollywood production value',
    ratio: '1584:672',
    duration: 10, // Maximum duration for premium quality
    seed: 2024,
  };
  
  displayRequest(request);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    displayResponse(response, data);
    
    return data;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 💰 SHOWCASE EXAMPLE 4: Gen3a Turbo - Cost-Effective Alternative
// ═══════════════════════════════════════════════════════════════════════════

async function showcase4_gen3a_economical() {
  separator('💰 SHOWCASE 4: Gen3a Turbo - Cost-Effective Quality');
  
  const request = {
    model: 'gen3a_turbo',
    user_id: USER_ID,
    promptText: 'Smooth animation with natural movement and good quality at an economical price point',
    promptImage: SHOWCASE_IMAGE,
    duration: 5,
    ratio: '1280:768',
  };
  
  displayRequest(request);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    displayResponse(response, data);
    
    return data;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 SHOWCASE EXAMPLE 5: Gen4 Turbo - Square for Instagram Feed (1:1)
// ═══════════════════════════════════════════════════════════════════════════

async function showcase5_gen4_square() {
  separator('🎯 SHOWCASE 5: Gen4 Turbo - Instagram Feed Square (1:1)');
  
  const request = {
    model: 'gen4_turbo',
    user_id: USER_ID,
    promptImage: SHOWCASE_IMAGE,
    promptText: 'Perfectly balanced composition for Instagram feed, clean and professional',
    ratio: '960:960',
    duration: 5,
    contentModeration: {
      publicFigureThreshold: 'auto',
    },
  };
  
  displayRequest(request);
  
  try {
    const response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    displayResponse(response, data);
    
    return data;
  } catch (error) {
    log.error(`Network error: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 COMPARISON: Gen4 vs Gen3a Side-by-Side
// ═══════════════════════════════════════════════════════════════════════════

async function showcase6_comparison() {
  separator('📊 COMPARISON: Gen4 Turbo vs Gen3a Turbo');
  
  log.info('Testing both models with identical parameters...\n');
  
  // Gen4 Turbo
  log.header('Gen4 Turbo (Premium)');
  const gen4Request = {
    model: 'gen4_turbo',
    user_id: USER_ID,
    promptImage: SHOWCASE_IMAGE,
    promptText: 'Comparison test - same prompt for both models',
    ratio: '1280:720',
    duration: 5,
    seed: 1000,
  };
  
  displayRequest(gen4Request);
  
  const gen4Response = await fetch(`${BASE_URL}/api/videostudio/criar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gen4Request),
  });
  
  const gen4Data = await gen4Response.json();
  displayResponse(gen4Response, gen4Data);
  
  await sleep(2000);
  
  // Gen3a Turbo
  log.header('\nGen3a Turbo (Economical)');
  const gen3aRequest = {
    model: 'gen3a_turbo',
    user_id: USER_ID,
    promptText: 'Comparison test - same prompt for both models',
    promptImage: SHOWCASE_IMAGE,
    duration: 5,
    ratio: '1280:768',
    seed: 1000,
  };
  
  displayRequest(gen3aRequest);
  
  const gen3aResponse = await fetch(`${BASE_URL}/api/videostudio/criar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gen3aRequest),
  });
  
  const gen3aData = await gen3aResponse.json();
  displayResponse(gen3aResponse, gen3aData);
  
  // Comparison summary
  if (gen4Response.ok && gen3aResponse.ok) {
    separator('📊 COMPARISON SUMMARY');
    
    console.log(`
  ${colors.bright}Model Comparison:${colors.reset}
  
  ${colors.green}Gen4 Turbo (Premium):${colors.reset}
    • Credits: ${gen4Data.credits?.used || 'N/A'}
    • Quality: Superior
    • Processing: ${gen4Data.timing?.elapsed || 'N/A'}
    • Task ID: ${gen4Data.taskId || 'N/A'}
  
  ${colors.yellow}Gen3a Turbo (Economical):${colors.reset}
    • Credits: ${gen3aData.credits?.used || 'N/A'}
    • Quality: Good
    • Processing: ${gen3aData.timing?.elapsed || 'N/A'}
    • Task ID: ${gen3aData.taskId || 'N/A'}
  
  ${colors.cyan}💡 Recommendation:${colors.reset}
    • Use Gen4 Turbo for client work, marketing, and premium content
    • Use Gen3a Turbo for prototyping, testing, and high-volume production
    `);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.clear();
  
  console.log(`
${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                  🎬 RUNWAY ML - IMAGE TO VIDEO SHOWCASE                  ║
║                      Professional API Demonstration                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
  
  log.info('Production-grade examples using Runway ML showcase images');
  log.data('Base URL', BASE_URL);
  log.data('User ID', USER_ID);
  log.data('Showcase Image', SHOWCASE_IMAGE);
  
  console.log(`\n${colors.yellow}⚡ Running 6 professional showcase examples...${colors.reset}\n`);
  
  const results = [];
  
  // Run showcases
  results.push(await showcase1_gen4_landscape());
  await sleep(2000);
  
  results.push(await showcase2_gen4_portrait());
  await sleep(2000);
  
  results.push(await showcase3_gen4_cinematic());
  await sleep(2000);
  
  results.push(await showcase4_gen3a_economical());
  await sleep(2000);
  
  results.push(await showcase5_gen4_square());
  await sleep(2000);
  
  await showcase6_comparison();
  
  // Final summary
  separator('✅ SHOWCASE COMPLETE');
  
  const successful = results.filter(r => r?.success).length;
  const failed = results.filter(r => !r?.success).length;
  
  log.success(`${successful} tasks created successfully`);
  if (failed > 0) log.error(`${failed} tasks failed`);
  
  console.log(`\n${colors.cyan}📚 Next Steps:${colors.reset}`);
  console.log(`  1. Use ${colors.bright}/api/runway/task-status${colors.reset} to check progress`);
  console.log(`  2. Monitor credit balance with ${colors.bright}/api/credits/balance${colors.reset}`);
  console.log(`  3. View generated videos when tasks complete`);
  
  console.log(`\n${colors.green}✨ Reference Output:${colors.reset}`);
  console.log(`  ${colors.bright}https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/videoframe_3270.png${colors.reset}\n`);
}

// Utility: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute
main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
