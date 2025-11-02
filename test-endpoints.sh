#!/bin/bash

# Test Script - DUA MUSIC API Endpoints

echo "🧪 Testing DUA MUSIC API Endpoints"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Health Check (Diagnostic Endpoint)
echo -e "${YELLOW}Test 1: Diagnostic Endpoint (GET)${NC}"
curl -s "$BASE_URL/api/test-simple" | jq '.' || echo "❌ Server not running"
echo ""

# Test 2: Echo Test (POST with data)
echo -e "${YELLOW}Test 2: Echo Test (POST)${NC}"
curl -s -X POST "$BASE_URL/api/test-simple" \
  -H "Content-Type: application/json" \
  -d '{"test": "hello", "timestamp": "2025-01-01"}' | jq '.' || echo "❌ Failed"
echo ""

# Test 3: Custom Endpoint - Simple Description
echo -e "${YELLOW}Test 3: Custom Endpoint - Simple Mode${NC}"
curl -s -X POST "$BASE_URL/api/music/custom" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A happy song about sunshine and summer",
    "tags": "pop, upbeat",
    "title": "Sunshine Days"
  }' | jq '.' || echo "❌ Failed"
echo ""

# Test 4: Custom Endpoint - With gpt_description_prompt
echo -e "${YELLOW}Test 4: Custom Endpoint - Custom Mode${NC}"
curl -s -X POST "$BASE_URL/api/music/custom" \
  -H "Content-Type: application/json" \
  -d '{
    "gpt_description_prompt": "Create a melancholic indie rock song",
    "style": "indie rock, melancholic",
    "title": "Lost in Thoughts",
    "instrumental": false
  }' | jq '.' || echo "❌ Failed"
echo ""

# Test 5: Custom Endpoint - Frontend Format
echo -e "${YELLOW}Test 5: Custom Endpoint - Frontend Format (actual UI payload)${NC}"
curl -s -X POST "$BASE_URL/api/music/custom" \
  -H "Content-Type: application/json" \
  -d '{
    "customMode": true,
    "instrumental": false,
    "model": "V4_5",
    "vocalGender": "f",
    "styleWeight": 0.7,
    "weirdnessConstraint": 0.3,
    "gpt_description_prompt": "an energetic pop song about dancing",
    "prompt": "Dancing all night long, feeling the rhythm",
    "style": "pop, dance, electronic",
    "title": "Dance Tonight"
  }' | jq '.' || echo "❌ Failed"
echo ""

# Test 6: Error Case - No Prompt
echo -e "${YELLOW}Test 6: Error Handling - Missing Prompt${NC}"
curl -s -X POST "$BASE_URL/api/music/custom" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Empty Song",
    "tags": "pop"
  }' | jq '.' || echo "❌ Failed"
echo ""

echo -e "${GREEN}✅ All tests completed${NC}"
echo ""
echo "📝 Next steps:"
echo "  1. Check server console logs for detailed output"
echo "  2. Verify SUNO_API_KEY is set in .env.local"
echo "  3. Test through UI at http://localhost:3000"
echo ""
