//TODO: Port this to something like MongoDB so that data persists across sessions

const snakeRespond = require('../utils/snakeRespond');

module.exports = (snakebot, message, options) => {
    let time, reminder;
    try {
        const parseOptions = options.match(/(\d+)+\s(.+)/);
        time = +parseOptions[1];
        reminder = parseOptions[2];
    } catch (error)  {
        return snakeRespond(message, 'Sorry, reminders need to follow this format: $remindMe [number of minutes] [message]');
    };

    const userId = message.author.id;
    let responce = `Okay ${message.author.username}, `;

    if (snakebot.isReminderActive(userId)) {
        responce += `I'll overwrite your previous reminder.\n`;
        snakebot.removeReminder(userId);
    }
    responce += `I'll ping you in ${time} minute${time > 1 ? 's' : ''}!`;
    snakeRespond(message, responce);

    snakebot.addReminder(userId, setTimeout(() => {
        //Make sure channel still exists when timer expires
        if (message.channel && !message.channel.deleted) {
            snakeRespond(message, reminder.toString(), {notifyUser: true} );
        }
        
    }, time * 60000));
    

    
}