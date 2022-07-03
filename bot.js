require('dotenv').config()
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

// Need to move database to new host at some point
// const mongoose = require('mongoose');
// const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ds153824.mlab.com:53824/snakebot`;
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const Snakebot = require('./app/models/snakebot');
const snakebot = new Snakebot();

const commandStartup = require('./app/commands/commandStartup');
const commandDirectory = require('./app/commands/commandDirectory');
const conversation = require('./app/conversation/conversation');

client.timers = [];

client.on('ready', () => {
    console.log("*Hacker voice* I'm in.");
    commandStartup(client);
})

client.on('message', message => {
    // Check to make sure Snakebot isn't replying to itself
    if (message.member && message.member.user.id === client.user.id || message.author.bot) {
        return;
    }

    // Run commands
    if (message.content.startsWith('$')) {
        return commandDirectory(client, message);
    }

    // If someone mentions Snakebot, have it respond
    if (message.content.search(/\s?snakebot\s?/i) !== -1) {
        return conversation(client, snakebot, message);
    }
})

client.login(process.env.BOT_TOKEN)