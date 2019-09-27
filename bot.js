require('dotenv').config()
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const Snakebot = require('./app/models/snakebot');
const snakebot = new Snakebot();

const commandDirectory = require('./app/commands/commandDirectory');
const conversation = require('./app/conversation/conversation');

client.on('ready', () => {
  console.log("*Hacker voice* I'm in.");
})

client.on('message', message => {
    // Check to make sure Snakebot isn't replying to itself
    if (message.member && message.member.user.id === client.user.id || message.author.bot) {
        return;
    }

    // Run commands
    if (message.content.startsWith('$')) {
        return commandDirectory(snakebot, message);
    }

    // If someone mentions Snakebot, have it respond
    if(message.content.search(/\s?snakebot\s?/i) !== -1) {
        return conversation(snakebot, message);
    }
})

client.login(process.env.BOT_TOKEN)