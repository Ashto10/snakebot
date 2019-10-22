require('dotenv').config();

import mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ds153824.mlab.com:53824/snakebot`, { useNewUrlParser: true, useUnifiedTopology: true });

import Snakebot from './models/snakebot';
const snakebot = new Snakebot();

import commandStartup from './commands/commandStartup';
import commandDirectory from './commands';
import conversation from './commands/conversation';

snakebot.client.on('ready', () => {
  console.log("*Hacker voice* I'm in.");
  commandStartup(snakebot);
})

snakebot.client.on('message', message => {
    // Check to make sure Snakebot isn't replying to itself
    if (message.member && message.member.user.id === snakebot.client.user.id || message.author.bot) {
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

snakebot.client.login(process.env.BOT_TOKEN)