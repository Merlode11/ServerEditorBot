async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { EmbedBuilder, ChannelType,  ApplicationCommandOptionType } = require('discord.js')

async function action(client, guild) {
    const embed = new EmbedBuilder()
        .setColor('#67b0d1')
        .setThumbnail(guild.iconURL())
        .setTitle(guild.name)
        .addFields([
          {name: "Id", value: guild.id, inline: true},
          {name: "Propriétaire", value: `<@${guild.ownerId}> (\`${guild.ownerId}\`)`, inline: true},
          {
            name: "Créé le",
            value: `**<t:${(guild.createdTimestamp / 1000).toFixed(0)}:f>** (<t:${(guild.createdTimestamp / 1000).toFixed(0)}:R>)`,
            inline: true
          },
          {
            name: `${guild.channels.cache.size} Salons`,
            value: `${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildNews).size} textuels\n ${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size} vocaux\n${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).size} catégories`,
            inline: true
          },
          {
            name: `${guild.roles.cache.size} Roles`,
            value: `${guild.roles.cache.size ? `${guild.roles.cache.map(r => r.name).join(', ')}` : 'Aucun rôles sur le serveur'}`,
            inline: true
          },
          {name: `Boosts`, value: `${guild.premiumSubscriptionCount} boosts`, inline: true},
          {
            name: `Émojis`,
            value: `${guild.emojis.cache.size ? [...guild.emojis.cache.values()].join('') : 'Aucun émoji sur le serveur'}`,
            inline: true
          },
        ])
    if (guild.rulesChannel) embed.addFields([{name: `Règlement`, value: `<#${guild.rulesChannel.id}>\n${guild.rulesChannel.name}\n${guild.rulesChannel.id}`, inline: true}])
    if (guild.banner) embed.setImage(`${guild.bannerURL()}`)

    await guild.bans.fetch().then(Bans => {
      embed.addFields([{name: `Bannissements`, value: `🔨${Bans.size}`, inline: true}])
    })
    embed.addFields([{
        name: `Nombre de membres`,
        value: `** ${guild.memberCount}** total`,
        inline: true
    }])
    return embed
}

module.exports.runText = async (client, message, args) => {
  if (message.author.id !== client.config.owner) return message.reply({
        content: "Vous ne pouvez pas faire cette commande",
    });

  if (args[0]) {
    const guild = await client.guilds.fetch(args[0])
    if (!guild) return message.reply("L'id spécifié n'est pas correct")

    await message.channel.send({
      embeds: [await action(client, guild)]
    }).catch(e => client.log('error', e))
  } else {
    let allServs = "\n"
    await asyncForEach([...client.guilds.cache.values()], g => {
      allServs += `${g.name} (${g.id})\n`
    })
    message.reply(allServs)
  }
};

module.exports.runSlash = async (client, interaction, options) => {
    const guildId = options.getString("server")
    if (guildId) {
      const guild = await client.guilds.fetch(guildId)
      if (!guild) return interaction.editReply("L'id spécifié n'est pas correct")
      await interaction.editReply({
        embeds: [await action(client, guild)]
      }).catch(e => client.log('error', e))
    } else {
      let allServs = "\n"
      await asyncForEach([...client.guilds.cache.values()], g => {
        allServs += `${g.name} (${g.id})\n`
      }).catch(e => client.log('error', e))
      return interaction.editReply(allServs)
    }
}

module.exports.help = {
  name: scriptName.replace(".js", ""),
  categorie: 'utils',
  description: 'Récupère une invitation via une id *Merlode uniquement*',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'server',
      description: "L'id du serveur",
      required: false,
      autocomplete: true
    }
  ]
}
