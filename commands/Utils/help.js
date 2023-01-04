const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

const { readdirSync } = require("fs");
const categoryList = readdirSync('./commands');

async function allCommands(client, author) {
    let slashCommands = await client.application.commands.fetch()
    const embed = new EmbedBuilder()
        .setColor("#67b0d1")
        .setTitle("Menu d'aide des commandes")
        .setDescription(`Voici une liste de toutes les catégories disponibles et leurs commandes.\n Pour avoir plus d'information sur une d'entre elle, tapez \`${client.config.prefix}help\`\n` +
            `[Pour m'ajouter](https://discord.com/oauth2/authorize?client_id=632964288503480340&scope=bot&permissions=8)`)
        .setFooter({
            text: `Demandé par ${author.tag}`,
            iconURL: author.displayAvatarURL()
        })
        .setTimestamp()

    for (const category of categoryList){
        embed.addFields([{
            name: `${category}`,
            value: `${client.commands.filter(cat => cat.help.categorie === category.toLowerCase()).map(cmd => {
                let slash = slashCommands.find(c => c.name === cmd.help.name)
                return "`" + cmd.help.name + "`" + (slash ? ` (</${slash.name}:${slash.id}>)` : "")
            }).join(', ')}`
        }]);
    }
    return embed
}

async function commandInfo(client, command, author) {
    const slash = await client.application.commands.cache.find(c => c.name === command.help.name)

    let usage = command.help.options.map(option => {
        if (option.options) {
            let string = option.options.map(op => {
                if (option.required) return `<${op.name}>`
                else return `[${op.name}]`
            }).join(" ")
            return option.name+" " + string + (slash ? " (</"+slash.name+" "+option.name+":"+slash.id+">)" : " ") + "\n"+client.config.prefix+command.help.name
        }
        if (option.required) return `<${option.name}>`
        else return `[${option.name}]`
    }).join(" ").replace(new RegExp(client.config.prefix+command.help.name+"$"), "")

    const embed = new EmbedBuilder()
        .setColor("#67b0d1")
        .setTitle(`${command.help.name} ${slash ? ` - </${slash.name}:${slash.id}>` : ""}`)
        .setDescription(command.help.description)
        .addFields([{
            name: "Utilisation",
            value: command.help.options.length ? `${client.config.prefix}${command.help.name} ${usage}` : `${client.config.prefix}${command.help.name}`,
            inline: true
        }])
        .setFooter({
            text: `Demandé par ${author.tag}`,
            iconURL: author.displayAvatarURL()
        })
    return embed
}

module.exports.runText = async (client, message, args, settings) => {
    if (!args.length) {

        return message.channel.send({
            embeds: [await allCommands(client, message.author)]
        })
    } else {
        const command = client.commands.get(args[0])

        if (!command) return message.reply(`La commande que vous avez spécifié n'existe pas`)


        return message.channel.send({
            embeds: [await commandInfo(client, command, message.author)]
        })
    }
};

module.exports.runSlash = async (client, interaction, options) => {
    const command = options.getString("command")
    if (command) {
        const cmd = client.commands.get(command)
        if (!cmd) return interaction.editReply(`La commande que vous avez spécifié n'existe pas`)
        return interaction.editReply({
            embeds: [await commandInfo(client, cmd, interaction.user)]
        })
    } else {
        return interaction.editReply({
            embeds: [await allCommands(client, interaction.user)]
        })
    }
}

module.exports.help = {
  name: scriptName.replace(".js", ""),
  categorie: 'utils',
  description: "Obient la page d'aides des commandes",
    options: [
        {
            name: "command",
            type: ApplicationCommandOptionType.String,
            description: "La commande dont vous souhaitez obtenir l'aide",
            required: false
        }
    ]
}
