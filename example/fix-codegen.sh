#!/bin/bash

# Fix React Native Codegen Build Issues
# This script cleans build artifacts and regenerates codegen files

set -e

echo "🧹 Cleaning build artifacts..."
cd "$(dirname "$0")"

# Clean iOS build folder
rm -rf ios/build

# Clean Pods build folder
rm -rf ios/Pods/build

echo "📦 Reinstalling pods..."
cd ios
pod install

echo "✅ Done! Now try building in Xcode:"
echo "   1. Open Xcode"
echo "   2. Product > Clean Build Folder (Shift+Cmd+K)"
echo "   3. Close Xcode"
echo "   4. Delete DerivedData: rm -rf ~/Library/Developer/Xcode/DerivedData/example-*"
echo "   5. Reopen Xcode and build again"

