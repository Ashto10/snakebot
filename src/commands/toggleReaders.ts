import snakeRespond from '../utils/snakeRespond';

export default function toggleReaders(message, isAdding) {
    if (!message.guild) {
        return snakeRespond(null, message, `Um, this is a server-specific command, so I'm not sure what you're trying to accomplish here...`);
    }

    const adminRole = message.guild.roles.find(r => r.name === "Admin"),
        recorderRole = message.guild.roles.find(r => r.name === "Recorders");

    let errorReaction;

    if (!adminRole || !recorderRole) {
        errorReaction = "❓";
    }

    if (!message.member.roles.has(adminRole.id)) {
        errorReaction = "⛔";
    }

    if (isAdding && message.mentions.members.size < 1) {
        errorReaction = "❓";
    }

    if (errorReaction) {
        return message.react(errorReaction).catch(err => console.log("Unable to process reaction: ", err));
    }

    const usersToModify = isAdding ? message.mentions.members : message.guild.members;

    usersToModify.forEach(user => {
        let action = isAdding ? user.addRole(recorderRole) : user.removeRole(recorderRole);
        action.then( _ => {
            return message.react("👍");
        }).catch( err => {
            console.log("Error modifying role: " + err);
        });
    });
}