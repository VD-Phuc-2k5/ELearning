//@ts-check

const path = require('path');
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@learning-hub/core',
    '@learning-hub/domain',
    '@learning-hub/data',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8080', 'localhost:8081'],
    },
    outputFileTracingExcludes: {
      '*': ['**/@swc+core*', '**/@esbuild+*', '**/esbuild/**', '**/sharp/**'],
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    resolveAlias: {
      '@/*': './src/*',
      '@learning-hub/core': '../../packages/core/src/index.ts',
      '@learning-hub/core/server': '../../packages/core/src/server.ts',
      '@learning-hub/domain': '../../packages/domain/src/index.ts',
      '@learning-hub/domain/server': '../../packages/domain/src/server.ts',
      '@learning-hub/data': '../../packages/data/src/index.ts',
      '@learning-hub/data/server': '../../packages/data/src/server.ts',
    },
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
