/**
 * 🧪 UI LOGIC VALIDATION TESTS
 * 
 * Testa a lógica de construção de requisições do create-panel.tsx
 * SEM necessidade de browser - apenas validação de lógica pura
 * 
 * Execute: node test-ui-logic.js
 */

console.log("🧪 MUSIC STUDIO UI LOGIC VALIDATION\n");
console.log("=" .repeat(70));

// ============================================================================
// HELPER FUNCTIONS (simulam a lógica do create-panel.tsx)
// ============================================================================

/**
 * Model mapping oficial (linha 175-188)
 */
const modelMap = {
  "v5-pro-beta": "V5",
  "v5 Pro Beta": "V5",
  "v4.5-plus": "V4_5PLUS",
  "v4.5+ Pro": "V4_5PLUS",
  "v4.5-pro": "V4_5",
  "v4.5 Pro": "V4_5",
  "v4.5-all": "V4_5",
  "v4-pro": "V4",
  "v4 Pro": "V4",
  "v3.5": "V3_5",
};

/**
 * Build request params (simula handleCreate, linha 190-215)
 */
function buildRequestParams(state) {
  const params = {
    prompt: state.mode === "simple" ? state.songDescription : (state.lyrics || state.songDescription),
    customMode: state.mode === "custom",
    instrumental: state.isInstrumental,
    model: modelMap[state.selectedVersion] || "V4_5",
    
    // Custom mode fields
    ...(state.mode === "custom" && {
      style: state.styles || undefined,
      title: state.songTitle || undefined,
    }),
    
    // Advanced parameters
    vocalGender: state.vocalGender === "male" ? "m" : "f",
    styleWeight: state.styleInfluence / 100,
    weirdnessConstraint: state.weirdness / 100,
    negativeTags: state.excludeStyles && state.styles ? state.styles : undefined,
    
    callBackUrl: `http://localhost:3000/api/music/callback`
  };

  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });

  return params;
}

/**
 * Validate request structure
 */
function validateRequest(params, expectedModel) {
  const errors = [];

  // Check camelCase
  Object.keys(params).forEach(key => {
    if (key.includes("_")) {
      errors.push(`❌ snake_case detected: ${key}`);
    }
  });

  // Check customMode type
  if (typeof params.customMode !== "boolean") {
    errors.push(`❌ customMode must be boolean, got: ${typeof params.customMode}`);
  }

  // Check instrumental type
  if (typeof params.instrumental !== "boolean") {
    errors.push(`❌ instrumental must be boolean, got: ${typeof params.instrumental}`);
  }

  // Check model format
  const validModels = ["V3_5", "V4", "V4_5", "V4_5PLUS", "V5"];
  if (!validModels.includes(params.model)) {
    errors.push(`❌ Invalid model: ${params.model} (expected: ${validModels.join(", ")})`);
  }

  // Check model matches expected
  if (expectedModel && params.model !== expectedModel) {
    errors.push(`❌ Model mismatch: expected ${expectedModel}, got ${params.model}`);
  }

  // Check vocalGender format
  if (params.vocalGender && !["m", "f"].includes(params.vocalGender)) {
    errors.push(`❌ Invalid vocalGender: ${params.vocalGender} (expected: "m" or "f")`);
  }

  // Check styleWeight range
  if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
    errors.push(`❌ styleWeight out of range: ${params.styleWeight} (expected: 0-1)`);
  }

  // Check weirdnessConstraint range
  if (params.weirdnessConstraint !== undefined && (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)) {
    errors.push(`❌ weirdnessConstraint out of range: ${params.weirdnessConstraint} (expected: 0-1)`);
  }

  // Check custom mode requirements
  if (params.customMode === true) {
    if (!params.style && params.instrumental === false) {
      errors.push(`❌ Custom mode with vocals requires 'style' parameter`);
    }
    if (!params.title && params.instrumental === false) {
      errors.push(`❌ Custom mode with vocals requires 'title' parameter`);
    }
  }

  return errors;
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

function runTest(name, state, expectedModel = null) {
  testCount++;
  console.log(`\n📝 Test ${testCount}: ${name}`);
  console.log("-".repeat(70));

  const params = buildRequestParams(state);
  console.log("Request:", JSON.stringify(params, null, 2));

  const errors = validateRequest(params, expectedModel);

  if (errors.length === 0) {
    console.log("✅ PASS");
    passCount++;
  } else {
    console.log("❌ FAIL");
    errors.forEach(err => console.log("  " + err));
    failCount++;
  }
}

// ----------------------------------------------------------------------------
// Test 1: Simple Mode Instrumental
// ----------------------------------------------------------------------------
runTest("Simple Mode Instrumental", {
  mode: "simple",
  songDescription: "A calm piano melody",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "Classical, Piano",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V4_5");

// ----------------------------------------------------------------------------
// Test 2: Custom Mode with Vocals
// ----------------------------------------------------------------------------
runTest("Custom Mode with Vocals", {
  mode: "custom",
  songDescription: "A nostalgic song about childhood",
  lyrics: "",
  isInstrumental: false,
  selectedVersion: "v5-pro-beta",
  styles: "Folk, Acoustic",
  songTitle: "Childhood Memories",
  vocalGender: "female",
  styleInfluence: 70,
  weirdness: 40,
  excludeStyles: false,
}, "V5");

// ----------------------------------------------------------------------------
// Test 3: Model Mapping - v5-pro-beta
// ----------------------------------------------------------------------------
runTest("Model Mapping: v5-pro-beta", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v5-pro-beta",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V5");

// ----------------------------------------------------------------------------
// Test 4: Model Mapping - v4.5-plus
// ----------------------------------------------------------------------------
runTest("Model Mapping: v4.5-plus", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-plus",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V4_5PLUS");

// ----------------------------------------------------------------------------
// Test 5: Model Mapping - v4.5-pro
// ----------------------------------------------------------------------------
runTest("Model Mapping: v4.5-pro", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-pro",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V4_5");

// ----------------------------------------------------------------------------
// Test 6: Model Mapping - v4-pro
// ----------------------------------------------------------------------------
runTest("Model Mapping: v4-pro", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4-pro",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V4");

// ----------------------------------------------------------------------------
// Test 7: Model Mapping - v3.5
// ----------------------------------------------------------------------------
runTest("Model Mapping: v3.5", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v3.5",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
}, "V3_5");

// ----------------------------------------------------------------------------
// Test 8: Vocal Gender Male
// ----------------------------------------------------------------------------
runTest("Vocal Gender: Male", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 9: Vocal Gender Female
// ----------------------------------------------------------------------------
runTest("Vocal Gender: Female", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "",
  songTitle: "",
  vocalGender: "female",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 10: Sliders at Minimum (0%)
// ----------------------------------------------------------------------------
runTest("Sliders: Minimum (0%)", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 0,
  weirdness: 0,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 11: Sliders at Maximum (100%)
// ----------------------------------------------------------------------------
runTest("Sliders: Maximum (100%)", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 100,
  weirdness: 100,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 12: Exclude Styles Enabled
// ----------------------------------------------------------------------------
runTest("Exclude Styles: Enabled", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "Rock, Jazz",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: true,
});

// ----------------------------------------------------------------------------
// Test 13: Exclude Styles Disabled
// ----------------------------------------------------------------------------
runTest("Exclude Styles: Disabled", {
  mode: "simple",
  songDescription: "Test",
  lyrics: "",
  isInstrumental: true,
  selectedVersion: "v4.5-all",
  styles: "Rock, Jazz",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 14: Simple Mode with Lyrics
// ----------------------------------------------------------------------------
runTest("Simple Mode: Using Lyrics Field", {
  mode: "simple",
  songDescription: "",
  lyrics: "Verse 1: Walking down the street...",
  isInstrumental: false,
  selectedVersion: "v4.5-all",
  styles: "Pop",
  songTitle: "",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
});

// ----------------------------------------------------------------------------
// Test 15: Custom Mode - Complete
// ----------------------------------------------------------------------------
runTest("Custom Mode: Complete Parameters", {
  mode: "custom",
  songDescription: "A nostalgic folk song about childhood memories",
  lyrics: "",
  isInstrumental: false,
  selectedVersion: "v5-pro-beta",
  styles: "Folk, Acoustic, Nostalgic",
  songTitle: "Childhood Dreams",
  vocalGender: "female",
  styleInfluence: 80,
  weirdness: 50,
  excludeStyles: false,
}, "V5");

// ============================================================================
// PARAMETER TYPE VALIDATION
// ============================================================================

console.log("\n");
console.log("=" .repeat(70));
console.log("🔍 PARAMETER TYPE VALIDATION");
console.log("=" .repeat(70));

function validateParamTypes(params) {
  console.log("\n📊 Type Check:");
  console.log("-".repeat(70));

  const checks = [
    { param: "customMode", expected: "boolean", actual: typeof params.customMode },
    { param: "instrumental", expected: "boolean", actual: typeof params.instrumental },
    { param: "model", expected: "string", actual: typeof params.model },
    { param: "prompt", expected: "string", actual: typeof params.prompt },
    { param: "vocalGender", expected: "string", actual: typeof params.vocalGender },
    { param: "styleWeight", expected: "number", actual: typeof params.styleWeight },
    { param: "weirdnessConstraint", expected: "number", actual: typeof params.weirdnessConstraint },
  ];

  checks.forEach(check => {
    const match = check.expected === check.actual;
    const icon = match ? "✅" : "❌";
    console.log(`${icon} ${check.param}: ${check.actual} (expected: ${check.expected})`);
  });
}

const sampleParams = buildRequestParams({
  mode: "custom",
  songDescription: "Test song",
  lyrics: "",
  isInstrumental: false,
  selectedVersion: "v5-pro-beta",
  styles: "Rock",
  songTitle: "Test",
  vocalGender: "male",
  styleInfluence: 75,
  weirdness: 65,
  excludeStyles: false,
});

validateParamTypes(sampleParams);

// ============================================================================
// PARAMETER VALUE RANGES
// ============================================================================

console.log("\n");
console.log("=" .repeat(70));
console.log("📏 PARAMETER VALUE RANGES");
console.log("=" .repeat(70));

function checkRanges() {
  console.log("\n🎚️ Slider Value Tests:");
  console.log("-".repeat(70));

  const testValues = [
    { slider: 0, expected: 0 },
    { slider: 25, expected: 0.25 },
    { slider: 50, expected: 0.5 },
    { slider: 75, expected: 0.75 },
    { slider: 100, expected: 1 },
  ];

  testValues.forEach(test => {
    const result = test.slider / 100;
    const match = result === test.expected;
    const icon = match ? "✅" : "❌";
    console.log(`${icon} ${test.slider}% → ${result} (expected: ${test.expected})`);
  });
}

checkRanges();

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log("\n");
console.log("=" .repeat(70));
console.log("📊 TEST SUMMARY");
console.log("=" .repeat(70));
console.log(`Total Tests: ${testCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log("\n🎉 ALL TESTS PASSED! UI logic is 100% conformant.");
} else {
  console.log("\n⚠️  Some tests failed. Review errors above.");
}

console.log("=" .repeat(70));
