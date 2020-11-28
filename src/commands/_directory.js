const toggleReaders = require('./toggleReaders')

module.exports = (snakebot, message) => {
  try {
    const input = message.content.match(/\$(\w+)\s?(.+)?/)
    const command = input[1].toLowerCase()
    const options = input[2]

    switch (command) {
      case 'addreaders':
        return toggleReaders(snakebot, message, true)
      case 'removereaders':
        return toggleReaders(snakebot, message, false)
      default:
        return
    }
  } catch (error) {
    console.error(error)
  }
}
