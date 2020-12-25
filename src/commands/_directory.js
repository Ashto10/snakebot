const { AddReaders, RemoveReaders } = require('./toggleReaders')
const Command = require('./_command')
const { QuenchMe, QuenchMeNSFW } = require('./bottleGenerator')

const commandList = [
  { name: 'quenchMe', cmdClass: QuenchMe },
  { name: 'quenchMeXXX', cmdClass: QuenchMeNSFW },
  {
    name: 'addReaders',
    cmdClass: AddReaders,
  },
  {
    name: 'removeReaders',
    cmdClass: RemoveReaders,
  },
]

class Directory {
  displayDescriptionText = message => {
    let commandDescriptions =
      'Commands:\n==========\n$help: Show this text. $help [commandName] gives you more info about that command.\n'

    const requestedViaDM = Command.commandSentViaDM(message)
    const requestedByAdmin = Command.verifyIsAdmin(message, false)

    commandList.forEach(cmd => {
      if (cmd.cmdClass.settings().serverOnly && requestedViaDM) return
      if (cmd.cmdClass.settings().adminOnly) return

      commandDescriptions += `$${cmd.name}: ${cmd.cmdClass.getDescription()}\n`
    })

    if (requestedByAdmin) {
      commandDescriptions += '\nAdmin only commands:\n==========\n'
      commandList.forEach(cmd => {
        if (cmd.cmdClass.settings().adminOnly) {
          commandDescriptions += `$${cmd.name}: ${cmd.cmdClass.getDescription()}\n`
        }
      })
    }

    Command.snakebot.respond(message, commandDescriptions)
  }

  displayHelpText = (message, cmdToLookup) => {
    cmdToLookup = cmdToLookup.replace('$', '').trim()

    if (cmdToLookup === 'help') {
      return Command.snakebot.respond(
        message,
        "Uh... yeah, that's how you get specific information on a command. Just... just do that.",
      )
    }

    const foundCommand = commandList.find(
      cmd => cmd.name.toLowerCase() === cmdToLookup.toLowerCase(),
    )
    if (!foundCommand) {
      return Command.snakebot.respond(
        message,
        `Sorry, $${cmdToLookup} is not a currently supported command.`,
      )
    }

    let commandDescription = ''
    foundCommand.cmdClass.getHelpText().forEach(({ syntax, result }) => {
      if (syntax === undefined || result === undefined) return
      commandDescription += `Syntax: $${foundCommand.name} ${syntax}\n - ${result}\n\n`
    })

    return Command.snakebot.respond(message, commandDescription)
  }

  parseCommand = message => {
    const input = message.content.match(/\$(\w+)\s?(.+)?/)
    const command = input[1].toLowerCase()
    const options = input[2]

    if (command === 'help') {
      if (!!options) this.displayHelpText(message, options)
      else this.displayDescriptionText(message)
    } else {
      const requestedCommand = commandList.find(cmd => cmd.name.toLowerCase() === command)
      if (!requestedCommand) return

      if (requestedCommand.cmdClass.settings().serverOnly) {
        if (Command.commandSentViaDM(message, true)) return
      }

      if (requestedCommand.cmdClass.settings().adminOnly) {
        if (!Command.verifyIsAdmin(message)) return
      }

      requestedCommand.cmdClass.run(message, options)
    }
  }
}

module.exports = Directory
