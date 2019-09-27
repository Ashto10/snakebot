const showHelp = require('./showHelp');

module.exports = (message) => {
    const input = message.content.match(/\$(\w+)\s?(.+)?/);
    const command = input[1].toLowerCase();
    const options = input[2];

    // extract command and compare to list, then return result
    switch(command) {
        case 'help':
            showHelp(message, options);
            break;
    }
}