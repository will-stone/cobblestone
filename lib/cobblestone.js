#!/usr/bin/env node

require('@babel/register')({
  extensions: ['.jsx', '.js'],
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env'],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
})

// Imports
const fs = require('fs-extra')
const { createElement } = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const glob = require('glob')
const rimraf = require('rimraf')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const { parse: htmlParse } = require('node-html-parser')
const cssnano = require('cssnano')

async function build() {
  // Tidy up
  rimraf.sync(path.resolve('.cobblestone'))
  rimraf.sync(path.resolve('site'))

  const pages = glob.sync('./pages/*.{js,jsx}')

  pages.forEach((page) => {
    const { name } = path.parse(page)
    const html = ReactDOMServer.renderToStaticMarkup(
      createElement(require(path.resolve(page)).default),
    )

    // Add CSS to head
    const parsedHtml = htmlParse(html)
    const head = parsedHtml.querySelector('head')
    if (head) {
      head.appendChild('<link rel="stylesheet" href="/style.css">')
    }

    const outPath =
      name === 'index'
        ? path.resolve('site', 'index.html')
        : path.resolve('site', name, 'index.html')

    console.time(`Write ${name}`)
    fs.outputFileSync(outPath, parsedHtml.toString(), console.error)
    console.timeEnd(`Write ${name}`)
  })

  console.time('PostCSS:process')
  const result = await postcss([
    tailwindcss,
    autoprefixer,
    purgecss({
      content: [path.resolve('site', '**', '*.html')],
    }),
    cssnano(),
  ]).process(
    `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;`,
    { from: undefined },
  )
  console.timeEnd('PostCSS:process')

  console.time('PostCSS:write')
  fs.outputFileSync(
    path.resolve('site', 'style.css'),
    result.css,
    console.error,
  )
  console.timeEnd('PostCSS:write')

  console.log('Site built')
}

build()
