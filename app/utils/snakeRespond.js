function toBotSpeak(input) {
    return `\`\`\`${input}\`\`\``;
}

async function cleanUsernames(client, input, matches) {
    for (let index = 0; index < matches.length; index++) {
        let match = matches[index].replace(/[<@!>]/g, '');
        input = input.replace(matches[index], await client.fetchUser(match).then(v => v.username));
    }

    return input;
}

async function SnakeRespond(client, msg, input, options=null) {
    const matches = input.match(/<@!?\d*>/g);

    if (matches && matches.length > 0) {
        input = await cleanUsernames(client, input, matches);
    } 
    
    if (options) {
        if (options.notifyUser) {
            return msg.reply(toBotSpeak(input));
        }
    
        if (options.directMessage) {
            return msg.send(toBotSpeak(input));
        }
    }

    return msg.channel.send(toBotSpeak(input));
}

module.exports = SnakeRespond;