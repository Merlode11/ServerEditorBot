async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require("discord.js");

async function action(client, guild, time, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach([...guild.channels.cache.values()],async channel => {
        await channel.setRateLimitPerUser(time, `Slowmode demandé par ${author.tag}`)
            .then(() => changed++)
            .catch(e => {
                client.log("error", e)
                unchanged++
            })
    })
}

module.exports.runText = async (client, message, args) => {
    if (!args[0] || args.length >= 2 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => {
        client.log("error", e)
    })

    let { changed, unchanged } = await action(client, message.guild, args[0], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const time = options.getNumber("time")
    if (!time) return interaction.editReply("Merci de bien vouloir mettre un nombre de secondes !").catch(e => client.log('error', e))
    const { changed, unchanged } = await action(client, interaction.guild, time, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'channels',
    description: 'mettre un slowmode dans tous les salons',
    options: [
        {
            type: ApplicationCommandOptionType.Number,
            name: "time",
            description: "Le slowmode à appliquer",
            required: true,
            minValue: 0,
            maxValue: 21600
        }
    ]
}