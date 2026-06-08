const { defineConfig } = require('eslint/config')
const webenticConfig = require('eslint-config-webentic/next')

module.exports = defineConfig([
  webenticConfig,
  {
    files: ['registry/**/*.tsx', '__registry__/**/*.tsx', 'app/**/*.tsx'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
])
