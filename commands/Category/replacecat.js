const {ChannelType, ApplicationCommandOptionType} = require("discord.js");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, parent, search, replace, author) {
    parent.fetch().catch(e => client.log('error', e))
    let changed = 0
    let unchanged = 0

    await asyncForEach([...parent.children.cache.values()], async channel => {
        if (channel.name.replace(search, replace).length < 100)
            await channel.setName(channel.name.replace(search, replace), `Configuration demandé par ${author.tag}`)
                .then(() => changed++)
                .catch(e => {
                    client.log("error", e)
                    unchanged++
                })
        else unchanged++
    })

    return {
        changed,
        unchanged
    }
}

module.exports.runText = async (client, message, args) => {
    const parent =  message.guild.channels.cache.get(args[0])

    if (!parent || parent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => client.log('error', e));

    if (!args[1] || args.length >= 4 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à remplacer !`).catch(e => client.log('error', e));

    if (!args[2]) args[2] = ""

    let { changed, unchanged } = await action(client, parent, args[1], args[2], message.author).catch(e => client.log('error', e));

    message.reply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e));
};

module.exports.runSlash = async (client, interaction, options) => {
    const parent =  options.getChannel("catégorie")

    if (!parent || parent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => client.log('error', e));

    let search = options.getString("search")
    if (!search || search.split(/\s+/).length >= 2) return interaction.editReply(`Merci de bien vouloir mettre **un** mot/charactère à remplacer !`).catch(e => client.log('error', e));

    let replace = options.getString("replace")
    if (!replace) replace = ""

    let { changed, unchanged } = await action(client, parent, search, replace, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'Place un préfixe dans tous les salons de la catégorie',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie dont on veut ajouter le préfixe",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "search",
            description: "Le mot à remplacer",
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "replace",
            description: "Le mot qui remplacera le mot précédent",
            required: false
        }
    ]

}