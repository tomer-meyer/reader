const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle module resolution issues
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    // Add any specific aliases if needed
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Add transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;