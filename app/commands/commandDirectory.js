const showHelp = require('./showHelp');
const remindMe = require('./remindMe').parseUserCommand;
const toggleReaders = require('./toggleReaders');
const quenchMe = require('./quenchMe');

module.exports = (client, message) => {
    try {
        const input = message.content.match(/\$(\w+)\s?(.+)?/);
        const command = input[1].toLowerCase();
        const options = input[2];

        // extract command and compare to list, then return result
        switch(command) {
            case 'help':
                showHelp(client, message, options);
                return;
            case 'remindme':
                remindMe(client, message, options);
                return;
            case 'addreaders':
                toggleReaders(message, true);
                return;
            case 'removereaders':
                toggleReaders(message, false);
                return;
            case 'quenchme':
                quenchMe(message, options, false);
                break;
            case 'quenchmexxx':
                quenchMe(message, options, true);
                break;
            default:
                return;
        }
    } catch (error) {
        console.error(error);
    }
}