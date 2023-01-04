const backup = require("discord-backup")
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

module.exports.runText = async (client, message, args) => {
    backup.list().then((backups) => {
        message.reply(`Voici la liste des templates disponibles : \`${backups.join("`, `")}\``).catch(e => client.log('error', e));
    });
};

module.exports.runSlash = async (client, interaction, options) => {
    backup.list().then((backups) => {
        interaction.editReply(`Voici la liste des templates disponibles : \`${backups.join("`, `")}\``).catch(e => client.log('error', e));
    })
}
module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'templates',
    description: 'Donne toutes les templates',
    options: []
}