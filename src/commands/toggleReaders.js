const Command = require('./_command')

class ToggleReaders extends Command {
  static initializeCommand = message => {
    if (super.commandSentViaDM(message)) return

    const [adminRole, recorderRole] = super.getRoles(message, ['Admin', 'Recorders'])
    if (!adminRole || !recorderRole) return

    // Prevent non-admins from using this role
    if (!super.verifyIsAdmin(message, adminRole)) return

    return recorderRole
  }
}

class AddReaders extends ToggleReaders {
  static getDescription = () => 'Give everyone mentioned the Recorder role.'
  static getHelpText = () =>
    'Syntax: $addReaders [@Username(s)]\n\nWill add "Recorder" role to everyone mentioned along with the command.'

  static commandFunction = message => {
    const recorderRole = this.initializeCommand(message)
    if (!recorderRole) return

    const membersToModify = message.mentions.members
    if (membersToModify.size < 1) {
      return super.react(message, '❓')
    }

    membersToModify.forEach(member => {
      member.roles
        .add(recorderRole)
        .then(_ => {
          return super.react(message, '👍')
        })
        .catch(error => {
          throw new Error('Error modifying role: ' + error)
        })
    })
  }
}

class RemoveReaders extends ToggleReaders {
  static getDescription = () => 'Remove the Recorder role from everyone.'
  static getHelpText = () =>
    'Syntax: $removeReaders\n\nSimply removes the "Recorder" role from everyone on the server.'

  static commandFunction = message => {
    const recorderRole = this.initializeCommand(message)
    if (!recorderRole) return

    const membersToModify = message.guild.members.cache

    membersToModify.forEach(member => {
      member.roles
        .remove(recorderRole)
        .then(_ => {
          return super.react(message, '👍')
        })
        .catch(error => {
          throw new Error('Error modifying role: ' + error)
        })
    })
  }
}

module.exports = { AddReaders, RemoveReaders }
