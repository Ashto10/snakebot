class Command {
  static setSnakebotRef = snakebot => {
    this.snakebot = snakebot
  }

  static getDescription = () => 'This command does not currently have a description set.'

  static getHelpText = () => [
    { syntax: '', result: 'This command does not have any help documentation set up.' },
  ]

  static settings = () => ({ adminOnly: false, serverOnly: false })

  // Cancel operation if command is sent via DMs
  static commandSentViaDM = (message, warnIfDM = false) => {
    if (!message.guild) {
      if (warnIfDM)
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

  static verifyIsAdmin = (message, warnIfRoleNotFound = true) => {
    // Fail if not in server
    if (this.commandSentViaDM(message)) return false

    const [adminRole] = this.getRoles(message, ['Admin'], warnIfRoleNotFound)
    if (!adminRole) return false

    if (!message.member.roles.cache.has(adminRole.id)) {
      this.react(message, '⛔')
      return false
    }

    return true
  }

  static getRoles = (message, rolesArray, warnIfRoleNotFound = true) => {
    const roleIDs = []

    for (let i = 0; i < rolesArray.length; i++) {
      const roleName = rolesArray[i]
      const role = message.guild.roles.cache.find(r => r.name === roleName)

      if (!role) {
        if (warnIfRoleNotFound) {
          this.snakebot.respond(
            message,
            `"${roleName}" role not found! Please make sure such a role exists on this server with that exact name.`,
          )
        }
        roleIDs[i] = null
      } else {
        roleIDs[i] = role
      }
    }

    return roleIDs
  }
}

module.exports = Command
