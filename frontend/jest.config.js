/**
 * The babel options are inlined here on purpose. A babel.config.js in the extension folder would
 * also be picked up when the theme builds the extension sources.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.js'],
  transform: {
    '^.+\\.jsx?$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    }],
  },
};
