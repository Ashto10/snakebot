const User = require('./user');

module.exports = function SnakeBot() {
    // Object that contains list of users
    this.users = [];

    // Tracks how often Snakebot has responded "Yes, Hello"
    this.helloResponce = {
        counter: 0,
        timeout: null
    }

    // Functions related to user reminders
    this.addReminder = (userId, timeout) => {
        let user = this.users.find((el) => el.id === userId);
        if (!user) {
            user = new User(userId);
            this.users.push(user);
        }
        if (user.reminderTimeout) {
            clearTimeout(user.reminderTimeout);
        }
        user.reminderTimeout = timeout;
    }

    this.isReminderActive = (userId) => {
        let user = this.users.find((el) => el.id === userId);
        if (!user) {
            return false;
        }
        if (!user.reminderTimeout) {
            return false;
        }
        return true;
    }

    this.removeReminder = (userId) => {
        let user = this.users.find((el) => el.id === userId);
        if (user) {
            clearTimeout(user.reminderTimeout);
        }
    }

    // Functions related to Snakebot making conversation
    this.getHelloCounter = () => {
        return this.helloResponce.counter;
    }

    this.increaseHelloCounter = () => {
        this.helloResponce.counter++;
        if (this.helloResponce.timeout) {
            this.startHelloCounter();
        }
    }

    this.startHelloCounter = () => {
        this.helloResponce.timeout = setTimeout(() => {
            this.helloResponce.counter = 0;
        }, 6000);
    }

    this.resetHelloCounter = () => {
        this.helloResponce.counter = 0;
        clearTimeout(this.helloResponce.timeout);
    }
}