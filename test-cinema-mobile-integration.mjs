#!/usr/bin/env node

/**
 * Cinema Studio Mobile Integration Test
 * Validates mobile detection and page integration
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

const log = {
  success: (msg) => console.log(`${GREEN}✓${RESET} ${msg}`),
  error: (msg) => console.log(`${RED}✗${RESET} ${msg}`),
  info: (msg) => console.log(`${BLUE}ℹ${RESET} ${msg}`),
  warn: (msg) => console.log(`${YELLOW}⚠${RESET} ${msg}`),
  section: (msg) => console.log(`\n${BOLD}${BLUE}${msg}${RESET}\n`),
}

let totalChecks = 0
let passedChecks = 0

function check(condition, message) {
  totalChecks++
  if (condition) {
    passedChecks++
    log.success(message)
    return true
  } else {
    log.error(message)
    return false
  }
}

function fileExists(path) {
  return existsSync(join(process.cwd(), path))
}

function fileContains(path, content) {
  try {
    const file = readFileSync(join(process.cwd(), path), 'utf-8')
    return file.includes(content)
  } catch {
    return false
  }
}

console.log(`\n${BOLD}🧪 Cinema Studio Mobile Integration Test${RESET}\n`)

// ========================================
// MOBILE FILES
// ========================================
log.section('📱 Mobile Files')

check(
  fileExists('app/videostudio/criar/page-mobile.tsx'),
  'Gen-4 Turbo mobile version exists'
)

check(
  fileExists('app/videostudio/performance/page-mobile.tsx'),
  'Act-Two mobile version exists'
)

check(
  fileExists('app/videostudio/qualidade/page-mobile.tsx'),
  'Upscale v1 mobile version exists'
)

// ========================================
// MOBILE INTEGRATION
// ========================================
log.section('🔗 Desktop Integration')

check(
  fileContains('app/videostudio/criar/page.tsx', 'const MobileVersion = dynamic'),
  'Criar page imports mobile version'
)

check(
  fileContains('app/videostudio/criar/page.tsx', 'const [isMobile, setIsMobile]'),
  'Criar page has mobile detection state'
)

check(
  fileContains('app/videostudio/criar/page.tsx', 'if (isMobile)'),
  'Criar page renders mobile conditionally'
)

check(
  fileContains('app/videostudio/performance/page.tsx', 'const MobileVersion = dynamic'),
  'Performance page imports mobile version'
)

check(
  fileContains('app/videostudio/performance/page.tsx', 'const [isMobile, setIsMobile]'),
  'Performance page has mobile detection state'
)

check(
  fileContains('app/videostudio/performance/page.tsx', 'if (isMobile)'),
  'Performance page renders mobile conditionally'
)

check(
  fileContains('app/videostudio/qualidade/page.tsx', 'const MobileVersion = dynamic'),
  'Qualidade page imports mobile version'
)

check(
  fileContains('app/videostudio/qualidade/page.tsx', 'const [isMobile, setIsMobile]'),
  'Qualidade page has mobile detection state'
)

check(
  fileContains('app/videostudio/qualidade/page.tsx', 'if (isMobile)'),
  'Qualidade page renders mobile conditionally'
)

// ========================================
// MOBILE DETECTION
// ========================================
log.section('🔍 Mobile Detection')

check(
  fileContains('app/videostudio/criar/page.tsx', 'window.innerWidth < 768'),
  'Criar uses responsive breakpoint'
)

check(
  fileContains('app/videostudio/criar/page.tsx', '/iPhone|iPad|iPod|Android/i.test'),
  'Criar detects mobile user agents'
)

check(
  fileContains('app/videostudio/criar/page.tsx', "addEventListener('resize'"),
  'Criar listens for resize events'
)

// ========================================
// MOBILE FEATURES
// ========================================
log.section('✨ Mobile Features')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'currentStep'),
  'Gen-4 Turbo has step navigation'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'h-safe-top'),
  'Gen-4 Turbo has iOS safe areas'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'whileTap'),
  'Gen-4 Turbo has touch animations'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'AnimatePresence'),
  'Gen-4 Turbo has smooth transitions'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'currentStep'),
  'Act-Two has step navigation'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'characterExamples'),
  'Act-Two has character grid'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'characterType'),
  'Act-Two has image/video toggle'
)

check(
  fileContains('app/videostudio/qualidade/page-mobile.tsx', 'currentStep'),
  'Upscale has step navigation'
)

check(
  fileContains('app/videostudio/qualidade/page-mobile.tsx', 'handleUpscale'),
  'Upscale has processing logic'
)

// ========================================
// STEP STATES
// ========================================
log.section('📍 Step States')

const criarSteps = ["'upload'", "'settings'", "'result'"]
criarSteps.forEach(step => {
  check(
    fileContains('app/videostudio/criar/page-mobile.tsx', step),
    `Gen-4 Turbo has ${step} step`
  )
})

const perfSteps = ["'character'", "'performance'", "'result'"]
perfSteps.forEach(step => {
  check(
    fileContains('app/videostudio/performance/page-mobile.tsx', step),
    `Act-Two has ${step} step`
  )
})

// ========================================
// CREDITS SYSTEM
// ========================================
log.section('💰 Credits System')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'const [credits'),
  'Gen-4 Turbo has credits state'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', '{credits} Credits'),
  'Gen-4 Turbo displays credits badge'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'const [credits'),
  'Act-Two has credits state'
)

check(
  fileContains('app/videostudio/qualidade/page-mobile.tsx', 'const [credits'),
  'Upscale has credits state'
)

// ========================================
// PROGRESS TRACKING
// ========================================
log.section('📊 Progress Tracking')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'const [progress'),
  'Gen-4 Turbo tracks progress'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'setProgress'),
  'Gen-4 Turbo updates progress'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'const [progress'),
  'Act-Two tracks progress'
)

check(
  fileContains('app/videostudio/qualidade/page-mobile.tsx', 'const [progress'),
  'Upscale tracks progress'
)

// ========================================
// RESULT ACTIONS
// ========================================
log.section('🎬 Result Actions')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', '<Download'),
  'Gen-4 Turbo has download button'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'handleReset'),
  'Gen-4 Turbo has reset function'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', '<Download'),
  'Act-Two has download button'
)

check(
  fileContains('app/videostudio/qualidade/page-mobile.tsx', '<Download'),
  'Upscale has download button'
)

// ========================================
// RESPONSIVE DESIGN
// ========================================
log.section('📐 Responsive Design')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'fixed inset-0'),
  'Gen-4 Turbo uses full-screen layout'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'backdrop-blur'),
  'Gen-4 Turbo uses iOS-style blur'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'rounded-2xl'),
  'Gen-4 Turbo uses iOS-style rounded corners'
)

// ========================================
// ANIMATIONS
// ========================================
log.section('🎭 Animations')

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'animate={{ rotate: 360 }}'),
  'Gen-4 Turbo has rotating spinner'
)

check(
  fileContains('app/videostudio/criar/page-mobile.tsx', 'initial={{ opacity: 0'),
  'Gen-4 Turbo has fade-in animation'
)

check(
  fileContains('app/videostudio/performance/page-mobile.tsx', 'whileTap={{ scale'),
  'Act-Two has scale animation'
)

// ========================================
// DOCUMENTATION
// ========================================
log.section('📝 Documentation')

check(
  fileExists('CINEMA_STUDIO_IOS_MOBILE_COMPLETE.md'),
  'Mobile documentation exists'
)

check(
  fileContains('CINEMA_STUDIO_IOS_MOBILE_COMPLETE.md', '## ✅ Status: 100% Implementado'),
  'Documentation shows complete status'
)

check(
  fileContains('CINEMA_STUDIO_IOS_MOBILE_COMPLETE.md', 'Gen-4 Turbo'),
  'Documentation covers Gen-4 Turbo'
)

check(
  fileContains('CINEMA_STUDIO_IOS_MOBILE_COMPLETE.md', 'Act-Two'),
  'Documentation covers Act-Two'
)

check(
  fileContains('CINEMA_STUDIO_IOS_MOBILE_COMPLETE.md', 'Upscale v1'),
  'Documentation covers Upscale v1'
)

// ========================================
// RESULTS
// ========================================
log.section('📊 Results')

const percentage = Math.round((passedChecks / totalChecks) * 100)
const color = percentage === 100 ? GREEN : percentage >= 90 ? YELLOW : RED

console.log(`${BOLD}Total Checks:${RESET} ${totalChecks}`)
console.log(`${BOLD}Passed:${RESET} ${color}${passedChecks}${RESET}`)
console.log(`${BOLD}Failed:${RESET} ${totalChecks - passedChecks}`)
console.log(`${BOLD}Success Rate:${RESET} ${color}${percentage}%${RESET}`)

if (percentage === 100) {
  console.log(`\n${GREEN}${BOLD}🎉 All checks passed! Mobile integration is complete!${RESET}\n`)
} else if (percentage >= 90) {
  console.log(`\n${YELLOW}${BOLD}⚠️  Almost there! A few issues to fix.${RESET}\n`)
} else {
  console.log(`\n${RED}${BOLD}❌ Mobile integration needs attention.${RESET}\n`)
}

process.exit(percentage === 100 ? 0 : 1)
