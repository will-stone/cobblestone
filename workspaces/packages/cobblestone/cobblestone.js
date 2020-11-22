#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable node/global-require */

// Imports
const fs = require('fs-extra')
const { createElement } = require('react')
const ReactDOMServer = require('react-dom/server')
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const rimraf = require('rimraf')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const { parse: htmlParse } = require('node-html-parser')

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
        createElement(
          require(path.resolve('.cobblestone', `${name}.js`)).default,
        ),
      )

      const parsedHtml = htmlParse(html)

      const head = parsedHtml.querySelector('head')

      // Add CSS to head
      if (head) {
        head.appendChild('<link rel="stylesheet" href="/css/style.css">')
      }

      const outPath =
        name === 'index'
          ? path.resolve('site', 'index.html')
          : path.resolve('site', name, 'index.html')

      fs.outputFileSync(outPath, parsedHtml.toString(), console.error)
    })

    postcss([
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
  },
)
