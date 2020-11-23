const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')

async function buildCss() {
  const isProduction = process.env.NODE_ENV === 'production'
  console.time('PostCSS:process')
  const result = await postcss(
    [
      tailwindcss,
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
  console.timeEnd('PostCSS:process')

  console.time('PostCSS:write')
  fs.outputFileSync(
    path.resolve('.site', 'style.css'),
    result.css,
    console.error,
  )
  console.timeEnd('PostCSS:write')
}

module.exports = buildCss
