const fs = require("fs");
const { ActivityType } = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = async (client) => {
  if (client.guilds.cache.size >= 10) {
    await client.user.setStatus("dnd")
    await client.user.setActivity(`cs: | ${client.guilds.cache.size} servs > 0 création`, {type: ActivityType.Watching })
  } else {
    await client.user.setStatus("online")
    await client.user.setActivity(`cs: | ${client.guilds.cache.size} servs`, {type: ActivityType.Playing })
  }

  const dir = process.cwd()+"/commands/"
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
  const hour = `${today.getHours()}`.length === 1 ? `0${today.getHours()}` : today.getHours();
  const min = `${today.getMinutes()}`.length === 1 ? `0${today.getMinutes()}` : today.getMinutes();
  const sec = `${today.getSeconds()}`.length === 1 ? `0${today.getSeconds()}` : today.getSeconds();
  const time = hour + ":" + min + ":" + sec;

  const day = `${today.getDate()}`.length === 1 ? `0${today.getDate()}` : today.getDate();
  const month = `${today.getMonth()+1}`.length === 1 ? `0${today.getMonth()+1}` : (today.getMonth()+1);
  const date = day  +"/"+ month+"/"+ today.getFullYear();

  client.log('action', `Logged in as ${client.user.tag}! Started at ${date} ${time}. I have ${client.guilds.cache.size} servers and ${client.users.cache.size} users`, 'ready.js')
  console.log(`Logged in as ${client.user.tag}! Started at ${date} ${time}. I have ${client.guilds.cache.size} servers and ${client.users.cache.size} users`);
}
