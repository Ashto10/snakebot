const showHelp = require('./showHelp');
const remindMe = require('./remindMe').parseUserCommand;

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
            default:
                return;
        }
    } catch (error) {
        console.error();
    }
}