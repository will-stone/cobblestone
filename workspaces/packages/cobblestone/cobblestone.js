#!/usr/bin/env node

const fs = require('fs-extra')
const { createElement } = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const rimraf = require('rimraf')

// Tidy up
rimraf.sync(path.resolve('.cobblestone'))
rimraf.sync(path.resolve('site'))

const pages = glob.sync('./pages/*.{js,jsx}')
const pagesObject = {}
for (const page of pages) {
  const { name } = path.parse(page)
  pagesObject[name] = path.resolve(page)
}

webpack(
  {
    mode: 'production',
    entry: pagesObject,
    output: {
      filename: '[name].js',
      path: path.resolve('.cobblestone'),
      libraryTarget: 'commonjs',
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    externals: {
      react: 'react',
      'react-dom': 'reactDOM',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/u,
          exclude: /node_modules/u,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env'],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
            },
          },
        },
      ],
    },
  },
  (error, stats) => {
    if (error) {
      console.error(error.stack || error)
      if (error.details) {
        console.error(error.details)
      }

      return
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
      console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    pages.forEach((page) => {
      const { name } = path.parse(page)

      const html = ReactDOMServer.renderToStaticMarkup(
        // eslint-disable-next-line node/global-require
        createElement(require(path.resolve('.cobblestone', `${name}.js`)).default),
      )

      const outPath =
        name === 'index'
          ? path.resolve('site', 'index.html')
          : path.resolve('site', name, 'index.html')

      fs.outputFileSync(outPath, html, console.error)
    })

    console.log('done')
  },
)
