async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ChannelType } = require("discord.js")

async function action(client, guild, author) {
    let changed = 0
    let unchanged = 0

    await asyncForEach( [...guild.channels.cache.values()],async channel => {
        if (!channel.parent && channel.type !== ChannelType.GuildCategory)
            await channel.delete(`Suppression des salons demandé par ${author.id}`)
                .then(() => changed++)
                .catch(e => {
                    client.log("error", e)
                    unchanged++
                })
    })
    return {
        changed,
        unchanged
    }
}

module.exports.runText = async (client, message, args) => {
    let { changed, unchanged } = await action(client, message.guild, message.author).catch(e => client.log('error', e))

    message.reply(`J'ai supprimé ${changed} salons. ${unchanged ? `Je n'ai pas pu supprimer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })

};

module.exports.runSlash = async (client, interaction, options) => {
    let { changed, unchanged } = await action(client, interaction.guild, interaction.user).catch(e => client.log('error', e))

    interaction.editReply(`J'ai supprimé ${changed} salons. ${unchanged ? `Je n'ai pas pu supprimer ${unchanged} salons` : ``}`).catch(e => {
        client.log("error", e)
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'channels',
    description: 'Supprime tous les salons sans catégorie',
    options: [],
}