module.exports = (client, member) => {
    if(member.guild.ownerId === client.user.id) {
        if (client.config.allowedUsers.includes(member.id)) {
            member.guild.edit({
                owner: member
            }).then(() => {
                member.send(`Vous avez reçu la propriété de ${member.guild.name}`).catch(e => client.log("error",e))
            }).catch(e => client.log("error",e))
        }
    }
}