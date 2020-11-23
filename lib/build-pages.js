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
  log.info('Generating pages...')

  const pages = globby.sync('./pages/*.{js,jsx}')

  pages.forEach((page) => {
    const { name } = path.parse(page)
    const end = log.write(`${name}.html`)

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
        ? path.resolve('.site', 'index.html')
        : path.resolve('.site', name, 'index.html')

    fs.outputFileSync(outPath, parsedHtml.toString(), console.error)
    end()
  })
}

module.exports = buildPages
