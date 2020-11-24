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
const chokidar = require('chokidar')
const log = require('./log')
const { App } = require('@tinyhttp/app')
const sirv = require('sirv')
const timeSpan = require('time-span')

/**
 * Invalidate module cache and all it's children.
 * Stops components being cached and changes not showing.
 */
const invalidateRequireCache = () => {
  for (const cachePath of Object.keys(require.cache)) {
    if (cachePath.startsWith(path.resolve())) {
      delete require.cache[cachePath]
    }
  }
}

async function main() {
  const endTimer = timeSpan()

  // Tidy up
  await del([path.resolve('.site')])

  if (process.env.NODE_ENV === 'production') {
    log.title()

    buildPages()

    await buildCss()

    log.br()

    return
  }

  // Development mode

  console.clear()

  log.title()

  // Use a full version of Tailwind
  await buildCss()

  // Build an initial set of pages
  buildPages()

  const app = new App()

  app.use(sirv('.site', { dev: true }))

  app.listen(3000, () => {
    log.ready('http://localhost:3000', endTimer())
  })

  const siteWatcher = chokidar.watch('.', {
    ignored: ['.site', 'tailwind.config.js'],
    ignoreInitial: true,
    // Try to avoid double reloads
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
  })

  siteWatcher.on('all', () => {
    log.br()
    invalidateRequireCache()
    buildPages()
  })

  const tailwindConfigWatcher = chokidar.watch('tailwind.config.js', {
    ignoreInitial: true,
    // Try to avoid double reloads
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
  })

  tailwindConfigWatcher.on('all', async () => {
    log.br()
    invalidateRequireCache()
    await buildCss()
  })
}

main().catch((error) => {
  console.error(error)
})
