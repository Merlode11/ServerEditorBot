const { WebhookClient, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, command, author) {
    const hook = new WebhookClient(client.config.logWebhook);

    return await hook.send({
        content: `<@${client.config.owner}>`,
        embeds: [
            new EmbedBuilder()
                .setAuthor({
                    name: `${author.tag} - ${author.id}`,
                    iconURL: author.displayAvatarURL()
                })
                .setTitle("Nouvelle commande proposée")
                .setColor("#d4a929")
                .setDescription(command)
        ],
    }).catch(e => client.log("error", e))
}

module.exports.runText = async (client, message, args) => {
    if (!args.length) return message.reply("Vous devez inclure une sugestion de commande !").catch(e => client.log("error",e))
    await action(client, args.join(" "), message.author).catch(e => client.log("error", e))
    return message.reply("Votre suggestion de commande a bien été envoyé au créateur du bot !\nSi jamais c'est accepté, la commande sera ajoutée et vous serez informé").catch(e => client.log("error",e))
}

module.exports.runSlash = async (client, interaction, options) => {
    await action(client, options.getString("suggestion"), interaction.user)
    return interaction.editReply("Votre suggestion de commande a bien été envoyé au créateur du bot !\nSi jamais c'est accepté, la commande sera ajoutée et vous serez informé").catch(e => client.log("error",e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    description: "Proposer une commande au créateur du bot",
    categorie: "utils",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'suggestion',
            description: "La suggestion de commande",
            required: true,
        }
    ]
}