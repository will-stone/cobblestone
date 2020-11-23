const timeSpan = require('time-span')
const prettyMilliseconds = require('pretty-ms')

const log = {
  error: (message) => console.log(`❌ ${message}`),
  reload: (message) => console.log(`♻️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  info: (message) => console.log(`ℹ️  ${message}`),
  write: (message) => {
    const end = timeSpan()
    return () => {
      console.log(
        `📝 [${String(prettyMilliseconds(end.rounded())).padStart(
          5,
        )}] ${message}`,
      )
    }
  },
}

module.exports = log
