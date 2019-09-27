const snakeRespond = require('../utils/snakeRespond');

module.exports = (message, specificHelp) => {
    specificHelp = specificHelp ? specificHelp.toLowerCase() : 'main';
    let output;

    // extract command and compare to list, then return result
    switch(specificHelp) {
        case 'help':
            output = `No, seriously, that's all I do.`;
            break;
        case 'main':
        default:
            output = `Commands:\n$help: Show this text. $help [commandName] gives you more info about that command.\n\nThat's all I do.\nDon't you feel silly for asking.`;
    }

    snakeRespond(message, output);
}