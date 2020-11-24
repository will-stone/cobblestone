const chalk = require('chalk')
const figures = require('figures')

const stones = `${figures.ellipsis}${figures.ellipsis}`

function title() {
  return console.log(
    `\n  ${chalk.gray(stones)} Cobblestone ${chalk.gray(stones)}`,
    '\n',
  )
}

module.exports = title
