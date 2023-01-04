async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require('discord.js')

async function action(client, guild, prefix, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach([...guild.roles.cache.values()],async role => {
        if (`${prefix}${role.name}`.length < 100)
            await role.setName(`${prefix}${role.name}`, `Configuration demandé par ${author.tag}`)
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
    if (!args[0] || args.length >= 2 ) return message.reply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => client.log('error', e))

    let { changed, unchanged } = await action(client, message.guild, args[0], message.author).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
    await message.reactions.removeAll()
};

module.exports.runSlash = async (client, interaction, options) => {
    const prefix = options.getString("prefix")
    if (!prefix || prefix.split(/\s+/).length >= 2) return interaction.editReply(`Merci de bien vouloir mettre **un** mot/charactère à rajouter devant !`).catch(e => client.log('error', e))

    let { changed, unchanged } = await action(client, interaction.guild, prefix, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'role',
    description: 'ajouté un préfixe dans tous les rôles',
    usage: '<prefix>',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "prefix",
            description: "Le préfixe à ajouter",
            required: true
        }
    ]
}