const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add the parent directory to watchFolders so Metro can resolve the local package
config.watchFolders = [
  path.resolve(__dirname, ".."),
];

// Ensure Metro can resolve modules from the parent directory
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "..", "node_modules"),
];

module.exports = config;

