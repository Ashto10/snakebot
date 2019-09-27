module.exports = (msg, input, options=null) => {
    if (options && options.notifyUser) {
        msg.reply(`\`\`\`${input}\`\`\``);
    } else {
        msg.channel.send(`\`\`\`${input}\`\`\``);
    }
}