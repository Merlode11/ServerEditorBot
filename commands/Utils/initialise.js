const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { GuildVerificationLevel, GuildExplicitContentFilter, GuildDefaultMessageNotifications, PermissionsBitField } = require('discord.js')

async function action(client, guild, author) {
    await guild.edit({
        explicitContentFilter: GuildExplicitContentFilter.AllMembers,
        verificationLevel: GuildVerificationLevel.Medium,
        systemChannel: false,
        defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
        reason: `Configuration demandé par ${author.tag}`
    }).catch(e => client.log('error', e))
    await guild.roles.everyone.edit({
        permissions: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.AddReactions,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.UseExternalStickers,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.ChangeNickname,
            PermissionsBitField.Flags.Connect,
        ],
        reason: `Configuration demandé par ${author.tag}`
    }).catch(e => client.log('error', e))
    return true
}

module.exports.runText = async (client, message, args) => {
    await action(client, message.guild, message.author).catch(e => client.log('error', e))
    message.reply(`Le serveur a bien été configuré !`).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    await action(client, interaction.guild, interaction.user).catch(e => client.log('error', e))
    interaction.editReply(`Le serveur a bien été configuré !`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'utils',
    description: 'Configure correctement le serveur',
    options: []
}