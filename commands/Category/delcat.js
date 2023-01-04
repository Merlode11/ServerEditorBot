const { ChannelType, ApplicationCommandOptionType } = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, parent, author) {
    parent.fetch().catch(e => client.log('error', e))
    let deleted = 0
    let undeleted = 0
    await asyncForEach([...parent.children.cache.values()], async c => {
        await c.delete(`Supression de la catégorie par ${author.tag}`).then(() => {deleted++}).catch(e => {client.log("error", e); undeleted++})
    })

    await parent.delete(`Supression de la catégorie par ${author.tag}`)
        .then(() => {deleted++})
        .catch(e => {
            client.log("error", e)
            undeleted++
        })
    return {
        deleted,
        undeleted
    }
}


module.exports.runText = async (client, message, args) => {
    const parent =  message.guild.channels.cache.get(args[0])

    if (!parent || parent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { deleted, undeleted } = await action(client, parent, message.author).catch(e => client.log('error', e))

    message.reply(`J'ai supprimé ${deleted} salons la catégorie \`${parent.name}\`. ${undeleted ? `Je n'ai pas pu supprimer ${undeleted} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const parent = options.getChannel("catégorie")
    if (!parent || parent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { deleted, undeleted } = await action(client, parent, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai supprimé ${deleted} salons la catégorie \`${parent.name}\`. ${undeleted ? `Je n'ai pas pu supprimer ${undeleted} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}



module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'Supprime la totalité de la catégorie',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie à supprimer",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        }
    ]
}