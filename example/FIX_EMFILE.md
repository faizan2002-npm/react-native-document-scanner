# Fix EMFILE Error

## Quick Fix - Install Watchman

```bash
brew install watchman
```

After installing, restart your terminal and try:
```bash
npm start
```

## Alternative: Use Direct Build (No Metro Start Needed)

Instead of `npm start`, directly build and run:

```bash
# This handles Metro automatically
npm run ios
```

## If Watchman Doesn't Work

1. **Check current limit:**
   ```bash
   ulimit -n
   ```

2. **Increase limit for current session:**
   ```bash
   ulimit -n 65536
   npm start
   ```

3. **Make it permanent** - Add to `~/.zshrc`:
   ```bash
   ulimit -n 65536
   ```
   Then: `source ~/.zshrc`

## Why This Happens

macOS has a limit on open file descriptors. React Native/Expo watches many files, which can exceed this limit. Watchman is Facebook's solution that efficiently handles file watching.

## Best Practice

For bare workflow projects, always use:
```bash
npm run ios      # or npm run android
```

This is better than `npm start` because it:
- Handles Metro automatically
- Builds native code
- Installs on device
- Avoids file watching issues

