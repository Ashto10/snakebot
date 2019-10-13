function addReaders(message) {
    if (!message.guild) {
        return;
    }
    let adminRole = message.guild.roles.find(r => r.name === "Admin");
    let recorderRole = message.guild.roles.find(r => r.name === "Recorders");
    if (!adminRole || !recorderRole || !message.member.roles.has(adminRole.id)) {
        return;
    }

    message.mentions.members.forEach(user => {
        user.addRole(recorderRole).catch(console.error);
    });

}

function removeReaders(message) {
    if (!message.guild) {
        return;
    }
    let adminRole = message.guild.roles.find(r => r.name === "Admin");
    let recorderRole = message.guild.roles.find(r => r.name === "Recorders");
    if (!adminRole || !recorderRole || !message.member.roles.has(adminRole.id)) {
        return;
    }

    message.guild.members.forEach(user => {
        user.removeRole(recorderRole).catch(console.error);
    });
}

module.exports = {
    addReaders,
    removeReaders
}