const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// supabase-js 2.45 usa o pacote `ws` para WebSocket (Node.js).
// React Native já tem WebSocket nativo — dizemos ao Metro para ignorar o `ws`
// e todos os módulos Node.js que ele precisa.
const EMPTY_MODULE = require.resolve('./shims/empty.js');

config.resolver.resolveRequest = (context, moduleName, _platform) => {
  const nodeModules = ['ws', 'stream', 'zlib', 'crypto', 'net', 'tls', 'http', 'https', 'url'];
  if (nodeModules.includes(moduleName)) {
    return { type: 'sourceFile', filePath: EMPTY_MODULE };
  }
  return context.resolveRequest(context, moduleName, _platform);
};

module.exports = config;
