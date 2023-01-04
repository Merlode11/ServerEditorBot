const { AuditLogEvent } = require("discord.js")

module.exports = async ( client, guild ) => {
    const fetchGuildAuditLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.BotAdd
    }).catch(e => client.log('error', e));

    const latestBotAdd = fetchGuildAuditLogs.entries.first();
    if (latestBotAdd) {
        let {executor, target} = latestBotAdd
        if (target.id !== client.user.id) executor = guild.owner


        client.log('action', `I joined ${guild.name} (${guild.id}). I was invited by ${executor.tag} (${executor.id})`)

        if (!client.config.allowedUser.includes(executor.id)) {
            return guild.leave()
        }
    }
    if (client.guilds.cache.size > 10) {
        await client.user.setStatus("dnd")
        await client.user.setActivity(`cs: | ${client.guilds.cache.size} servs > 0 création`, {type: 'WATCHING'})
    } else {
        await client.user.setStatus("online").catch(e => client.log("error",e))
        await client.user.setActivity(`cs: | ${client.guilds.cache.size} servs`, {type: 'PLAYING'})
    }
}