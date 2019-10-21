const snakeRespond = require('../utils/snakeRespond');
const User = require('../models/user');
const moment = require('moment');

// Function responsible for parsing incoming command and initializing the reminder
function parseUserCommand(client, message, options) {
    let timer, content;
    try {
        const parseOptions = options.match(/(?<d>\d+(?=d))?d?(?<h>\d+(?=h))?h?(?<m>\d+(?=m))?m?(?<s>\d+(?=s))?s?\s(?<message>.+)/).groups;
        const h = parseOptions.h ? Number(parseOptions.h) : 0,
        d = parseOptions.d ? Number(parseOptions.d) : 0,
        m = parseOptions.m ? Number(parseOptions.m) : 0,
        s = parseOptions.s ? Number(parseOptions.s) : 0;
        timer = moment().add({d, h, m, s});
        content = parseOptions.message;
    } catch (error)  {
        return snakeRespond(client, message, 'Sorry, reminders need to follow this format: $remindMe xDxHxMxS [message]');
    }
    
    const discordId = message.author.id;

    User.findOne({ discordId }, (err, user) => {
        if (err) {
            snakeRespond(client, message, 'Uh, something went wrong there. Maybe try again later?');
            return console.log('Error: ' + err);
        }

        // If no user found, create a new one
        if (!user) {
            user = new User({ discordId });
        }

        let responce  = `Okay ${client, message.author.username}, `;

        // If user already has a reminder, notify them that it's being overwritten
        if (user.reminder) {
            // Clear the saved timeout id attached to the client 
            clearTimeout(client.timers['reminder_' + discordId]);
            responce += `I'll overwrite your previous reminder.\n`;
        }
        responce += `I'll DM you directly at ${timer.toString()}!`;

        user.reminder = { content, timer: timer.format() };

        // Save reminder to User schema, and create the reminder if successful
        user.save()
            .then(savedUser => {
                snakeRespond(client, message, responce);
                // If a timeout is returned, store it for later access
                let timeout = createReminder(client, savedUser);
                if (timeout) {
                    client.timers['reminder_' + discordId] = timeout;
                }
            })
            .catch(err => console.log('Error: ' + err));
    });
}

// Create a reminder for the passed in user, or fire immidiately if it was missed during downtime
function createReminder(client, user) {
    client.fetchUser(user.discordId)
        .then(userToRemind => {
            if (!userToRemind) { return; }
            let alarmTime = moment(user.reminder.timer);

            return setTimeout(() => {
                snakeRespond(client, userToRemind, `Hey, don't forget:\n\n${user.reminder.content}\n\nOkay bye!`, {directMessage: true});
                clearReminder(user.discordId);
            }, alarmTime.diff());
        });
}

// Remove the reminder from the specified id
function clearReminder(discordId) {
    User.findOne({ discordId }, (err, user) => {
        if (err) { return console.log('Error: ' + err); }
        user.reminder = null;
        user.save()
            .then()
            .catch(err => console.log('Error: ' + err));
    });
}

module.exports = {
    parseUserCommand,
    createReminder
};