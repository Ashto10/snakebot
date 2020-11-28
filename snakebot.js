require('dotenv').config()
const Discord = require('discord.js')
const SnakeBot = require('./src/utils/snakeRespond')
const commandDirectory = require('./src/commands/_directory.js')
const respondToName = require('./src/conversation/respondToName')

const client = new Discord.Client()
const snakebot = new SnakeBot(client)
const TOKEN = process.env.BOT_TOKEN
client.login(TOKEN)

client.on('ready', () => {
  console.info("*Hacker voice* I'm in")
})

client.on('message', message => {
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
    return commandDirectory(snakebot, message)
  }
  // Check to see if Snakebot can reply to the message with anything
  else {
    return respondToName(snakebot, message)
  }
})
