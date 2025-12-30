// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Watch the parent directory for local file dependencies
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

// Optimize file watching to prevent EMFILE errors
config.watchFolders = [projectRoot, monorepoRoot];

// Block unnecessary watching
config.resolver = {
  ...config.resolver,
  blockList: [
    // Only block nested react-native, not the one we need
    /node_modules\/.*\/node_modules\/react-native\/.*/,
    /\.git\/.*/,
    /android\/.*/,
    /ios\/build\/.*/,
  ],
  // Enable symlinks and watch parent directory
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ],
  // Ensure react-native from parent node_modules is resolved and transpiled
  unstable_enablePackageExports: true,
};

// Configure transformer to transpile react-native (it contains TypeScript syntax in 0.74.5+)
// React Native 0.74.5+ uses TypeScript syntax that needs to be transpiled by Babel
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Ensure all JS files are transpiled, including those in node_modules/react-native
  unstable_allowRequireContext: true,
};

module.exports = config;

