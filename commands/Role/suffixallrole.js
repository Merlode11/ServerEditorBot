async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require('discord.js')

async function action(client, guild, suffix, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach( [...guild.roles.cache.values()],async role => {
        if (`${role.name}${suffix}`.length < 100)
            await role.setName(`${role.name}${suffix}`, `Configuration demandé par ${author.tag}`)
                .then(() => changed++)
                .catch(e => {
                    client.log("error", e)
                    unchanged++
                })
        else unchanged++
    })
}

module.exports.runText = async (client, message, args) => {
    if (!args[0] || args.length >= 2 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter à la fin !`).catch(e => client.log('error', e))

    let { changed, unchanged } = await action(client, message.guild, args[0], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
    await message.reactions.removeAll().catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const suffix = options.getString("suffix")
    if (!suffix || suffix.split(/\s+/).length >= 2) return interaction.editReply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter à la fin !`).catch(e => client.log('error', e))

    let { changed, unchanged } = await action(client, interaction.guild, suffix, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'role',
    description: 'ajouter un suffixe dans tous les rôles',
    usage: '<suffixe>',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "suffixe",
            description: "Le suffixe à ajouter",
            required: true
        }
    ]

}