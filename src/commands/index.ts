import showHelp from './showHelp';
import remindMe from './remindMe';
import toggleReaders from './toggleReaders';
import quenchMe from './quenchMe';

export default function (snakebot, message) {
    try {
        const input = message.content.match(/\$(\w+)\s?(.+)?/);
        const command = input[1].toLowerCase();
        const options = input[2];

        // extract command and compare to list, then return result
        switch(command) {
            case 'help':
                showHelp(snakebot, message, options);
                return;
            case 'remindme':
                remindMe(snakebot, message, options);
                return;
            case 'addreaders':
                toggleReaders(message, true);
                return;
            case 'removereaders':
                toggleReaders(message, false);
                return;
            case 'quenchme':
                quenchMe(snakebot, message, options, false);
                break;
            case 'quenchmexxx':
                quenchMe(snakebot, message, options, true);
                break;
            default:
                return;
        }
    } catch (error) {
        console.error(error);
    }
}