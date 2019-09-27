module.exports = function User(id) {
    this.id = id;
    this.reminderTimeout = null;
}