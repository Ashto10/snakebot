import { createReminder } from './remindMe';
import User from '../models/user';

export default function (snakebot) {
    User.where("reminder").ne(null)
        .exec((err, users) => {
            if (err) { console.log(err)}
            if (users.length < 1) { return  }
            users.forEach(user => {
                createReminder(snakebot, user);
            });
        });
}