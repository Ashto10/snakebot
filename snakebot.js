require('dotenv').config()
const Discord = require('discord.js')
const SnakeBot = require('./src/utils/snakeRespond')
const commandDirectory = require('./src/commands/_directory.js')
const respondToName = require('./src/conversation/respondToName')

const client = new Discord.Client()
const snakebot = new SnakeBot(client)
const TOKEN = process.env.BOT_TOKEN
client.login(TOKEN)

const Command = require('./src/commands/_command')
Command.setSnakebotRef(snakebot)

client.on('ready', () => {
  console.info("*Hacker voice* I'm in")
})

client.on('message', message => {
  try {
    // Handle incoming bot messages
    if (message.author.bot) {
      switch (message.author.id) {
        // Prevent Snakebot from replying to itself
        case client.user.id:
          return
        default:
          return
      }
    }
    // Handle commands
    else if (message.content.startsWith('$')) {
      return commandDirectory.parseCommand(snakebot, message)
    }
    // Check to see if Snakebot can reply to the message with anything
    else {
      return respondToName(snakebot, message)
    }
  } catch (error) {
    snakebot.respond(message, 'Something appears to have gone wrong! Sorry about that D:')
    console.error(error)
  }
})
