const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { ApplicationCommandOptionType } = require('discord.js')

async function action(client, channel, nb) {
    return await channel.bulkDelete(nb)
}

module.exports.runText = async (client, message, args) => {
    if(!args[0] || isNaN(args[0]) || parseInt(args[0]) < 1 || parseInt(args[0]) > 100) return message.reply("Vous devez mettre un nombre entre 1 et 100")

    return action(client, message.channel, args[0]).then(messages => {
                return message.channel.send(`J'ai supprimé ${messages.size} messages`).then(m => m.delete({timeout: 5000})).catch(e => client.log('error', e))
        }).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const nombre = options.getString("nombre")
    if(!nombre || isNaN(nombre) || parseInt(nombre) < 1 || parseInt(nombre) > 100) return interaction.editReply("Vous devez mettre un nombre entre 1 et 100")

    return action(client, interaction.channel, nombre).then(messages => {
                return interaction.editReply(`J'ai supprimé ${messages.size} messages`).then(m => m.delete({timeout: 5000})).catch(e => client.log('error', e))
        }).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'utils',
    description: 'Supprime un nombre définit de messages',
    options: [
        {
            type: ApplicationCommandOptionType.Number,
            name: "nombre",
            description: "Le nombre de messages à supprimer",
            required: true,
            minValue: 1,
            maxValue: 100
        }
    ]
}