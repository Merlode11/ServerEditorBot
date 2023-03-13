// const backup = require("discord-backup")
const backup = require("../../templates/index");
const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ChannelType } = require('discord.js')
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require('discord.js')


module.exports.runText = async (client, message, args) => {
    if (client.guilds.cache.size >= 10) return message.reply("J'ai actuellement plus de **10 serveurs**. Je ne peux plus, par conséquent, créer des serveurs")
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

                client.guilds.create(`Serveur de ${message.author.tag}`, {
                    channels: [{
                        type: ChannelType.GuildText,
                        name: 'temp',
                    }]
                }).then(g => {
                    decoSelect.setDisabled(true)
                    msg.edit({
                        components: [new ActionRowBuilder().addComponents([decoSelect])]
                    })
                    selInt.reply(`Serveur ${g.id} en cours de création !`)
                    backup.load(backupData.data, g, {
                        clearGuildBeforeRestore: true,
                        decorations: deco,
                        maxMessagesPerChannel: 0,
                    }).then(async () => {
                        let channel = g.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
                        if (!channel) channel = await g.channels.create({
                            name: "invite",
                            type: ChannelType.GuildText,
                            reason: "Création du salon pour les invitations",
                        }).catch(e => client.log('error', e))
                        channel.createInvite({
                            reason: `Publication du serveur pour ${message.author.id}`
                        }).then(invite => {
                            message.reply(`Voici votre serveur : ${invite.toString()}`)
                        }).catch(e => client.log('error', e))
                    }).catch(e => client.log("error", e))
                }).catch(e => client.log('error', e))

            }).catch(e => {
                client.log("error", e)
                decoSelect.setDisabled(true)
                msg.edit({
                    components: [new ActionRowBuilder().addComponents([decoSelect])]
                }).catch(e => client.log('error', e))
            })
    }).catch(() => {
        return message.reply(`Cette template n'a pas été trouvée ! Faites \`${client.config.prefix}templates\` pour voir celles disponibles !`).catch(e => client.log('error', e))
    })
};

module.exports.runSlash = async (client, interaction, options) => {
    const template = options.getString("template")
    if (!template) return interaction.editReply("Vous devez préciser un template !").catch(e => client.log('error', e))
    if (client.guilds.cache.size >= 10) return interaction.editReply("J'ai actuellement plus de **10 serveurs**. Je ne peux plus, par conséquent, créer des serveurs").catch(e => client.log('error', e))
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

        const filter = (interaction) => interaction.message.id === msg.id && interaction.customId === "decoSelect" && interaction.user.id === interaction.message.author.id
        msg.awaitMessageComponent(filter, {time: 15000, max: 1})
            .then(async selInt  => {
                let deco = selInt.values[0].split(";")
                deco = {
                    before: deco[0],
                    after: deco[1]
                }

                client.guilds.create(`Serveur de ${interaction.message.author.tag}`, {
                    channels: [{
                        type: ChannelType.GuildText,
                        name: 'temp',
                    }]
                }).then(g => {
                    selInt.reply(`Serveur ${g.id} en cours de création !`)
                    backup.load(backupData.data, g, {
                        clearGuildBeforeRestore: true,
                        decorations: deco,
                        maxMessagesPerChannel: 0,
                    }).then(async () => {
                        let channel = g.channels.cache.filter(chx => chx.type === ChannelType.GuildText).find(x => x.position === 0);
                        if (!channel) channel = await g.channels.create({
                            name: "invite",
                            type: ChannelType.GuildText,
                            reason: "Création du salon pour les invitations",
                        }).catch(e => client.log('error', e))
                        channel.createInvite({
                            reason: `Publication du serveur pour ${interaction.message.author.id}`
                        }).then(invite => {
                            selInt.editReply(`Voici votre serveur : ${invite.toString()}`)
                        }).catch(e => client.log("error", e))
                    }).catch(e => client.log('error', e))
                }).catch(e => client.log('error', e))
            })
    }).catch(e => {
        client.log("error", e)
        interaction.editReply(`Cette template n'a pas été trouvée ! Faites \`${client.config.prefix}templates\` pour voir celles disponibles !`).catch(e => client.log('error', e))
    })
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'templates',
    description: 'Créé un serveur via une template',
    usage: '<template>',
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