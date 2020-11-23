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

const timers = [
  'Prepare',
  'Find pages',
  'Write HTML',
  'PostCSS:process',
  'PostCSS:write',
]
const longestTimerStringLength = Math.max(
  ...timers.map((element) => element.length),
)
const paddedTimers = {}
for (const timer of timers) {
  paddedTimers[timer] = timer.padEnd(longestTimerStringLength)
}

async function build() {
  // Tidy up
  console.time(paddedTimers.Prepare)
  rimraf.sync(path.resolve('.cobblestone'))
  rimraf.sync(path.resolve('site'))
  console.timeEnd(paddedTimers.Prepare)

  console.time(paddedTimers['Find pages'])
  const pages = glob.sync('./pages/*.{js,jsx}')
  console.timeEnd(paddedTimers['Find pages'])

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

    console.time(paddedTimers['Write HTML'])
    fs.outputFileSync(outPath, parsedHtml.toString(), console.error)
    console.timeEnd(paddedTimers['Write HTML'])
  })

  console.time(paddedTimers['PostCSS:process'])
  const result = await postcss([
    tailwindcss,
    autoprefixer,
    purgecss({
      content: [path.resolve('site', '**', '*.html')],
    }),
  ]).process(
    `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;`,
    { from: undefined },
  )
  console.timeEnd(paddedTimers['PostCSS:process'])

  console.time(paddedTimers['PostCSS:write'])
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

  console.timeEnd(paddedTimers['PostCSS:write'])

  console.log('Site built')
}

build()
