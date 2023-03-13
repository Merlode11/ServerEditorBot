const backup = require("../../templates/index");
const { EmbedBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ChannelType} = require('discord.js')
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

module.exports.runText = async (client, message, args) => {
    backup.fetch(args[0]).then(async backupData => {
        const embed = new EmbedBuilder()
            .setTitle("Quelle décoration voulez vous ajouter ?")
            .setColor("#67b0d1")

        const decoSelect = new StringSelectMenuBuilder()
            .setPlaceholder("Sélectionnez une décoration")
            .setCustomId("decoSelect")
            .setMaxValues(1)
            .setMinValues(1)
            .setOptions(client.config.channelDecoration.map(d => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(d.before+"⌨"+d.after)
                    .setValue(d.before+";"+d.after)
            }))

        const msg = await message.channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents([decoSelect])]
        }).catch(e => client.log('error', e))

        const filter = (interaction) => interaction.message.id === msg.id && interaction.customId === "decoSelect" && interaction.user.id === message.author.id
        msg.awaitMessageComponent(filter, {time: 15000, max: 1})
            .then(async selInt  => {
                let deco = selInt.values[0].split(";")
                deco = {
                    before: deco[0],
                    after: deco[1]
                }

                  backup.load(backupData.data, message.guild, {
                        clearGuildBeforeRestore: true,
                        decorations: deco,
                        maxMessagesPerChannel: 0,
                    }).then(async () => {
                        let channel = message.guild.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
                        if (!channel) channel = await message.guild.channels.create({
                            name: "text",
                            type: ChannelType.GuildText,
                            reason: "Création du salon pour les invitations",
                        }).catch(e => client.log('error', e))
                        channel.send(`${message.author.toString()}, le serveur a bien été transformé en template`).catch(e => client.log('error', e))
                    }).catch(e => client.log('error', e))
                }).catch(e => client.log('error', e))
    }).catch(() => {
        return message.reply(`Cette template n'a pas été trouvée ! Faites \`${client.config.prefix}templates\` pour voir celles disponibles !`).catch(e => client.log('error', e))
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const template = options.getString("template")
    if (!template) return interaction.editReply("Vous devez préciser une template !").catch(e => client.log('error', e))
    backup.fetch(template).then(async backupData => {
        const embed = new EmbedBuilder()
            .setTitle("Quelle décoration voulez vous ajouter ?")
            .setColor("#67b0d1")

        const decoSelect = new StringSelectMenuBuilder()
            .setPlaceholder("Sélectionnez une décoration")
            .setCustomId("decoSelect")
            .setMaxValues(1)
            .setMinValues(1)
            .setOptions(client.config.channelDecoration.map(d => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(d.before+"⌨"+d.after)
                    .setValue(d.before+";"+d.after)
            }))

        const msg = await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents([decoSelect])],
            fetchReply: true
        }).catch(e => client.log('error', e))

        const filter = (selInt) => selInt.message.id === msg.id && selInt.customId === "decoSelect" && selInt.user.id === interaction.user.id
        msg.awaitMessageComponent(filter, {time: 15000, max: 1})
            .then(async selInt  => {
                let deco = selInt.values[0].split(";")
                deco = {
                    before: deco[0],
                    after: deco[1]
                }

                backup.load(backupData.data, interaction.guild, {
                    clearGuildBeforeRestore: true,
                    decorations: deco,
                    maxMessagesPerChannel: 0,
                }).then(async () => {
                    let channel = interaction.guild.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
                    if (!channel) channel = await interaction.guild.channels.create({
                        name: "text",
                        type: ChannelType.GuildText,
                        reason: "Création du salon pour les invitations",
                    }).catch(e => client.log('error', e))
                    channel.send(`${interaction.user.toString()}, le serveur a bien été transformé en template`)
                }).catch(e => client.log('error', e))
            }).catch(e => client.log('error', e))

    }).catch(() => {
        return interaction.editReply(`Cette template n'a pas été trouvée ! Faites \`${client.config.prefix}templates\` pour voir celles disponibles !`).catch(e => client.log('error', e))
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'templates',
    description: 'modifie le serveur via une template',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'template',
            description: 'La template à utiliser',
            required: true,
            autocomplete: true
        }
    ]
}