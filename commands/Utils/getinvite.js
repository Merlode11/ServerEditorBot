const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

async function action(client, guild, author) {
    let channel = guild.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
    if (!channel) channel = await guild.channels.create("invite", { type: ChannelType.GuildText })
    const invite = await channel.createInvite({
        reason: `Publication du serveur pour ${author.id}`
    })
    return invite
}

module.exports.runText = async (client, message, args) => {
    if (message.author.id !== "424485502071209984") return message.reply({
        content: "Vous ne pouvez pas faire cette commande",
    });

    const guild = await client.guilds.fetch(args[0])
    if (!guild) return message.reply("L'id spécifié n'est pas correct")

    const invite = await action(client, guild, message.author)

    return message.reply(`Voici votre serveur : ${invite.toString()}`)

};

module.exports.runSlash = async (client, interaction, options) => {
    const guild = await client.guilds.fetch(options.getString("server"))
    if (!guild) return interaction.editReply("L'id spécifié n'est pas correct")

    const invite = await action(client, guild, interaction.user)

    return  interaction.editReply(`Voici votre serveur : ${invite.toString()}`)
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'utils',
    description: 'Récupère une invitation via une id *Merlode uniquement*',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "server",
            description: "L'id du serveur",
            required: true,
            autocomplete: true
        }
    ]
}
