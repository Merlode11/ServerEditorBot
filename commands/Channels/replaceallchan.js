async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType, ChannelType } = require("discord.js")

async function action(client, guild, search, replace, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach([...guild.channels.cache.values()],async channel => {
        if (channel.name.replace(search, replace).length < 100) {
            if (channel.type !== ChannelType.GuildCategory)
                await channel.setName(channel.name.replace(search, search), `Configuration demandé par ${author.tag}`)
                    .then(() => changed++)
                    .catch(e => {
                        client.log("error", e)
                        unchanged++
                    })
        } else unchanged++
    })

    return {
        changed,
        unchanged
    }
}

module.exports.runText = async (client, message, args) => {
    if (!args[0] || args.length >= 3 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à remplacer !`).catch(e => client.log('error', e))

    if (!args[1]) args[1] = ""

    let { changed, unchanged } = await action(client, message.guild, args[0], args[1], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const search = options.getString("search")
    if (!search || search.split(/\s+/).length >= 2) return interaction.editReply(`Merci de bien vouloir mettre **un** mot/charactère à remplacer !`).catch(e => client.log('error', e))

    let replace = options.getString("replace")
    if (!replace) replace = ""

    let { changed, unchanged } = await action(client, interaction.guild, search, replace, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'channels',
    description: 'modifie une valeur par une autre valeur dans tous les salons',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "search",
            description: "La valeur à remplacer",
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "replace",
            description: "La valeur qui remplace",
            required: false
        }
    ]
}