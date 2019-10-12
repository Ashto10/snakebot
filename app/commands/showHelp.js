const snakeRespond = require('../utils/snakeRespond');

module.exports = (client, message, specificHelp) => {
    specificHelp = specificHelp ? specificHelp.toLowerCase() : 'main';
    let output;

    // extract command and compare to list, then return result
    switch(specificHelp) {
        case 'help':
            output = `Uh... yeah, that's how you get specific information on a command. Just... just do that.`;
            break;
        case 'remindme':
            output = `Syntax: $remindMe [When you want to be reminded] [Message you want me to remind you about]\n\nEnter your reminder time as "xDxHxMxS",\nwhere D = Days, H = Hours, M = Minutes, S = Seconds\nYou can omit any units you don't need, ex: 1h12s\nJust make sure not to use spaces, or to type the units out of order.`;
            break;
        case 'main':
        default:
            output = `Commands:\n$help: Show this text. $help [commandName] gives you more info about that command.\n$remindme: Tell me to remind you about something.`;
    }

    snakeRespond(client, message, output);
}