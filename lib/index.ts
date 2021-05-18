import {
  autoprefixer,
  colors,
  DOMParser,
  fs,
  path,
  postcss,
  purgecss,
  React,
  ReactDomServer,
} from "./deps.ts";

console.clear();

// Title
console.log(colors.underline(colors.gray("Cobblestone\n")));

const cwd = Deno.cwd();

// If build dir exists, empty it, if not, create it.
await fs.emptyDir(path.join(cwd, ".site"));

/**
 * Pages
 */
for await (const file of fs.expandGlob("pages/**/*.tsx")) {
  // Generate HTML from JSX
  const { default: component } = await import(file.path);
  const html = ReactDomServer.renderToStaticMarkup(
    React.createElement(component),
  );

  // Augment HTML
  const parsedHtml = new DOMParser().parseFromString(html, "text/html")!;
  const head = parsedHtml.querySelector("head");
  if (head) {
    head.innerHTML = head.innerHTML +
      '<link rel="stylesheet" href="/style.css">';
  }
  const outString = parsedHtml.querySelector("html")?.outerHTML;
  if (!outString) {
    throw new Error("HTML to string conversion failed");
  }

  // Write html to an index.html file
  const { name, dir } = path.parse(file.path);
  const relativeDir = path.relative(cwd, dir);
  const [_, ...nestedDirs] = relativeDir.split(path.SEP);
  const outFileArray = name === "index"
    ? ["index.html"]
    : [...nestedDirs, name, "index.html"];
  const outPath = path.join(cwd, ".site", ...outFileArray);
  await fs.ensureFile(outPath);
  await Deno.writeTextFile(outPath, outString);

  console.log(`${colors.green("✔")} ${outFileArray.join("/")}`);
}

const twCss = await fetch(
  new URL("https://esm.sh/tailwindcss/dist/tailwind.min.css", import.meta.url),
).then((response) => response.text());

/**
 * CSS
 */
const cssFileName = "style.css";
const cssFilePath = path.join(cwd, ".site", cssFileName);
const { css } = await postcss([autoprefixer, purgecss]).process(twCss, {
  from: undefined,
});
await fs.ensureFile(cssFilePath);
await Deno.writeTextFile(cssFilePath, css);
console.log(`${colors.green("✔")} ${cssFileName}`);

/**
 * CSS
 */
// const postCSSProcessor = postcss([tailwind]);
// console.log(postCSSProcessor.process(".class { color: tan; }").css);

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