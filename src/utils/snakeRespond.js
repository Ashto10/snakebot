class SnakeRespond {
  constructor(client) {
    this.client = client
  }

  cleanUsernames = async (input, matches) => {
    for (let index = 0; index < matches.length; index++) {
      let match = matches[index].replace(/[<@!>]/g, '')
      input = input.replace(
        matches[index],
        await this.client.fetchUser(match).then(v => v.username),
      )
    }

    return input
  }

  toBotSpeak = input => {
    return `\`\`\`${input}\`\`\``
  }

  respond = async (message, input, options) => {
    const matches = input.match(/<@!?\d*>/g)

    if (matches && matches.length > 0) {
      input = await this.cleanUsernames(this.client, input, matches)
    }

    if (options) {
      if (options.notifyUser) {
        return message.reply(this.toBotSpeak(input))
      }

      if (options.directMessage) {
        return message.send(this.toBotSpeak(input))
      }
    }

    return message.channel.send(this.toBotSpeak(input))
  }
}

module.exports = SnakeRespond
