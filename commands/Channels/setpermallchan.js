async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { PermissionsBitField, ApplicationCommandOptionType } = require("discord.js")

async function action(client, guild, id, type, permissions, author) {
    let key;
    switch (type) {
        case 'deny' || "false": {
            key = false
            break;
        }
        case 'neutral' || "null": {
            key = null
            break;
        }
        case 'allow' || "true": {
            key = true
            break;
        }
        default: return {
            error: "votre valeur de permissions fournie n'est pas correcte. `deny`, `neutral`, `allow`"
        }
    }

    let changed = 0
    let unchanged = 0
    const validPermissions = {}
    await asyncForEach(permissions, p => {
        if (p.includes("_")) {
            p = p.toLowerCase().split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")
        }
        if (PermissionsBitField.Flags[p]) validPermissions[p] = key
    })

    if (!validPermissions || !Object.keys(validPermissions).length) return {
        error: "Vos permissions entrés n'ont pas été correcte. Regardez ici pour voir les permissions correctes :"
    }

    await asyncForEach([...guild.channels.cache.values()], async c => {
        await c.permissionOverwrites.edit(id, validPermissions, {
            reason: `Configuration demandé par ${author.tag}`
        })
            .then(() => changed++)
            .catch(e => {
                client.log("error", e)
                unchanged++
            })
    })

    return {
        changed,
        unchanged
    }
}

module.exports.runText = async (client, message, args) => {
    if (!args) return message.reply(`Merci de bien vouloir indiquer un membre ou un rôle !`).catch(e => client.log('error', e))

    const pId = args[0].replace("<@", "").replace("&", "").replace(">", "")
    if (!pId.match(/\d{17,19}/)) return message.reply("Votre id fournie n'est pas correcte. Merci de spécifier un membre ou un rôle").catch(e => client.log('error', e))

    const member = await message.guild.members.cache.get(pId),
        role = await message.guild.roles.cache.get(pId)
    if (!member && !role) return message.reply(`Merci de bien vouloir inclure un rôle ou un membre !`).catch(e => client.log('error', e))

    await message.react("🔄")

    const channelsPermission = args.splice(2)

    let { error, changed, unchanged } = await action(client, message.guild, pId, args[1], channelsPermission, message.author).catch(e => client.log('error', e))
    if (error) return message.reply(error).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
    return await message.reactions.removeAll()
};

module.exports.runSlash = async (client, interaction, options) => {
    const pId = options.getMentionable("mention")?.id
    if (!pId) return interaction.editReply("Merci de bien vouloir indiquer un membre ou un rôle !").catch(e => client.log('error', e))

    const type = options.getString("type")
    let permissions = options.getString("permissions")
    permissions = permissions.split(/\s+|\s?;\s?|\s?-\s?|\s?,\s?/)
    if (!permissions || !permissions.length) return interaction.editReply("Merci de bien vouloir indiquer des permissions !").catch(e => client.log('error', e))

    const { error, changed, unchanged } = await action(client, interaction.guild, pId, type, permissions, interaction.user).catch(e => client.log('error', e))
    if (error) return interaction.editReply(error).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} salons. ${unchanged ? `Je n'ai pas pu changer ${unchanged} salons` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'channels',
    description: 'définir une permission pour un rôle ou un membre dans tous les salons',
    options: [
        {
            type: ApplicationCommandOptionType.Mentionable,
            name: "mention",
            description: "Le rôle ou le membre pour lequel on veut définir les permissions",
            required: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "type",
            description: "Le type de permissions à définir",
            required: true,
            choices: [
                {
                    name: "Refuser (deny)",
                    value: "deny"
                },
                {
                    name: "Neutre (neutral)",
                    value: "neutral"
                },
                {
                    name: "Accepter (allow)",
                    value: "allow"
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "permissions",
            description: "Les permissions à définir",
            required: true,
            autocomplete: true
        }
    ]
}