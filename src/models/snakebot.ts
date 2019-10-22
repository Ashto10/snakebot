import User from './user';
import Discord = require('discord.js');

class SnakeBot {
    public client: Discord.Client = new Discord.Client();
    // Object that contains list of users
    trackedUsers = [];
    timers = [];

    // Tracks how often Snakebot has responded "Yes, Hello"
    helloResponce = {
        counter: 0,
        timeout: null
    }

    // Functions related to user reminders
    addReminder(userId, timeout) {
        let user = this.trackedUsers.find((el) => el.id === userId);
        if (!user) {
            user = new User(userId);
            this.trackedUsers.push(user);
        }
        if (user.reminderTimeout) {
            clearTimeout(user.reminderTimeout);
        }
        user.reminderTimeout = timeout;
    }

    isReminderActive(userId) {
        let user = this.trackedUsers.find((el) => el.id === userId);
        if (!user) {
            return false;
        }
        if (!user.reminderTimeout) {
            return false;
        }
        return true;
    }

    removeReminder(userId) {
        let user = this.trackedUsers.find((el) => el.id === userId);
        if (user) {
            clearTimeout(user.reminderTimeout);
            user.reminderTimeout = null;
        }
    }

    // Functions related to Snakebot making conversation
    getHelloCounter() {
        return this.helloResponce.counter;
    }

    increaseHelloCounter() {
        this.helloResponce.counter++;
        if (!this.helloResponce.timeout) {
            this.startHelloCounter();
        }
    }

    startHelloCounter() {
        this.helloResponce.timeout = setTimeout(() => {
            this.resetHelloCounter();
        }, 120000);
    }

    resetHelloCounter() {
        this.helloResponce.counter = 0;
        clearTimeout(this.helloResponce.timeout);
    }
}

export default SnakeBot;