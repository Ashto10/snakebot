const Command = require('./_command')

class AddReaders extends Command {
  static getDescription = () => 'Give everyone mentioned the Recorder role.'

  static getHelpText = () => [
    {
      syntax: '[@Username(s)]',
      result: 'Will add "Recorder" role to everyone mentioned along with the command.',
    },
  ]

  static settings = () => ({ adminOnly: true, serverOnly: true })

  static run = message => {
    const recorderRole = super.getRoles(message, ['Recorders'])
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

class RemoveReaders extends Command {
  static getDescription = () => 'Remove the Recorder role from everyone.'

  static getHelpText = () => [
    { syntax: '', result: 'Removes the "Recorder" role from everyone on the server.' },
  ]

  static settings = () => ({ adminOnly: true, serverOnly: true })

  static run = message => {
    const recorderRole = super.getRoles(message, ['Recorders'])
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
