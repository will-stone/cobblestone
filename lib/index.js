#!/usr/bin/env node

// Imports
const path = require('path')
const del = require('del')
const buildCss = require('./build-css')
const buildPages = require('./build-pages')
const buildPublic = require('./build-public')
const log = require('./log')
const { App } = require('@tinyhttp/app')
const sirv = require('sirv')
const timeSpan = require('time-span')
const WebSocket = require('ws')
const watch = require('node-watch')
const exitHook = require('exit-hook')

// Capture ctrl-C
exitHook(() => {
  // Remove ^C from terminal
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  // Print message
  log.br()
  log.stop('Done')
  // Clean exit
  process.exit(0)
})

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

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

async function main() {
  const endTimer = timeSpan()

  // Tidy up
  await del([path.resolve('.site')])

  if (isDevelopment) {
    console.clear()
  }

  log.title()

  await buildPages()
  await buildCss()
  await buildPublic()

  if (isProduction) {
    return
  }

  // ------ Development mode ------

  // Start websocket server for live reloading
  const wss = new WebSocket.Server({ port: '8090' })

  // Watch source files for changes
  watch(
    '.',
    {
      recursive: true,
      filter(f, skip) {
        // skip node_modules
        if (/\/node_modules/u.test(f)) {
          return skip
        }

        // skip .git folder
        if (/\.git/u.test(f)) {
          return skip
        }

        // Skip build dir
        if (/\.site/u.test(f)) {
          return skip
        }

        return true
      },
    },
    async (event_, filePath) => {
      log.br()
      log.info(`${event_} ${filePath}`)
      log.br()
      invalidateRequireCache()

      if (filePath === 'tailwind.config.js') {
        await buildCss()
      } else if (filePath.startsWith('public')) {
        await buildPublic()
      } else {
        await buildPages()
      }

      wss.clients.forEach((client) => client.send('reload'))
    },
  )

  log.br()

  // Start http server
  const app = new App()
  app.use(sirv('.site', { dev: true }))
  app.listen(3000, () => log.ready('http://localhost:3000', endTimer()))
}

main().catch((error) => {
  console.error(error)
})
