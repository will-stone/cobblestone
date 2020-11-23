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

async function build() {
  // Tidy up
  rimraf.sync(path.resolve('.cobblestone'))
  rimraf.sync(path.resolve('site'))

  const pages = glob.sync('./pages/*.{js,jsx}')
  const pagesObject = {}
  for (const page of pages) {
    const { name } = path.parse(page)
    pagesObject[name] = path.resolve(page)
  }

  pages.forEach((page) => {
    const { name } = path.parse(page)
    const html = ReactDOMServer.renderToStaticMarkup(
      createElement(require(path.resolve(page)).default),
    )

    // Add CSS to head
    const parsedHtml = htmlParse(html)
    const head = parsedHtml.querySelector('head')
    if (head) {
      head.appendChild('<link rel="stylesheet" href="/css/style.css">')
    }

    const outPath =
      name === 'index'
        ? path.resolve('site', 'index.html')
        : path.resolve('site', name, 'index.html')

    fs.outputFileSync(outPath, parsedHtml.toString(), console.error)
  })

  await postcss([
    tailwindcss,
    autoprefixer,
    purgecss({
      content: [path.resolve('site', '**', '*.html')],
    }),
  ])
    .process(
      `
          @tailwind base;
          @tailwind components;
          @tailwind utilities;`,
      { from: undefined },
    )
    .then((result) => {
      fs.outputFileSync(
        path.resolve('site', 'css', 'style.css'),
        result.css,
        console.error,
      )
      if (result.map) {
        fs.writeFile(
          path.resolve('site', 'css', 'style.css.map'),
          result.map,
          console.error,
        )
      }
    })

  console.log('Site built')
}

build()
