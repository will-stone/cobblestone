const copy = require('@apexearth/copy')
const timeSpan = require('time-span')
const log = require('./log')

async function buildPublic() {
  const endTimer = timeSpan()
  const {
    counts: { copies },
  } = await copy({
    from: 'public/',
    to: '.site/',
    recursive: true,
    overwrite: true,
  })
  log.success(`${copies} public files`, endTimer())
}

module.exports = buildPublic
