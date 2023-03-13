// const backup = require("discord-backup");
const backup = require("../../templates/index");
const {ApplicationCommandOptionType} = require("discord.js");
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element


module.exports.runText = async (client, message, args) => {
    if(message.author.id !== client.config.owner) return message.reply("Vous n'avez pas la permission de faire cette commande!").catch(e => client.log('error', e));

    if (!args[0]) return message.reply("Merci de préciser un ID de backup!").catch(e => client.log('error', e));

    await message.react("⏳").catch(e => client.log('error', e))
    backup.create(message.guild, {
        backupID: args[0],
        jsonBeautify: true,
        doNotBackup: [ "emojis", "bans" ],
        maxMessagesPerChannel: 0,
        saveAsTemplate: true,
    }).then((backupData) => {
        // And send informations to the backup owner
        message.author.send("The backup has been created! To load it, type this command on the server of your choice: `"+client.config.prefix+"load "+backupData.id+"`!").catch(e => client.log('error', e));
        message.channel.send(":white_check_mark: Backup successfully created. The backup Id was sent in dm!").catch(e => client.log('error', e));
    }).catch(e => client.log('error', e));
};

module.exports.runSlash = async (client, interaction, options) => {
    if(interaction.user.id !== client.config.owner) return interaction.editReply("Vous n'avez pas la permission de faire cette commande!").catch(e => client.log('error', e));
    await interaction.deferReply().catch(e => client.log('error', e))
    const backupID = options.getString("id")
    backup.create(interaction.guild, {
        backupID,
        jsonBeautify: true,
        doNotBackup: [ "emojis", "bans" ],
        maxMessagesPerChannel: 0,
        saveAsTemplate: true,
    }).then((backupData) => {
        // And send informations to the backup owner
        interaction.user.send("The backup has been loaded! To delete it, type this command on the server of your choice: `"+client.config.prefix+"delete "+backupData.id+"`!").catch(e => client.log('error', e));
        interaction.editReply(":white_check_mark: Backup successfully loaded. The backup Id was sent in dm!").catch(e => client.log('error', e));
    }).catch(e => client.log('error', e));
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'templates',
    description: 'Créé une template *Merlode uniquement*',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: "L'identifiant de la template",
            required: true,
        }
    ]
}