const fs = require("fs");
const {ActivityType} = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = async (client) => {
    if (client.guilds.cache.size >= 10) {
        await client.user.setStatus("dnd")
        await client.user.setActivity(`se: | ${client.guilds.cache.size} servs > 0 création`, {type: ActivityType.Watching})
    } else {
        await client.user.setStatus("online")
        await client.user.setActivity(`se: | ${client.guilds.cache.size} servs`, {type: ActivityType.Playing})
    }
    setInterval(async () => {
        if (client.guilds.cache.size >= 10) {
            await client.user.setStatus("dnd")
            await client.user.setActivity(`se: | ${client.guilds.cache.size} servs > 0 création`, {type: ActivityType.Watching})
        } else {
            await client.user.setStatus("online")
            await client.user.setActivity(`se: | ${client.guilds.cache.size} servs`, {type: ActivityType.Playing})
        }
    }, 60000)

    const dir = process.cwd() + "/commands/"
    await asyncForEach(fs.readdirSync(dir), async dirs => {
        const commands = fs.readdirSync(`${dir}${dirs}/`).filter(file => file.endsWith('.js'))

        for (const file of commands) {
            const getFileName = require(`${dir}/${dirs}/${file}`)
            await client.commands.set(getFileName.help.name, getFileName)
            client.application.commands.create(getFileName.help).then(() => console.log(`Command /${getFileName.help.name} ready !`))
            console.log(`Command ${getFileName.help.name} ready`)
        }
    });


    const today = new Date();
    client.log('action', `Logged in as ${client.user.tag}! Started at ${today.toLocaleDateString()} ${today.toLocaleTimeString()}. I have ${client.guilds.cache.size} servers and ${client.users.cache.size} users`, 'ready.js')
    console.log(`Logged in as ${client.user.tag}! Started at ${today.toLocaleDateString()} ${today.toLocaleTimeString()}. I have ${client.guilds.cache.size} servers and ${client.users.cache.size} users`);
}
