const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require("discord.js")

module.exports.runText = async (client, message, args) => {
    let res = args[0].match(/discord(app)?.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/);
    if (!res && args[0].match(/\d{16,19}/)) {
        res = [null, null, args[0], null];
    }
    if (!res) return message.reply(`L'url du webhook fournis n'est pas bon`).catch(e => client.log('error', e))
    const hook = await client.fetchWebhook(res[2], res[3])
    if (!hook) return message.reply(`L'url du webhook fournis n'est pas bon`).catch(e => client.log('error', e))

    await hook.delete(`Supression demandée par ${message.author.tag}`).catch(e => client.log('error', e))
    return message.reply(`Le webhook \`${hook.name}\` a bien été supprimé !`).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const webhook = options.getString("webhook")
    const hook = await client.fetchWebhook(webhook)
    if (!hook) return interaction.editReply(`L'url du webhook fournis n'est pas bon`).catch(e => client.log('error', e))

    await hook.delete(`Supression demandée par ${interaction.user.tag}`).catch(e => client.log('error', e))
    return interaction.editReply(`Le webhook \`${hook.name}\` a bien été supprimé !`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'webhooks',
    description: 'Supprime un webhook',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'webhook',
            description: "Le webhook à supprimer",
            required: true,
            autocomplete: true
        }
    ]
}