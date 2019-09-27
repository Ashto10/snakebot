const snakeRespond = require('../utils/snakeRespond');

module.exports = (snakebot, message) => {
    if(message.content.search(/\s?snakebot\s?/i) !== -1) {
        if (message.content.search(/miss/i) !== -1) {
            snakebot.resetHelloCounter();
            snakeRespond(message, 'Well I missed you!');
        } else {
            const currentHellos = snakebot.getHelloCounter();
            if (currentHellos >= 5) {
                snakebot.resetHelloCounter();
                return snakeRespond(message, 'YES?! YES, HELLO?! WHAT?!');
            } else {
                snakebot.increaseHelloCounter();
                return snakeRespond(message, 'YES, HELLO?');
            }
        }
    }
}