const {ActivityType} = require("discord.js");
module.exports = async ( client, guild ) => {
    if (client.guilds.cache.size >= 10) {
        await client.user.setStatus("dnd")
        await client.user.setActivity(`se: | ${client.guilds.cache.size} servs > 0 création`, {type: ActivityType.Watching })
    } else {
        await client.user.setStatus("online")
        await client.user.setActivity(`se: | ${client.guilds.cache.size} servs`, {type: ActivityType.Playing })
    }
    client.log('action', `I left ${guild.name} (${guild.id}).`)
}