module.exports = (snakebot, message) => {
  if (message.content.search(/\s?snakebot\s?/i) !== -1) {
    return snakebot.respond(message, 'YES, HELLO?')
  }
}
