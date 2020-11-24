const timeSpan = require('time-span')
const prettyMilliseconds = require('pretty-ms')
const figures = require('figures')
const chalk = require('chalk')

const log = {
  error: (message) => console.error(`  ${chalk.red(figures.cross)} ${message}`),
  reload: (message) =>
    console.log(`\n  ${chalk.blue(figures.ellipsis)} ${message}`),
  ready: (message) =>
    console.log(`\n  ${chalk.magenta(figures.pointer)} ${message}`),
  info: (message) => console.log(`  ${figures.info} ${message}`),
  write: (message) => {
    const end = timeSpan()
    return () => {
      console.log(
        `  ${chalk.green(figures.tick)} ${chalk.gray(
          String(prettyMilliseconds(end.rounded())).padStart(5),
        )} ${message}`,
      )
    }
  },
}

module.exports = log
