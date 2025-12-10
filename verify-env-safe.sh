#!/bin/zsh
#
# Safe verification script for .env file security
# Run with: zsh verify-env-safe.sh
#

echo "🔒 Verifying .env file security..."
echo ""

# Check 1: Is .env in git status?
echo "1️⃣  Checking if .env is tracked by git..."
if git status 2>&1 | grep -qi "\.env"; then
    echo "   ❌ WARNING: .env file is in git status!"
    echo "   Run: git rm --cached backend/.env"
else
    echo "   ✅ Good: .env is NOT in git status"
fi
echo ""

# Check 2: Is .env gitignored?
echo "2️⃣  Checking if .env is in .gitignore..."
if git check-ignore backend/.env > /dev/null 2>&1; then
    echo "   ✅ Good: backend/.env is gitignored"
    git check-ignore backend/.env
else
    echo "   ❌ WARNING: backend/.env is NOT gitignored!"
    echo "   Add it to .gitignore"
fi
echo ""

# Check 3: List any tracked .env files
echo "3️⃣  Checking for tracked .env files..."
TRACKED=$(git ls-files | grep -i "\.env")
if [ -z "$TRACKED" ]; then
    echo "   ✅ Good: No .env files are tracked by git"
else
    echo "   ❌ WARNING: Found tracked .env files:"
    echo "$TRACKED"
    echo "   Run: git rm --cached <file> for each"
fi
echo ""

# Check 4: Does .env file exist?
echo "4️⃣  Checking if .env file exists..."
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    echo "   📝 File size: $(wc -l < backend/.env) lines"
else
    echo "   ⚠️  backend/.env does not exist"
    echo "   You may need to create it"
fi
echo ""

echo "✅ Security check complete!"
echo ""
echo "To update your API key safely:"
echo "  1. cd backend"
echo "  2. nano .env"
echo "  3. Update the GEMINI_API_KEY variable with your new key"
echo "  4. Save (Ctrl+X, Y, Enter)"

