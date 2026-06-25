const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

const workspaceRoot = join(__dirname, '../..');

module.exports = {
  resolve: {
    alias: {
      '@learning-hub/core': join(workspaceRoot, 'packages/core/src/index.ts'),
      '@learning-hub/core/server': join(
        workspaceRoot,
        'packages/core/src/server.ts',
      ),
      '@learning-hub/domain': join(
        workspaceRoot,
        'packages/domain/src/index.ts',
      ),
      '@learning-hub/domain/server': join(
        workspaceRoot,
        'packages/domain/src/server.ts',
      ),
      '@learning-hub/data': join(workspaceRoot, 'packages/data/src/index.ts'),
      '@learning-hub/data/server': join(
        workspaceRoot,
        'packages/data/src/server.ts',
      ),
    },
  },
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
    }),
  ],
};
