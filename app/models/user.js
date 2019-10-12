'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    discordId: String,
    reminder: {
        type: {
            content: { type: String, default: ''} ,
            timer: Number
        }, default: null
    }
}, {minimize: false} );

module.exports = mongoose.model('User', User);