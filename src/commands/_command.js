class Command {
  static setSnakebotRef = snakebot => {
    this.snakebot = snakebot
  }

  static getDescription = () => 'override me'
  static getHelpText = () => 'override me'

  // Cancel operation if command is sent via DMs
  static commandSentViaDM = message => {
    if (!message.guild) {
      this.snakebot.respond(message, 'This command is not compatible outside servers, sorry!')
      return true
    }

    return false
  }

  static react = (message, icon) => {
    message.react(icon).catch(error => {
      throw new Error('Unable to process reaction: ', error)
    })
  }

  static verifyIsAdmin = (message, adminRole) => {
    if (!message.member.roles.cache.has(adminRole.id)) {
      this.react(message, '⛔')
      return false
    }

    return true
  }

  static getRoles = (message, rolesArray) => {
    const roleIDs = []

    for (let i = 0; i < rolesArray.length; i++) {
      const roleName = rolesArray[i]
      const role = message.guild.roles.cache.find(r => r.name === roleName)

      if (!role) {
        this.snakebot.respond(
          message,
          `"${roleName}" role not found! Please make sure such a role exists on this server with that exact name.`,
        )
        roleIDs[i] = null
      } else {
        roleIDs[i] = role
      }
    }

    return roleIDs
  }
}

module.exports = Command
