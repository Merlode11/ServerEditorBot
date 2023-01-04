async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { PermissionsBitField, ApplicationCommandOptionType } = require('discord.js')

async function action(client, guild, type, permissions, author) {
    let key;
    switch (type) {
        case 'deny' || "false": {
            key = false
            break;
        }
        case 'allow' || "true": {
            key = true
            break;
        }
        default: return {
            error: "votre valeur de permissions fournie n'est pas correcte. `deny`, `allow`"
        }
    }

    const validPermissions = []
    await asyncForEach(permissions, p => {
        if (p.includes("_")) {
            p = p.toLowerCase().split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")
        }
        if (PermissionsBitField.Flags[p]) validPermissions.push(p)
    })
    if (!validPermissions.length) return {
        error: "Vos permissions entrés n'ont pas été correcte. Regardez ici pour voir les permissions correctes :"
    }
    let changed = 0
    let unchanged = 0
    await asyncForEach([...guild.roles.cache.values()], async role => {
        let newPerms = role.permissions.toArray()
        await asyncForEach(validPermissions, perm => {
            if (newPerms.includes(perm) && !key) {
                newPerms = newPerms.filter(p => p !== perm)
            } else if (!newPerms.includes(perm) && key) {
                newPerms.push(perm)
            } else {
                client.log('error', 'noting happends')
            }
        })
        if (newPerms.length === role.permissions.toArray().length) return unchanged++;

        await role.setPermissions(newPerms,`Configuration demandé par ${author.tag}`)
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
    if (!args[0]) return message.reply("vous devez mettre une valur de permission `deny`, `allow`").catch(e => client.log('error', e))

    let { error, changed, unchanged } = await action(client, message.guild, args[0], args.slice(1), message.author).catch(e => client.log('error', e))
    if (error) return message.reply(error).catch(e => client.log('error', e))

    message.reply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
};

module.exports.runSlash = async (client, interaction, options) => {
    const type = options.getString("type")
    let permissions = options.getString("permissions")
    permissions = permissions.split(/\s+|\s?;\s?|\s?-\s?|\s?,\s?/)

    let { error, changed, unchanged } = await action(client, interaction.guild, type, permissions, interaction.user).catch(e => client.log('error', e))
    if (error) return interaction.editReply(error).catch(e => client.log('error', e))

    interaction.editReply(`J'ai modifié ${changed} rôles. ${unchanged ? `Je n'ai pas pu changer ${unchanged} rôles` : ``}`).catch(e => client.log('error', e))
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'role',
    description: 'Modifie une permission pour tous les rôles',
    options: [
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
                    name: "Autoriser (allow)",
                    value: "allow"
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.String,
            name: "permissions",
            description: "Les permissions à définir",
            required: true,
            autocomplete: true,
        }
    ]
}