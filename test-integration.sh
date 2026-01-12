#!/bin/bash
# Test script for world26 and mistralapicaller

echo "🧪 Testing world26 and mistralapicaller integration"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Build world26
echo -e "\n${YELLOW}Test 1: Building world26...${NC}"
cd /workspaces/world26
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ world26 builds successfully${NC}"
else
    echo -e "${RED}❌ world26 build failed${NC}"
fi

# Test 2: TypeScript check mistralapicaller
echo -e "\n${YELLOW}Test 2: Checking mistralapicaller TypeScript...${NC}"
cd /workspaces/world26/temp_mistralapicaller
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ mistralapicaller TypeScript OK${NC}"
else
    echo -e "${RED}❌ mistralapicaller TypeScript errors${NC}"
fi

# Test 3: Check for hardcoded secrets
echo -e "\n${YELLOW}Test 3: Checking for hardcoded secrets...${NC}"
if grep -r "JCp4pLqmfVTSQXRTFZ61Bf5Q6aV7fXwb" /workspaces/world26 > /dev/null 2>&1; then
    echo -e "${RED}❌ Hardcoded API key found!${NC}"
else
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi

# Test 4: Check proxy endpoint exists
echo -e "\n${YELLOW}Test 4: Verifying proxy endpoint...${NC}"
if grep -q "POST /v1/chat/completions" /workspaces/world26/temp_mistralapicaller/src/index.ts; then
    echo -e "${GREEN}✅ Proxy endpoint configured correctly${NC}"
else
    echo -e "${RED}❌ Proxy endpoint not found${NC}"
fi

# Test 5: Check world26 uses correct endpoint
echo -e "\n${YELLOW}Test 5: Verifying world26 API endpoint...${NC}"
if grep -q "mistralapicaller.yusufsamodin67.workers.dev/v1/chat/completions" /workspaces/world26/vite.config.ts; then
    echo -e "${GREEN}✅ world26 configured with correct proxy URL${NC}"
else
    echo -e "${RED}❌ world26 proxy URL incorrect${NC}"
fi

# Test 6: Check CORS configuration
echo -e "\n${YELLOW}Test 6: Checking CORS configuration...${NC}"
if grep -q "cors()" /workspaces/world26/temp_mistralapicaller/src/index.ts; then
    echo -e "${GREEN}✅ CORS enabled in mistralapicaller${NC}"
else
    echo -e "${RED}❌ CORS not configured${NC}"
fi

echo -e "\n${YELLOW}=================================================="
echo -e "Test Summary Complete${NC}"
