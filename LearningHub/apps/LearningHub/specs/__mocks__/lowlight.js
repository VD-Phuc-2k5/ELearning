const common = {};

function createLowlight() {
  return {
    highlight: () => ({ children: [] }),
    register: () => undefined,
    registered: () => [],
  };
}

module.exports = { common, createLowlight };
