# Testing the TurboModule Migration

This document explains how to test the Fabric/TurboModule migration.

## Prerequisites

1. **Enable New Architecture** (if testing new architecture):
   - iOS: Set `RCT_NEW_ARCH_ENABLED=1` in your build configuration or Podfile
   - Android: Set `newArchEnabled=true` in `gradle.properties`

2. **Run Codegen**:
   - Codegen runs automatically during the build process
   - For iOS: `cd ios && pod install` (codegen runs during pod install)
   - For Android: Codegen runs during `./gradlew build`

## Testing Methods

### Method 1: Using the Test Component

1. Add the test component to your example app:

```typescript
// In example/app/test.tsx or add to existing screen
import TestModule from '../test-module';

// Then use <TestModule /> in your app
```

2. Run the app and navigate to the test screen
3. Press "Run All Tests" to verify:
   - Old API (NativeModules) access
   - New API (TurboModule) access
   - Module methods (capture, reapplyPerspectiveCrop)

### Method 2: Manual Testing in Example App

The existing example app (`example/app/scan.tsx`) already uses the module:

1. **Test capture() method**:
   - The scanner calls `scannerRef.current.capture()` when the capture button is pressed
   - Verify it works in the example app

2. **Test reapplyPerspectiveCrop()**:
   - This method is used internally but can be tested by:
   ```javascript
   import NativeRNPdfScannerManager from 'react-native-painting-scanner/src/NativeRNPdfScannerManager';
   // or
   import { NativeModules } from 'react-native';
   const module = NativeModules.RNPdfScannerManager;
   
   const result = await module.reapplyPerspectiveCrop(
     base64Image,
     coordinates,
     0.8
   );
   ```

### Method 3: Console Testing

Add this to your app to test in console:

```javascript
import { NativeModules } from 'react-native';
import NativeRNPdfScannerManager from 'react-native-painting-scanner/src/NativeRNPdfScannerManager';

// Test old API
console.log('Old API:', NativeModules.RNPdfScannerManager);

// Test new API
console.log('New API:', NativeRNPdfScannerManager);

// Test capture
if (NativeRNPdfScannerManager) {
  NativeRNPdfScannerManager.capture();
} else if (NativeModules.RNPdfScannerManager) {
  NativeModules.RNPdfScannerManager.capture();
}
```

## Expected Results

### Old Architecture (RCT_NEW_ARCH_ENABLED=0)
- ✅ `NativeModules.RNPdfScannerManager` should be available
- ✅ `capture()` and `reapplyPerspectiveCrop()` methods should work
- ⚠️ TurboModule spec may not be available (this is OK)

### New Architecture (RCT_NEW_ARCH_ENABLED=1)
- ✅ `NativeRNPdfScannerManager` (from codegen spec) should be available
- ✅ `capture()` and `reapplyPerspectiveCrop()` methods should work
- ✅ Codegen-generated files should exist in build output
- ⚠️ `NativeModules.RNPdfScannerManager` may still work as fallback

## Troubleshooting

### "TurboModule not found" or "Codegen spec not available"
- This is normal if codegen hasn't run yet
- Run `cd ios && pod install` for iOS
- For Android, codegen runs during build
- Check that `RCT_NEW_ARCH_ENABLED=1` is set

### "Module not found" errors
- Verify the module is properly registered in:
  - iOS: Check that `RNPdfScannerModule` is included in the project
  - Android: Check `DocumentScannerPackage` is registered in `MainApplication.java`

### Build errors about missing codegen files
- Run codegen manually or ensure build process runs it
- Check that `src/NativeRNPdfScanner.ts` and `src/NativeRNPdfScannerManager.ts` exist
- Verify `package.json` has the `codegenConfig` section

## Verification Checklist

- [ ] Module accessible via old API (NativeModules)
- [ ] Module accessible via new API (TurboModule) when new arch enabled
- [ ] `capture()` method works
- [ ] `reapplyPerspectiveCrop()` method works
- [ ] View component renders correctly
- [ ] Events (onPictureTaken, onRectangleDetect) fire correctly
- [ ] Both architectures work (old and new)

## Quick Test Commands

```bash
# iOS - Install pods and run codegen
cd example/ios && pod install && cd ../..

# Android - Build (codegen runs automatically)
cd example/android && ./gradlew build

# Run the example app
cd example && npm start
```

