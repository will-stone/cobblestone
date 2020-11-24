const prettyMilliseconds = require('pretty-ms')
const figures = require('figures')
const chalk = require('chalk')

function _log(logFunction, chalkFunction, figure) {
  return (message, milliseconds) =>
    logFunction(
      `  ${chalkFunction(figure)} ${message} ${
        milliseconds ? chalk.gray(prettyMilliseconds(milliseconds)) : ''
      }`,
    )
}

const log = {
  error: _log(console.error, chalk.red, figures.cross),
  ready: _log(console.log, chalk.magenta, figures.pointer),
  info: _log(console.log, chalk.blue, figures.info),
  success: _log(console.log, chalk.green, figures.tick),
}

module.exports = log
