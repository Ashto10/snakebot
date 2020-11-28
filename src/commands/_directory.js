const { AddReaders, RemoveReaders } = require('./toggleReaders')
const QuenchMe = require('./bottleGenerator')

const commandList = {
  quenchMe: QuenchMe,
}

const adminCommandList = {
  addReaders: AddReaders,
  removeReaders: RemoveReaders,
}

class Directory {
  static parseCommand = (snakebot, message) => {
    const input = message.content.match(/\$(\w+)\s?(.+)?/)
    const command = input[1] //.toLowerCase()
    const options = input[2]

    if (command === 'help') {
      if (options !== undefined) {
        if (Object.keys(commandList).some(command => command === options)) {
          snakebot.respond(message, commandList[options].getHelpText())
        } else if (Object.keys(adminCommandList).some(command => command === options)) {
          snakebot.respond(message, adminCommandList[options].getHelpText())
        } else if (options === 'help') {
          snakebot.respond(
            message,
            "Uh... yeah, that's how you get specific information on a command. Just... just do that.",
          )
        } else {
          snakebot.respond(message, `Sorry, $${options} is not a currently supported command`)
        }
      } else {
        let commandDescriptions =
          'Commands:\n==========\n$help: Show this text. $help [commandName] gives you more info about that command.\n'

        Object.keys(commandList).forEach(command => {
          commandDescriptions += `$${command}: ${commandList[command].getDescription()}\n`
        })

        commandDescriptions += '\nAdmin only commands:\n==========\n'

        Object.keys(adminCommandList).forEach(command => {
          commandDescriptions += `$${command}: ${adminCommandList[command].getDescription()}\n`
        })

        snakebot.respond(message, commandDescriptions)
      }
    } else if (commandList[command] !== undefined) {
      commandList[command].commandFunction(message, options)
    } else if (adminCommandList[command] !== undefined) {
      adminCommandList[command].commandFunction(message, options)
    }
  }
}

module.exports = Directory
