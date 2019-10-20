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
        case 'addreaders':
            output = `Syntax: $addReaders [@Username(s)]\n\nWill add "Recorder" role to everyone mentioned along with the command`;
            break;
        case 'removereaders':
            output = `Syntax: $removeReaders\n\nSimply removes the "Recorder" role from everyone on the server.`;
            break;
        case 'quenchme':
            output = 'Syntax: $quenchMe [search-term]';
                break;
        case 'quenchmexxx':
            output = 'Syntax: $quenchMeXXX [search-term]';
            break;
        case 'main':
        default:
            output = `Commands:\n$help: Show this text. $help [commandName] gives you more info about that command.\n$remindme: Tell me to remind you about something.\n$quenchMe: I'll get you any flavor soda you want. Any. Flavor.\n$quenchMeXXX: Same as above, but I'll cover the label so no one else has to know your terrible, terrible tastes.\n\nAdmin only:\n$addReaders: Give everyone mentioned the Recorder role\n$removeReaders: Remove the Recorder role from everyone`;
    }

    snakeRespond(client, message, output);
}