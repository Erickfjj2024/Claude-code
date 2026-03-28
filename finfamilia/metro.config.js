const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Apenas o necessário para supabase-js@2.45 não quebrar no RN
// ws usa stream/zlib internamente — retornamos módulo vazio
// para que o supabase caia no WebSocket nativo do React Native
config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  zlib:   require.resolve('./shims/empty.js'),
  ws:     require.resolve('./shims/empty.js'),
};

module.exports = config;
