module.exports = (msg, input, options=null) => {
    const output = `\`\`\`${input}\`\`\``;

    if (options) {
        if (options.notifyUser) {
            return msg.reply(output);
        }
    
        if (options.directMessage) {
            return msg.author.send(output);
        }
    }

    return msg.channel.send(output);
}