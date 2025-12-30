# Troubleshooting Guide

## EMFILE: too many open files

This is a macOS file descriptor limit issue. Fix it with:

### Quick Fix:
```bash
ulimit -n 4096
npm start
```

### Permanent Fix:
Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
ulimit -n 4096
```

Then restart terminal or run:
```bash
source ~/.zshrc
```

## Using Development Build (Recommended)

Since this is a **bare workflow** project with native modules, you should use development builds, not Expo Go:

```bash
# Build and run iOS
npm run ios

# Build and run Android  
npm run android

# Or start Metro separately
npm start
# Then in another terminal:
npm run ios
```

## Install Watchman (Helps with file watching)

```bash
brew install watchman
```

## Other Solutions

1. **Close other apps** that might be watching files
2. **Restart Metro bundler**: `npm start -- --reset-cache`
3. **Clean build**: 
   ```bash
   # iOS
   cd ios && pod install && cd ..
   
   # Android
   cd android && ./gradlew clean && cd ..
   ```

