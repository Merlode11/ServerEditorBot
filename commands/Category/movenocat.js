async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ChannelType, ApplicationCommandOptionType } = require("discord.js");

async function action(client, parent, guild, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach([...guild.channels.cache.values()],async channel => {
        if (!channel.parent && channel.type !== ChannelType.GuildCategory)
            await channel.setParent(parent, {
                reason: `Déplacement des salons demandé par ${author.tag}`
            })
                .then(() => changed++)
                .catch(e => {
                    client.log("error", e)
                    unchanged++
                })
    })
    return {
        changed,
        unchanged
    }
}

module.exports.runText = async (client, message, args) => {
    const parent =  message.guild.channels.cache.get(args[0])

    if (!parent || parent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, parent, message.guild, message.author).catch(e => client.log('error', e))

    message.reply(`J'ai déplacé ${changed} salons. ${unchanged ? `Je n'ai pas pu déplacer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })

};

module.exports.runSlash = async (client, interaction, options) => {
    const parent = options.getChannel("catégorie")
    if (!parent || parent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, parent, interaction.guild, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai déplacé ${changed} salons. ${unchanged ? `Je n'ai pas pu déplacer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'Déplace les salons sans catégorie dans une catégorie',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie à déplacer",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        }
    ]
}