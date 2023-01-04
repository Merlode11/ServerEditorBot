async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ChannelType, ApplicationCommandOptionType } = require("discord.js");

async function action(client, parent, time, author) {
    parent.fetch().catch(e => client.log('error', e))
    let changed = 0
    let unchanged = 0
    await asyncForEach([...parent.children.cache.values()], async channel => {
        await channel.setRateLimitPerUser(time, `Slowmode demandé par ${author.tag}`)
            .then(() => changed++)
            .catch(e => {
                client.log("error", e)
                unchanged++
            })
    })
}

module.exports.runText = async (client, message, args) => {
    const parent =  message.guild.channels.cache.get(args[0])

    if (!parent || parent.type !== ChannelType.GuildCategory) return message.reply(`Vous devez inclure une id de catégorie valide !`).catch(e => client.log('error', e))

    if (!args[1] || args.length >= 3 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => client.log('error', e))

    let { changed, unchanged } = await action(client, parent, args[1], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const parent =  options.getChannel("catégorie")

    if (!parent || parent.type !== ChannelType.GuildCategory) return interaction.editReply(`Vous devez inclure une id de catégorie valide !`).catch(e => client.log('error', e))

    let time = options.getNumber("time")
    let { changed, unchanged } = await action(client, parent, time, interaction.user)

    interaction.editReply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'category',
    description: 'mettre un slowmode dans tous les salons de la catégorie',
    options: [
        {
            type: ApplicationCommandOptionType.Channel,
            name: "catégorie",
            description: "L'id de la catégorie dont on veut ajouter le slowmode",
            channelTypes: [ChannelType.GuildCategory],
            required: true
        },
        {
            type: ApplicationCommandOptionType.Number,
            name: "time",
            description: "Le slowmode à ajouter (en secondes)",
            required: true,
            minValue: 0,
            maxValue: 21600
        }
    ]
}