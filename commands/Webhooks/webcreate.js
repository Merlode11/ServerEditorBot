const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType, ChannelType } = require("discord.js")

module.exports.runText = async (client, message, args) => {
    let channel;
    let name;
    let avatar;

    if (args && args.find(a => a === "-form")) {
        if (args.filter(a => a !== "-form").length > 0) name = args.filter(a => a !== "-form").join(" ")
        if (name > 80) return message.reply("votre nom de webhook ne doit pas contenir plus de 80 charactères").catch(e => client.log('error', e))
        if (!name) message.reply("Quel est le nom du WebHook ?").catch(e => client.log('error', e))
        else message.reply("voulez-vous définir un avatar (url ou fichier) ? *`Skip`*").catch(e => client.log('error', e))

        const collector = message.channel.createMessageCollector(
            m => m.author.id === message.author.id,
            {
                time: 120000 // 2 minutes
            }
        );

        collector.on("collect", async msg => {
            // If the bot recive 'cancel'
            if (msg.content === 'cancel' || msg.content === 'annuler') {
                await message.reply(`Votre création de webhook a bien été annulée !`).catch(e => client.log('error', e))
                return collector.stop();
            }
            if (avatar && !channel) {
                if (msg.content.toLowerCase() === 'skip' || msg.content.toLowerCase() === 'here' ) {
                    channel = message.channel
                    collector.stop(`End`)
                }
                channel = msg.mentions.channels.first()
                if(!channel) channel = await message.guild.channels.cache.get(msg.content)
                if(!channel) await msg.reply(`Ce salon n'est pas bon. Merci de bien vouloir mettre une id ou une mention seule`).catch(e => client.log('error', e))
                collector.stop(`End`)
            } else if (!avatar && name) {
                if (msg.content.toLowerCase() === 'skip') {
                    avatar = null
                    return msg.reply("Voulez-vous définir un salon ? *`Skip`/`here`*").catch(e => client.log('error', e))
                } else if (msg.content && msg.content.match(/((http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|tiff|svg|bmp))/i)) {
                    avatar = msg.content
                    await msg.reply("Voulez-vous définir un salon ? *`Skip`/`here`*").catch(e => client.log('error', e))
                }
                else if (msg.attachments.first() && msg.attachments.first().url.match(/((http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|tiff|svg|bmp))/i)) {
                    avatar = msg.attachments.first().url
                    await msg.reply("Voulez-vous définir un salon ? *`Skip`/`here`*").catch(e => client.log('error', e))
                }
                else await msg.reply(`cette image n'est pas correcte`).catch(e => client.log('error', e))
            } else if (!name) {
                if (msg.content.length > 80) return msg.reply("Votre nom de webhook ne doit pas contenir plus de 80 charactères")
                name = msg.content
                await msg.reply("Voulez-vous définir un avatar (url ou fichier) ? *`Skip`*").catch(e => client.log('error', e))
            }
        })

        collector.on("end", (_, reason) => {
            if (reason === "time") {
                return message.reply("vous n'avez pas répondu assez vite aux questions.").catch(e => client.log('error', e));
            }
            channel.createWebhook({
                name,
                avatar,
                reason: `Création de webhook demandé par ${message.author.tag}`,
            }).then(hook => {
                message.reply(`Votre Webhook **\`${name}\`** a bien été créé avec l'url suivante :\n${hook.url}`).catch(e => client.log('error', e))
            }).catch(e => client.log('error', e))
        })
    } else {
        name = args.join(" ")
        if (name > 80) return message.reply("votre nom de webhook ne doit pas contenir plus de 80 charactères").catch(e => client.log('error', e))

        message.channel.createWebhook({
            name,
            reason: `Création de webhook demandé par ${message.author.tag}`
        }).then(hook => {
            message.reply(`Votre Webhook **\`${name}\`** a bien été créé avec l'url suivante :\n${hook.url}`).catch(e => client.log('error', e))
        }).catch(e => client.log('error', e))
    }
};

module.exports.runSlash = async (client, interaction, options) => {
    const name = options.getString("nom")
    let avatar = options.getString("avatar-url")
    if (!avatar) {
        avatar = options.getAttachment("avatar-file")?.url
    }
    const channel = options.getChannel("channel") || interaction.channel

    channel.createWebhook({
        name,
        avatar,
        reason: `Création de webhook demandé par ${interaction.user.tag}`
    }).then(hook => {
        interaction.editReply(`Votre Webhook **\`${name}\`** a bien été créé avec l'url suivante :\n${hook.url}`).catch(e => client.log('error', e))
    }).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'webhooks',
    description: 'Créé un webhook',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'nom',
            description: 'Le nom du webhook',
            required: true,
            maxLength: 80
        },
        {
            type: ApplicationCommandOptionType.Attachment,
            name: "avatar-upload",
            description: "L'avatar du webhook",
            required: false
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "avatar-url",
            description: "L'avatar du webhook",
            required: false
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