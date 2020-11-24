const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const chalk = require('chalk')
const log = require('./log')

const isProduction = process.env.NODE_ENV === 'production'

async function buildCss() {
  const logSuffix = chalk.gray(isProduction ? 'Optimised' : 'Full')
  const endTimer = log.write(`style.css ${logSuffix}`)

  const tailwindConfigPath = path.resolve('tailwind.config.js')
  const tailwindConfig = fs.existsSync(tailwindConfigPath)
    ? require(tailwindConfigPath)
    : {}

  const result = await postcss(
    [
      tailwindcss({ ...tailwindConfig, purge: false }),
      autoprefixer,
      isProduction &&
        purgecss({
          content: [path.resolve('.site', '**', '*.html')],
        }),
      isProduction && cssnano(),
    ].filter(Boolean),
  ).process(
    `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;`,
    { from: undefined },
  )

  fs.outputFileSync(
    path.resolve('.site', 'style.css'),
    result.css,
    console.error,
  )

  endTimer()
}

module.exports = buildCss
