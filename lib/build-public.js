const copy = require('@apexearth/copy')
const timeSpan = require('time-span')
const log = require('./log')

async function buildPublic() {
  try {
    const endTimer = timeSpan()
    const {
      counts: { copies },
    } = await copy({
      from: 'public/',
      to: '.site/',
      recursive: true,
      overwrite: true,
    })
    const isPlural = copies !== 1
    log.success(`${copies} public file${isPlural ? 's' : ''}`, endTimer())
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Swallow "no such file", for when public doesn't exist or is deleted.
      return false
    }

    throw error
  }
}

module.exports = buildPublic
