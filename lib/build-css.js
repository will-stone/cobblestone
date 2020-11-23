const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const log = require('./log')

async function buildCss() {
  const end = log.write('Stylesheet generated')

  const isProduction = process.env.NODE_ENV === 'production'

  log.info(
    isProduction
      ? 'Generating an optimised Tailwind stylesheet...'
      : 'Generating a full Tailwind stylesheet...',
  )

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
  end()
}

module.exports = buildCss
