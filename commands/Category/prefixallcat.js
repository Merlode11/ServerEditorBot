const {ChannelType, ApplicationCommandOptionType} = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, guild, prefix, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach( [...guild.channels.cache.values()],async channel => {
        if (`${prefix}${channel.name}`.length < 100) {
            if (channel.type === ChannelType.GuildCategory)
                await channel.setName(`${prefix}${channel.name}`, `Configuration demandé par ${author.tag}`)
                    .then(() => changed++)
                    .catch(e => {
                        client.log("error", e)
                        unchanged++
                    })
        } else unchanged++
    })

    return { changed, unchanged }
}

module.exports.runText = async (client, message, args) => {
    if (!args[0] || args.length >= 2 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, message.guild, args[0], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} catégories. ${unchanged ? `Je n'ai pas pu changer ${unchanged} catégories` : ``}`).catch(e => {
        client.log("error", e)
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    let prefix = options.getString("prefix")
    if (!prefix || prefix.split(/\s+/).length >= 2) return interaction.editReply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, interaction.guild, prefix, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} catégories. ${unchanged ? `Je n'ai pas pu changer ${unchanged} catégories` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'Ajouter un préfixe dans toutes les catégories',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "préfixe",
            description: "Le préfixe à ajouter",
            required: true
        }
    ]
}