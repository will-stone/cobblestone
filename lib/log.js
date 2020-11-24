const timeSpan = require('time-span')
const prettyMilliseconds = require('pretty-ms')
const figures = require('figures')
const chalk = require('chalk')

const log = {
  error: (message) => console.error(`  ${chalk.red(figures.cross)} ${message}`),

  ready: (message) =>
    console.log(`\n  ${chalk.magenta(figures.pointer)} ${chalk.bold(message)}`),

  info: (message) => console.log(`  ${figures.info} ${message}`),

  timedSuccess: (message) => {
    const end = timeSpan()
    return () => {
      console.log(
        `  ${chalk.green(figures.tick)} ${message} ${chalk.gray(
          prettyMilliseconds(end.rounded()),
        )}`,
      )
    }
  },
}

module.exports = log
