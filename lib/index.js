#!/usr/bin/env node

require('@babel/register')({
  extensions: ['.jsx', '.js'],
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env'],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  cache: false,
})

// Imports
const path = require('path')
const del = require('del')
const buildCss = require('./build-css')
const buildPages = require('./build-pages')
const micro = require('micro')
const serveHandler = require('serve-handler')
const chokidar = require('chokidar')
const log = require('./log')

async function main() {
  // Tidy up
  await del([path.resolve('.site')])

  if (process.env.NODE_ENV === 'production') {
    buildPages()

    await buildCss()

    return
  }

  // Development mode

  // Use a full version of Tailwind
  await buildCss()

  // Build an initial set of pages
  buildPages()

  const server = micro(async (request, response) => {
    await serveHandler(request, response, { public: '.site' })
  })

  server.listen('3000', () => {
    // Site watcher
    chokidar
      .watch('.', {
        ignored: ['.site', 'tailwind.config.js'],
        ignoreInitial: true,
        // Try to avoid double reloads
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      })
      .on('all', () => {
        log.reload('Reloading pages...')
        // Invalidate module cache and all it's children.
        // Stops components being cached and changes not showing.
        for (const cachePath of Object.keys(require.cache)) {
          if (cachePath.startsWith(path.resolve())) {
            delete require.cache[cachePath]
          }
        }

        buildPages()
      })

    // Tailwind config watcher
    chokidar
      .watch('tailwind.config.js', {
        ignoreInitial: true,
        // Try to avoid double reloads
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      })
      .on('all', () => {
        log.reload('Reloading Tailwind configuration...')
        // Invalidate module cache and all it's children.
        // Stops components being cached and changes not showing.
        for (const cachePath of Object.keys(require.cache)) {
          if (cachePath.startsWith(path.resolve())) {
            delete require.cache[cachePath]
          }
        }

        buildCss()
      })

    log.success('http://localhost:3000')
  })
}

main().catch((error) => {
  console.error(error)
})
