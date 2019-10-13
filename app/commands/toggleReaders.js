const snakeRespond = require('../utils/snakeRespond');

function toggleReaders(message, isAdding) {
    if (!message.guild) {
        return snakeRespond(null, message, `Um, this is a server-specific command, so I'm not sure what you're trying to accomplish here...`);
    }

    const adminRole = message.guild.roles.find(r => r.name === "Admin");
        recorderRole = message.guild.roles.find(r => r.name === "Recorders");

    if (!adminRole || !recorderRole) {
        return message.react("❓");
    }

    if (!message.member.roles.has(adminRole.id)) {
        return message.react("⛔");
    }

    if (isAdding && message.mentions.members.size < 1) {
        return message.react("❓");
    }

    const usersToModify = isAdding ? message.mentions.members : message.guild.members;

    usersToModify.forEach(user => {
        let action = isAdding ? user.addRole(recorderRole) : user.removeRole(recorderRole);
        action.then( _ => message.react("👍"))
            .catch( err => {
                console.log("Error modifying role: " + err);
                message.react("⁉")
            });
    });
}

module.exports = toggleReaders;