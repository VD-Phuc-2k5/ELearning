Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    /* eslint-disable @typescript-eslint/no-empty-function */
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    /* eslint-enable @typescript-eslint/no-empty-function */
    dispatchEvent: () => false,
  }),
});
