const snakeRespond = require('../utils/snakeRespond');

module.exports = (client, snakebot, message) => {
    if(message.content.search(/\s?snakebot\s?/i) !== -1) {
        if (message.content.search(/miss/i) !== -1) {
            snakebot.resetHelloCounter();
            snakeRespond(client, message, 'Well I missed you!');
        } else {
            const currentHellos = snakebot.getHelloCounter();
            if (currentHellos < 4) {
                snakebot.increaseHelloCounter();
                return snakeRespond(client, message, 'YES, HELLO?');
            } else if (currentHellos < 5) {
                snakebot.increaseHelloCounter();
                return snakeRespond(client, message, 'YES?! YES, HELLO?! WHAT?!');
            }
        }
    }
}