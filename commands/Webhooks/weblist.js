async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { EmbedBuilder, ApplicationCommandOptionType, ChannelType} = require('discord.js')

async function allWebhooks(client, guild) {
    const embed = new EmbedBuilder()
        .setTitle(`Liste des webhooks`)
        .setColor("#67b0d1")
    await asyncForEach([...guild.channels.cache.values()], async chan => {
        if (chan.type === ChannelType.GuildText || chan.type === ChannelType.Guildews) {
            const webhooks = await chan.fetchWebhooks()
            if ([...webhooks.values()].length) {
                let string = ``;
                [...webhooks.values()].forEach(hook => {
                    string += `[${hook.name}](${hook.url} "copier l'url du webhook")\n`
                })
                embed.addFields([{name: `${chan.name} | ${chan.id}`, value: string}])
            }
        }
    })

    if (!embed.fields?.length) embed.setDescription(`Nous n'avons aucun webhook sur ce serveur`)
    return embed
}

async function channelWebhooks(client, channel) {
    const webhooks = await channel.fetchWebhooks()

    const embed = new EmbedBuilder()
        .setTitle(`Liste des webhooks`)
        .setColor("#67b0d1")
        .setDescription(`Voici la liste de tous les webhooks présent sur le salon <#${channel.id}>.`)

    await asyncForEach([...webhooks.values()], async hook => {
        embed.addFields([{name: `${hook.name}`, value: `[Copier l'URL du webhook](${hook.url})`}])
    })
    return embed
}

module.exports.runText = async (client, message, args) => {
    if (args[0]) {
        const channel = message.guild.channels.cache.get(args[0].replace('<#','').replace('>', ''))
        
        if (!channel || channel.type !== ChannelType.GuildText || channel.type !== ChannelType.GuildVoice) return message.reply(`Merci d'enter un salon valide`).catch(e => client.log("error",e))
        
        return message.channel.send({
            embeds: [await channelWebhooks(client, channel).catch(e => client.log("error",e))]
        }).catch(e => client.log("error",e))
    } else {
        return message.channel.send({
            embeds: [await allWebhooks(client, message.guild).catch(e => client.log("error",e))]
        }).catch(e => client.log("error",e))
    }
};

module.exports.runSlash = async (client, interaction, options) => {
    const channel = interaction.guild.channels.cache.get(options.getString("channel"))
    if (channel) {
        return interaction.editReply({
            embeds: [await channelWebhooks(client, channel).catch(e => client.log("error",e))]
        }).catch(e => client.log("error",e))
    } else {
        return interaction.editReply({
            embeds: [await allWebhooks(client, interaction.guild).catch(e => client.log("error",e))]
        }).catch(e => client.log("error",e))
    }
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'webhooks',
    description: 'Donne la liste des webhooks',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "Le salon du webhook",
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
            required: false
        }
    ]
}