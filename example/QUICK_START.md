# Quick Start Guide

## Best Way to Run (Recommended)

**Don't use `npm start` directly!** Instead, use:

```bash
# For iOS (builds and runs automatically)
npm run ios

# For Android (builds and runs automatically)  
npm run android
```

These commands will:
1. Start Metro bundler
2. Build the native app
3. Install and run on device/simulator

## If You Need Metro Separately

If you want to start Metro separately:

```bash
# Option 1: Use the start script (includes ulimit fix)
./start.sh

# Option 2: Manually set ulimit first
ulimit -n 4096
npm start

# Option 3: Use clean start
npm run start:clean
```

## Install Watchman (Helps with File Watching)

```bash
brew install watchman
```

After installing watchman, the EMFILE error should be resolved.

## Permanent Fix for File Limit

Add to `~/.zshrc`:
```bash
ulimit -n 4096
```

Then:
```bash
source ~/.zshrc
```

## Troubleshooting

- **EMFILE error**: Install watchman or use `npm run ios` directly
- **Build errors**: Clean and rebuild
  ```bash
  # iOS
  cd ios && pod install && cd ..
  
  # Android
  cd android && ./gradlew clean && cd ..
  ```

