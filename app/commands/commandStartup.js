const createReminder = require('./remindMe').createReminder;
const User = require('../models/user');

module.exports = client => {
    User.where("reminder").ne(null)
        .exec((err, users) => {
            if (err) { console.log(err)}
            if (users.length < 1) { return  }
            users.forEach(user => {
                createReminder(client, user);
            });
        });
}