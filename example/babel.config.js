module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Ensure TypeScript syntax is handled
          jsxRuntime: 'automatic',
        },
      ],
    ],
    plugins: [],
    overrides: [
      {
        // Only apply transforms to react-native files that need it
        // React Native 0.74.5+ uses both Flow and TypeScript syntax in JS files
        // Match react-native files in both local and parent node_modules
        test: /[\\/]node_modules[\\/]react-native[\\/].*\.js$/,
        plugins: [
          // Strip Flow types first (handles $Diff, $FlowExpectedError, etc.)
          '@babel/plugin-transform-flow-strip-types',
          // Then handle TypeScript syntax (handles 'as' type assertions)
          ['@babel/plugin-transform-typescript', { 
            allowNamespaces: true,
            allowDeclareFields: true,
            onlyRemoveTypeImports: false,
            isTSX: false, // Don't treat files as TSX, let JSX transform handle JSX
            allowJs: true, // Allow processing JavaScript files
          }],
        ],
      },
    ],
  };
};

