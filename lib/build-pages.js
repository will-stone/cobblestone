require('@babel/register')({
  extensions: ['.jsx', '.js'],
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env'],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  cache: false,
})

const fs = require('fs-extra')
const { createElement } = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const globby = require('globby')
const { parse: htmlParse } = require('node-html-parser')
const log = require('./log')

function buildPages() {
  const pages = globby.sync('./pages/**/*.{js,jsx}')

  pages.forEach((page) => {
    try {
      const { name, dir } = path.parse(page)
      const [ignoredDot, ignoredPages, ...nestedDirectories] = dir.split(
        path.sep,
      )
      const endTimer = log.timedSuccess(
        `${[...nestedDirectories, name].join('/')}.html`,
      )

      const outPath =
        name === 'index'
          ? path.resolve('.site', 'index.html')
          : path.resolve('.site', ...nestedDirectories, name, 'index.html')

      const component = require(path.resolve(page)).default

      if (!component) {
        throw new Error(`${name} page component missing default export`)
      }

      const html = ReactDOMServer.renderToStaticMarkup(createElement(component))

      // Add CSS to head
      const parsedHtml = htmlParse(html)
      const head = parsedHtml.querySelector('head')
      if (head) {
        head.appendChild('<link rel="stylesheet" href="/style.css">')
      }

      fs.outputFileSync(outPath, parsedHtml.toString(), console.error)

      endTimer()
    } catch (error) {
      log.error(error.message)
    }
  })
}

module.exports = buildPages
