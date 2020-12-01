const prettyMilliseconds = require('pretty-ms')
const figures = require('figures')
const chalk = require('chalk')
const is = require('@sindresorhus/is')

const _log = (logFunction, chalkFunction, figure) => (first, ...parameters) =>
  logFunction(
    `${chalkFunction(figure)}`,
    first,
    ...parameters.map((parameter) =>
      is.number(parameter)
        ? chalk.gray(prettyMilliseconds(parameter))
        : parameter,
    ),
  )

const log = {
  stop: _log(console.log, chalk.magenta, figures.squareSmallFilled),
  error: _log(console.error, chalk.red, figures.cross),
  ready: _log(console.log, chalk.magenta, figures.pointer),
  info: _log(console.log, chalk.blue, figures.info),
  success: _log(console.log, chalk.green, figures.tick),
  br: () => console.log(),
  title: () => console.log(`\n${chalk.gray.underline('Cobblestone')}`, '\n'),
}

module.exports = log
