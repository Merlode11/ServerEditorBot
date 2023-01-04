const { ApplicationCommandOptionType } = require("discord.js");
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, guild, role, author) {
    return await guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        position: role.rawPosition,
        permissions: role.permissions.bitfield,
        mentionable: role.mentionable,
        icon: role.icon ? role.icon : undefined,
        unicodeEmoji: role.unicodeEmoji ? role.unicodeEmoji : undefined,
        reason: `Duplication de rôle de ${author.tag}`}).catch(e => client.log('error', e))
}

module.exports.runText = async (client, message, args) => {
    const id = args[0].replace("<@&", "").replace(">", "")
    const role = message.guild.roles.cache.get(id)

    if (!role) return message.reply("Le role défini n'est pas correct...").catch(e => client.log('error', e))

    if (args[1]) role.name = args.splice(1).join(" ")

    action(client, message.guild, role, message.author)
        .then(r => message.reply(`Le rôle <@&${r.id}> vient d'être dupliqué de <@&${role.id}>`).catch(e => client.log('error', e)))
        .catch(e => client.log("error", e))
}

module.exports.runSlash = async (client, interaction, options) => {
    const role = options.getRole("role")
    if (!role) return interaction.editReply("Le role défini n'est pas correct...").catch(e => client.log('error', e))

    if (options.getString("name")) role.name = options.getString("name")

    action(client, interaction.guild, role, interaction.user)
        .then(r => interaction.editReply(`Le rôle <@&${r.id}> vient d'être dupliqué de <@&${role.id}>`))
        .catch(e => client.log("error", e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'role',
    description: 'duplique un rôle',
    usage: "<role>",
    options: [
        {
            name: 'role',
            description: 'Le rôle à dupliquer',
            type: ApplicationCommandOptionType.Role,
            required: true
        },
        {
            name: 'name',
            description: 'Le nom du rôle',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ]
}