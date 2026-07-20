module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  // integration specs share one Postgres DB with synchronize:true; parallel
  // workers race on inserts/deletes across suites, so force serial execution
  maxWorkers: 1,
  // integration beforeAll boots a full NestJS app with TypeORM + Redis —
  // default 5s is too short when DB takes a moment to accept connections
  testTimeout: 30000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
