async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ChannelType, ApplicationCommandOptionType } = require("discord.js");

async function action(client, oldParent, newParent, author) {
    let changed = 0
    let unchanged = 0

    oldParent.fetch()

    await asyncForEach([...parent.children.cache.values()],async channel => {
        if (!channel.parent && channel.type !== ChannelType.GuildCategory)
            await channel.setParent(newParent, {
                reason: `Déplacement des salons demandé par ${author.id}`
            })
                .then(() => changed++)
                .catch(e => {
                    client.log("error", e)
                    unchanged++
                })
    })
}

module.exports.runText = async (client, message, args) => {
    const oldParent =  message.guild.channels.cache.get(args[0])
    if (!oldParent || oldParent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    const newParent =  message.guild.channels.cache.get(args[1])
    if (!newParent || newParent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, oldParent, newParent, message.author).catch(e => client.log('error', e))

    message.reply(`J'ai déplacé ${changed} salons. ${unchanged ? `Je n'ai pas pu déplacer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })

};

module.exports.runSlash = async (client, interaction, options) => {
    const oldParent =  options.getChannel("provenance")
    if (!oldParent || oldParent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    const newParent =  options.getChannel("destination")
    if (!newParent || newParent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, oldParent, newParent, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai déplacé ${changed} salons. ${unchanged ? `Je n'ai pas pu déplacer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'channels',
    description: "Déplace tous les salons d'une catégorie à une autre",
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "provenance",
            description: "L'id de la catégorie dont on veut déplacer les salons",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        },
        {
            type: ApplicationCommandOptionType.Channel,
            name: "destination",
            description: "L'id de la catégorie où on veut déplacer les salons",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        }
    ]

}