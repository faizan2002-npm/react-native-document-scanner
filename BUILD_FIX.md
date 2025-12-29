# Fix for PhaseScriptExecution Error

## Issue
Getting "Command PhaseScriptExecution failed with a nonzero exit code" when building the iOS app.

## Root Cause
The React Native CLI config command is not properly reading `react-native.config.js`, causing `use_native_modules!` to fail during pod install. However, if pods are already installed, the build should still work.

## Solutions

### Solution 1: Clean Build and Rebuild (Try this first)

1. **Clean Xcode build folder:**
   - Open Xcode
   - Product → Clean Build Folder (Shift+Cmd+K)
   - Or run: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`

2. **Clean iOS build directory:**
   ```bash
   cd Example/ios
   rm -rf build
   ```

3. **Rebuild in Xcode**

### Solution 2: Fix Pod Install (If needed)

The `react-native.config.js` has been updated to include iOS sourceDir. If you need to reinstall pods:

1. **Set UTF-8 encoding:**
   ```bash
   export LANG=en_US.UTF-8
   ```

2. **Reinstall pods:**
   ```bash
   cd Example/ios
   pod deintegrate
   pod install
   ```

### Solution 3: Verify Build Script Configuration

The build script in Xcode should:
- Use `${SRCROOT}` for paths
- Have `showEnvVarsInLog = 1` enabled (for debugging)
- Reference scripts at: `../node_modules/react-native/scripts/`

### Solution 4: Check Node Path

Ensure `.xcode.env` file exists in `Example/ios/` with:
```
export NODE_BINARY=/usr/local/bin/node
```

(Already configured)

## Files Modified

1. **react-native.config.js** - Added iOS sourceDir configuration
2. **Podfile** - Added fallback for nil config (though pod install still has issues)

## Next Steps

1. Try Solution 1 first (clean build)
2. If that doesn't work, check Xcode build logs for the specific script phase that's failing
3. The error message should indicate which script phase failed (Bundle React Native, Embed Pods Frameworks, etc.)

## Common Script Phase Failures

- **Bundle React Native**: Usually node path or script path issues
- **Embed Pods Frameworks**: Pod installation issues
- **Check Pods Manifest.lock**: Podfile.lock out of sync

