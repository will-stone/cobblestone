require('@babel/register')({
  extensions: ['.jsx', '.js'],
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
const timeSpan = require('time-span')

const isProduction = process.env.NODE_ENV === 'production'

async function buildPages() {
  const pages = await globby('./pages/**/*.{js,jsx}')

  pages.forEach((page) => {
    try {
      const { name, dir } = path.parse(page)
      const [ignoredDot, ignoredPages, ...nestedDirectories] = dir.split(
        path.sep,
      )
      const endTimer = timeSpan()

      const outFileArray =
        name === 'index'
          ? ['index.html']
          : [...nestedDirectories, name, 'index.html']

      const outPath =
        name === 'index'
          ? path.resolve('.site', ...outFileArray)
          : path.resolve('.site', ...outFileArray)

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

      // Receive reload signal from server
      if (!isProduction) {
        const body = parsedHtml.querySelector('body')
        if (body) {
          body.appendChild(
            "<script>new WebSocket('ws://localhost:8090').onmessage = () => location.reload()</script>",
          )
        }
      }

      fs.outputFileSync(outPath, parsedHtml.toString(), console.error)

      log.success(`${outFileArray.join('/')}`, endTimer())
    } catch (error) {
      log.error(error.message)
    }
  })
}

module.exports = buildPages
