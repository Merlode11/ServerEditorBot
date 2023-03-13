const { ChannelType, ApplicationCommandOptionType } = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, parent) {
    parent.fetch().catch(e => client.log('error', e))
    let edited = 0
    let unedited = 0
    await asyncForEach([...parent.children.cache.values()], async c => {
        await c.lockPermissions().then(() => {edited++}).catch(e => {client.log("error", e); unedited++})
    })

    return {
        edited,
        unedited
    }
}


module.exports.runText = async (client, message, args) => {
    const parent =  message.guild.channels.cache.get(args[0])

    if (!parent || parent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { edited, unedited } = await action(client, parent).catch(e => client.log('error', e))

    message.reply(`J'ai synchronisé ${edited} salons avec les permissions de la catégorie \`${parent.name}\`. ${unedited ? `Je n'ai pas pu synchroniser ${unedited} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const parent = options.getChannel("catégorie")
    if (!parent || parent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { edited, unedited } = await action(client, parent).catch(e => client.log('error', e))

    interaction.editReply(`J'ai synchronisé ${edited} salons avec les permissions de la catégorie \`${parent.name}\`. ${unedited ? `Je n'ai pas pu synchroniser ${unedited} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}



module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: "Synchronise les permissions de tous les salons d'une catégorie avec celle de la catégorie",
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie à synchroniser",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        }
    ]
}