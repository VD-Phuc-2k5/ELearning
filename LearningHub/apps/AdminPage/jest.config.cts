const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  displayName: 'AdminPage',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleNameMapper: {
    '@aejkatappaja/phantom-ui': '<rootDir>/specs/__mocks__/phantom-ui.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/AdminPage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testEnvironment: 'jsdom',
};

const jestConfig = createJestConfig(config);

const PKG = 'lowlight|fault|@tiptap';

module.exports = async () => {
  const resolved = await jestConfig();
  for (const value of Object.values(resolved.transform)) {
    if (Array.isArray(value) && value[1]?.resolvedBaseUrl) {
      value[1] = { ...value[1], resolvedBaseUrl: undefined };
    }
  }
  if (!resolved.moduleNameMapper) resolved.moduleNameMapper = {};
  resolved.moduleNameMapper['^lowlight$'] = '<rootDir>/specs/__mocks__/lowlight.js';
  resolved.moduleNameMapper['^react-markdown$'] = '<rootDir>/specs/__mocks__/react-markdown.js';
  return resolved;
};
