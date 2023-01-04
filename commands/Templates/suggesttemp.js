const { ChannelType, WebhookClient, EmbedBuilder, ApplicationCommandOptionType} = require("discord.js");
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function action(client, guild, note, author) {
    const hook = new WebhookClient({
        id: '784734956680511528',
        token: 'jSr3uCzc-SNti6RFvN8bPiQLUrntRxV3-x-OBmh8WQ4mlzl6CTUqF96zpmCsGsTEdhDk'
    });

    let channel = guild.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
    if (!channel) channel = await guild.channels.create({
        name: "invite",
        type: ChannelType.GuildText,
        reason: "Création du salon pour les invitations",
    }).catch(e => client.log('error', e))
    const invite = await channel.createInvite({
        reason: `Publication du serveur par ${author.id}`
    }).catch(e => client.log("error", e))

    const guildOwner = await guild.fetchOwner()

    return await hook.send({
        content: "<@424485502071209984>",
        embeds: [
            new EmbedBuilder()
                .setTitle("Un nouveau type de serveur est proposé")
                .setColor("#d4a929")
                .setThumbnail(author.displayAvatarURL())
                .addFields([
                    {
                        name: "Auteur",
                        value: `<@${author.id}>\n${author.tag}\n${author.id}`,
                        inline: true
                    },
                    {
                        name: "Propriétaire",
                        value: `<@${guild.ownerId}>\n${guildOwner?.tag}\n${guild.ownerId}`,
                        inline: true
                    },
                    {
                        name: "Invitation",
                        value: invite.toString(),
                        inline: true
                    },
                    {
                        name: "Serveur",
                        value: `${guild.name}\n${guild.id}\n${guild.features}`,
                        inline: true
                    },
                    {
                        name: `${guild.channels.cache.size} Salons`,
                        value: `${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildNews).size} textuels\n ${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size} vocaux\n${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).size} catégories`,
                        inline: true
                    },
                    {
                        name: `${guild.roles.cache.size} Roles`,
                        value: `${guild.roles.cache.size ? `${guild.roles.cache.map(r => r.name).join(', ')}` : 'Aucun rôles sur le serveur'}`,
                    },
                    {
                        name: "Message de l'utilisateur",
                        value: note ?? "Aucun"
                    }
                ])
        ]
    }).catch(e => client.log("error", e))
}

module.exports.runText = async (client, message, args) => {
    await action(client, message.guild, args.join(" "), message.author).catch(e => client.log("error", e))
    return message.reply("Votre serveur a bien été envoyé en tant que demande de template au créateur du bot !\nCelui-ci arrivera le plus tôt possible pour tout vérifier !")
}

module.exports.runSlash = async (client, interaction, options) => {
    await action(client, interaction.guild, options.getString("note"), interaction.user)
    return interaction.editReply("Votre serveur a bien été envoyé en tant que demande de template au créateur du bot !\nCelui-ci arrivera le plus tôt possible pour tout vérifier !")
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    description: "Propose la création d'une template au créateur du bot",
    categorie: "templates",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'note',
            description: "Ajouter un mot pour le vérificateur",
            required: false,
        }
    ]
}