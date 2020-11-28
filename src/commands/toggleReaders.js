module.exports = (snakebot, message, isAdding) => {
  try {
    // If message.guild is unset, assume this is being called from a DM
    if (!message.guild) {
      snakebot.respond(message, 'This is a server-specific command, sorry!')
    }

    // Get relevant roles
    const adminRole = message.guild.roles.cache.find(r => r.name === 'Admin')
    const recorderRole = message.guild.roles.cache.find(r => r.name === 'Recorders')

    if (!adminRole) {
      snakebot.respond(
        message,
        '"Admin" role not found! Please make sure a role exists on this server with that exact name',
      )
    }

    if (!recorderRole) {
      snakebot.respond(
        message,
        '"Recorders" role not found! Please make sure a role exists on this server with that exact name',
      )
    }

    // Prevent non-admins from using this role
    if (!message.member.roles.cache.has(adminRole.id)) {
      return message.react('⛔').catch(error => {
        throw new Error('Unable to process reaction: ', error)
      })
    }

    // Prepare list of users to modify
    const membersToModify = isAdding ? message.mentions.members : message.guild.members.cache

    // Warn admin if no users were mentioned
    if (membersToModify.size < 1) {
      return message.react('❓').catch(error => {
        throw new Error('Unable to process reaction: ', error)
      })
    }

    // Modify users
    membersToModify.forEach(member => {
      let action = isAdding ? member.roles.add(recorderRole) : member.roles.remove(recorderRole)
      action
        .then(_ => {
          return message.react('👍')
        })
        .catch(error => {
          throw new Error('Error modifying role: ' + error)
        })
    })
  } catch (error) {
    snakebot.respond(message, 'Something unexpected went wrong, sorry about that!')
    console.error(error)
  }
}
