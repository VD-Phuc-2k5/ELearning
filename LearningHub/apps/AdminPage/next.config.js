//@ts-check

const path = require('path');
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8080', 'localhost:8081'],
    },
  },
  transpilePackages: [
    '@learning-hub/core',
    '@learning-hub/domain',
    '@learning-hub/data',
  ],
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_NEST_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
