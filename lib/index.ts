import { colors, fs, path, React, ReactDomServer } from "./deps.ts";

console.clear();

console.log(colors.underline(colors.gray("Cobblestone")));

const cwd = Deno.cwd();

// If build dir exists, empty it, if not, create it.
await fs.emptyDir(path.join(cwd, ".site"));

for await (const dirEntry of Deno.readDir("pages")) {
  const inPath = path.join(cwd, "pages", dirEntry.name);
  const { name } = path.parse(inPath);
  const { default: component } = await import(inPath);
  const html = ReactDomServer.renderToStaticMarkup(
    React.createElement(component),
  );
  const outPath = path.join(cwd, ".site", `${name}.html`);
  await Deno.writeTextFile(outPath, html);
}

// #!/usr/bin/env node

// // Imports
// const path = require('path')
// const del = require('del')
// const buildCss = require('./build-css')
// const buildPages = require('./build-pages')
// const buildPublic = require('./build-public')
// const chokidar = require('chokidar')
// const log = require('./log')
// const { App } = require('@tinyhttp/app')
// const sirv = require('sirv')
// const timeSpan = require('time-span')
// const WebSocket = require('ws')

// /**
//  * Invalidate module cache and all it's children.
//  * Stops components being cached and changes not showing.
//  */
// const invalidateRequireCache = () => {
//   for (const cachePath of Object.keys(require.cache)) {
//     if (cachePath.startsWith(path.resolve())) {
//       delete require.cache[cachePath]
//     }
//   }
// }

// const isProduction = process.env.NODE_ENV === 'production'
// const isDevelopment = !isProduction

// async function main() {
//   const endTimer = timeSpan()

//   // Tidy up
//   await del([path.resolve('.site')])

//   if (isDevelopment) {
//     console.clear()
//   }

//   log.title()

//   await buildPages()
//   await buildCss()
//   await buildPublic()

//   log.br()

//   if (isProduction) {
//     return
//   }

//   // ------ Development mode ------

//   // Start websocket server for live reloading
//   const wss = new WebSocket.Server({ port: '8090' })

//   // Watch source files for changes
//   const watcher = chokidar.watch('.', {
//     ignored: ['.site'],
//     ignoreInitial: true,
//     // Try to avoid double reloads
//     awaitWriteFinish: {
//       stabilityThreshold: 100,
//       pollInterval: 100,
//     },
//   })

//   watcher.on('all', async (event, filePath) => {
//     log.br()
//     invalidateRequireCache()

//     if (filePath === 'tailwind.config.js') {
//       await buildCss()
//     } else if (filePath.startsWith('public')) {
//       await buildPublic()
//     } else {
//       await buildPages()
//     }

//     wss.clients.forEach((client) => client.send('reload'))
//   })

//   // Start http server
//   const app = new App()
//   app.use(sirv('.site', { dev: true }))
//   app.listen(3000, () => log.ready('http://localhost:3000', endTimer()))
// }

// main().catch((error) => {
//   console.error(error)
// })
