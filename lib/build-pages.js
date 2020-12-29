require('@babel/register')({
  extensions: ['.jsx', '.js'],
  presets: [
    ['@babel/preset-env', { targets: { node: '15' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  cache: false,
})

const fs = require('fs-extra')
const { createElement } = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const globby = require('globby')
const { parse: htmlParse } = require('node-html-parser')
const timeSpan = require('time-span')
const is = require('@sindresorhus/is')
const log = require('./log')
const main = require('./main')

const isProduction = process.env.NODE_ENV === 'production'

async function buildPages() {
  const pagesPaths = await globby('./pages/**/*.{js,jsx}')

  for await (const pagePath of pagesPaths) {
    try {
      const endTimer = timeSpan()

      const { name, dir } = path.parse(pagePath)

      const [ignoredDot, ignoredPages, ...nestedDirectories] = dir.split(
        path.sep,
      )

      // ------ Build HTML ------

      main.pageInfo.name = name
      main.pageInfo.pathname =
        name === 'index'
          ? `/${nestedDirectories.join('/')}`
          : `/${[...nestedDirectories, name].join('/')}`

      const { default: component, getStaticProps } = require(path.resolve(
        pagePath,
      ))

      const staticProps = is.function(getStaticProps)
        ? await getStaticProps()
        : {}

      if (!component) {
        throw new Error(`${name} page component missing default export`)
      }

      // Statically generate html from component tree
      const html = ReactDOMServer.renderToStaticMarkup(
        createElement(component, staticProps),
      )

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

      // ------ Write file ------

      const outFileArray =
        name === 'index'
          ? [...nestedDirectories, 'index.html']
          : [...nestedDirectories, name, 'index.html']

      const outPath = path.resolve('.site', ...outFileArray)

      fs.outputFileSync(outPath, parsedHtml.toString(), console.error)

      log.success(`${outFileArray.join('/')}`, endTimer())
    } catch (error) {
      log.error(error)
    }
  }
}

module.exports = buildPages
