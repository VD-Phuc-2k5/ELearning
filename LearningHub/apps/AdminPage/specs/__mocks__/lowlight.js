const common = {};

function createLowlight() {
  return {
    highlight: () => ({ children: [] }),
    register: () => {},
    registered: () => [],
  };
}

module.exports = { common, createLowlight };
