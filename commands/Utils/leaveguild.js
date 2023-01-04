const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const {ApplicationCommandOptionType} = require('discord.js')

async function action(client, guild) {
    await guild.leave().catch(e => client.log('error', e))
    return true
}

module.exports.runText = async (client, message, args) => {
    if (message.author.id !== "424485502071209984") return message.reply({
        content: "Vous ne pouvez pas faire cette commande",
    });

    if (args[0]) {
        const guild = await client.guilds.fetch(args[0])
        if (!guild) return message.reply("L'id spécifié n'est pas correct")
        await action(client, guild)
        await message.reply(`J'ai bien quitté le serveur ${guild.name} !`).catch(e => client.log('error', e))
    } else {
        message.reply("Merci de spécifier un id de serveur")
    }
};

module.exports.runSlash = async (client, interaction, options) => {
    const guildId = options.getString("server")
    if (guildId) {
        const guild = await client.guilds.fetch(guildId)
        if (!guild) return interaction.editReply("L'id spécifié n'est pas correct")
        await action(client, guild)
        return interaction.editReply(`J'ai bien quitté le serveur ${guild.name}`).catch(e => client.log('error', e))
    }
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'utils',
    description: 'Récupère une invitation via une id *Merlode uniquement*',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'server',
            description: "L'id du serveur",
            required: true,
            autocomplete: true
        }
    ]
}
