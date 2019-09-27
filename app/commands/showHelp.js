const snakeRespond = require('../utils/snakeRespond');

module.exports = (message, specificHelp) => {
    specificHelp = specificHelp ? specificHelp.toLowerCase() : 'main';
    let output;

    // extract command and compare to list, then return result
    switch(specificHelp) {
        case 'help':
            output = `Uh... yeah, that's how you get specific information on a command. Just... just do that.`;
            break;
        case 'remindme':
            output = `$remindMe [time in minutes] [Message you want me to remind you about]`;
        case 'main':
        default:
            output = `Commands:\n$help: Show this text. $help [commandName] gives you more info about that command.\n$remindme: Tell me to remind you about something.`;
    }

    snakeRespond(message, output);
}