const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const fs = require("fs")
const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function add(client, user) {
    if (client.config.allowedUser.includes(user.id)) {
        return `<@${user.id}> est déjà dans la liste des utilisateurs autorisés`
    }
    client.config.allowedUser.push(user.id)
    await fs.writeFileSync("../../allowedUser.json", JSON.stringify(client.config.allowedUser, null, 4), "utf-8")
    return `<@${user.id}> a bien été **ajouté** à la liste des utilisateurs autorisés !`
}

async function remove(client, user){
    console.log(user)
    if (!client.config.allowedUser.includes(user.id)) {
        return `<@${user.id}> n'est pas dans la liste des utilisateurs autorisés`
    }
    client.config.allowedUser = client.config.allowedUser.filter(id => id !== user.id)
    await fs.writeFileSync("../../allowedUser.json", JSON.stringify(client.config.allowedUser, null, 4), "utf-8")
    console.log(fs.readFileSync("../../allowedUser.json", "utf-8"))
    console.log(client.config.allowedUser)
    delete require.cache[require.resolve("../../allowedUser.json")]
    console.log(require("../../allowedUser.json"))
    return `<@${user.id}> a bien été **retiré** de la liste des utilisateurs autorisés`
}

async function list(client) {
    let string = ""
    await asyncForEach(client.config.allowedUser, async id => {
        const user = await client.users.fetch(id).catch(e => client.log("error",e))
        if (user) string += `<@${id}> - ${user.tag} *(${id})*\n`
        else await remove(client, {id})
    })
    return {
        embeds: [
            new EmbedBuilder()
                .setTitle("Utilisateurs autorisés")
                .setColor("#67b0d1")
                .setDescription(string)
        ]
    }
}

module.exports.runText = async (client, message, args) => {
    if (message.author.id !== "424485502071209984") return message.reply({
        content: "Vous ne pouvez pas faire cette commande",
    });
    switch (args[0]) {
        case "add" || "+" || "ajouter": {
            const user = await client.users.fetch(args[1].replace("<@", "").replace(">", ""))
            if (!user) return message.reply("L'utilisateur donné n'est pas correct")
            const response = await add(client, user)
            message.reply(response).catch(e => client.log("error",e))
            break;
        }
        case "remove" || "-" || "retirer": {
            const user = await client.users.fetch(args[1].replace("<@", "").replace(">", ""))
            if (!user) return message.reply("L'utilisateur donné n'est pas correct")
            const response = await remove(client, user)
            message.reply(response).catch(e => client.log("error",e))
            break;
        }
        default: {
            message.reply(await list(client)).catch(e => client.log("error",e))
        }
    }
}

module.exports.runSlash = async (client, interaction, options) => {
    if (interaction.user.id !== "424485502071209984") return interaction.editReply("Vous n'avez pas la permission de faire cette commande")
    if (options.data.find(o => o.name === "add")) {
        const user = options.getUser("user")
        return interaction.editReply(await add(client, user)).catch(e => client.log("error",e))
    } else if (options.data.find(o => o.name === "remove")) {
        const user = options.getUser("user")
        return interaction.editReply(await remove(client, user)).catch(e => client.log("error",e))
    } else if (options.data.find(o => o.name === "list")) {
        return interaction.editReply(await list(client)).catch(e => client.log("error",e))
    }
}

module.exports.help = {
    name: scriptName.replace(".js", ""),
    description: "Modifie les utilisateurs pouvant utiliser le bot *Merlode uniquement*",
    categorie: "utils",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: "Ajouter un utilisateur à la liste",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "L'utilisateur à ajouter",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: "Retire un utilisateur de la liste",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "L'utilisateur à retirer",
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: "Voir la liste des utilisateurs autorisés",
            options: []
        }
    ]
}