const {ChannelType, ApplicationCommandOptionType} = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, oldParent) {
    oldParent.fetch().catch(e => client.log('error', e))
    let cloned = 0
    let uncloned = 0
    const newParent = await oldParent.clone()
    cloned++
    await asyncForEach([...oldParent.children.cache.values],async c => {
        await c.clone({
            parent: newParent.id
        }).then(() => {
            cloned++
        }).catch(e => {
            client.log('error', e);
            uncloned++
        })
    })
    return {
        cloned,
        uncloned
    }
}

module.exports.runText = async (client, message, args) => {
    const oldParent =  message.guild.channels.cache.get(args[0])

    if (!oldParent || oldParent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { cloned, uncloned } = await action(client, oldParent).catch(e => client.log('error', e))

    message.reply(`J'ai dupliqué ${cloned} salons de la catégorie \`${oldParent.name}\`. ${uncloned ? `Je n'ai pas pu dupliquer ${uncloned} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const oldParent = options.getChannel("catégorie")
    if (!oldParent || oldParent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => {
        client.log("error", e)
    })

    let { cloned, uncloned } = await action(client, oldParent).catch(e => client.log('error', e))

    interaction.editReply(`J'ai dupliqué ${cloned} salons de la catégorie \`${oldParent.name}\`. ${uncloned ? `Je n'ai pas pu dupliquer ${uncloned} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'Duplique une catégorie avec ses salons',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie à dupliquer",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        }
    ]
}