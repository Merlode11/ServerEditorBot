const {ApplicationCommandOptionType, ChannelType} = require("discord.js");
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

module.exports.runText = async (client, message, args) => {
    let res = args[0].match(/discord(app)?.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/);
    if (!res) return message.reply(`L'url du webhook fournis n'est pas bon`).catch(e => client.log('error', e))
    const hook = await client.fetchWebhook(res[2], res[3]).catch(e => client.log('error', e))
    if (!hook) return message.reply(`L'url du webhook fournis n'est pas bon`).catch(e => client.log('error', e))
    const newString = args.splice(2).join(" ")
    switch (args[1].toLowerCase()) {
        case "name": {
            if (newString.length > 80) return message.reply('Le nom du webhook ne doit pas exéder 80 charactères').catch(e => client.log('error', e))
            const lastValue = hook.name
            await hook.edit({name: newString, reason: `Modification de webhook demandé par ${message.author.tag}`}).catch(e => client.log('error', e))
            return message.reply(`Le webhook **\`${lastValue}\`** a bien été modifié en **\`${newString}\`**`).catch(e => client.log('error', e))
        }
        case "avatar": {
            let avatar;
            if (newString && newString.match(/((http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|tiff|svg|bmp))/i)) {
                avatar = newString

            }
            else if (message.attachments.first() && message.attachments.first().url.match(/((http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|tiff|svg|bmp))/i)) {
                avatar = message.attachments.first().url
            }
            if (!avatar) return message.reply(`Merci de bien vouloir **upload** ou mettre un **lien** d'image pour changer l'avatar`).catch(e => client.log('error', e))
            await hook.edit({avatar: avatar, reason: `Modification de webhook demandé par ${message.author.tag}`}).catch(e => client.log('error', e))
            return message.reply(`Le webhook **\`${hook.name}\`** a bien changé de photo de profile !`).catch(e => client.log('error', e))
        }
        case "channel": {
            let channel;
            channel = message.mentions.channels.first()
            if(!channel) channel = await message.guild.channels.cache.get(newString)
            if(!channel) return message.reply(`Ce salon n'est pas bon. Merci de bien vouloir mettre une id ou une mention seule`).catch(e => client.log('error', e))
            const lastValue = hook.channelId
            await hook.edit({channel: channel.id, reason: `Modification de webhook demandé par ${message.author.tag}`}).catch(e => client.log('error', e))
            return message.reply(`Le webhook **\`${hook.name}\`** a bien changé de salon de <#${lastValue}> à <#${channel.id}>!`).catch(e => client.log('error', e))
        }
        default: return message.reply(`Vous ne pouvez seulement mettre \`channel\`, \`name\` ou encore \`avatar\` en argument`).catch(e => client.log('error', e))
    }
};

module.exports.runSlash = async (client, interaction, options) => {
    const webhook = options.getString("webhook")
    const hook = await client.fetchWebhook(webhook).catch(e => client.log('error', e))
    if (!hook) return interaction.editReply(`L'url du webhook fournis n'est pas bon`)

    const name = options.getString("name")
    let avatar = options.getString("avatar-url")
    if (!avatar) avatar = options.getAttachment("avatar-upload")
    const channel = options.getChannel("channel")

    await hook.edit({
        name: name,
        avatar: avatar,
        channel: channel.id
    }).catch(e => client.log("error",e))
    interaction.editReply(`Le webhook **\`${hook.name}\`** a bien été modifié!`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'webhooks',
    description: 'Modifie un webhook',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'webhook',
            description: "Le webhook à modifier",
            required: true,
            autocomplete: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'name',
            description: "Le nom du webhook",
            required: false,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'avatar-url',
            description: "L'url de l'avatar du webhook",
            required: false,
        },
        {
            type: ApplicationCommandOptionType.Attachment,
            name: 'avatar-upload',
            description: "L'avatar du webhook",
            required: false,
        },
        {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "Le salon du webhook",
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice],
            required: false
        }
    ]
}