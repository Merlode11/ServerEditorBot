const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element

const { ApplicationCommandOptionType } = require('discord.js')
const Discord = require('discord.js');

module.exports.runText = async (client, message, args) => {
    if (message.author.id !== client.config.owner) return message.reply({
        content: "Vous ne pouvez pas faire cette commande",
    });
    let code = args.join(" ");

    if (code.includes("client.token") || code.includes("client.config.token") || code.includes("client.config.TOKEN")) {
        code = code
            .replace(/client\.token/g, "'[TOKEN HIDDEN]'")
            .replace(/client\.config\.token/g, "'[TOKEN HIDDEN]'")
            .replace(/client\.config\.TOKEN/g, "'[TOKEN HIDDEN]'");
    }
    const evaled = new Promise((resolve) => resolve(eval(code)));
    evaled.then(async output => {
        if(typeof output !== "string"){
            output = require("util").inspect(output, { depth: 0 });
        }
        if (output.includes(client.token)) {
            output = output.replace(new RegExp(client.token.replace(/\./g, "\."), "g"), "[TOKEN HIDDEN]");
        }
        return message.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setAuthor({ name: message.author.tag + " Eval", iconURL: message.author.displayAvatarURL() })
                    .setColor("#67b0d1")
                    .setDescription(`\`\`\`js\n${output}\n\`\`\``)
            ]
        }).catch(e => client.log('error', e))
    }).catch(async e => {
            client.log("error", e)
            e = e.toString()
        if (e.includes(client.token)) {
            e = e.replace(new RegExp(client.token.replace(/\./g, "\."), "g"), "[TOKEN HIDDEN]");
        }
        return message.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setAuthor({ name: message.author.tag + " Eval", iconURL: message.author.displayAvatarURL() })
                    .setColor("#67b0d1")
                    .setDescription(`\`\`\`js\n${e}\n\`\`\``)
            ]
        }).catch(e => client.log('error', e))
    });
};

module.exports.runSlash = async (client, interaction, options) => {
    if (interaction.user.id !== client.config.owner) return interaction.editReply("Vous n'avez pas la permission d'utiliser cette commande").catch(e => client.log('error', e));
    function clean(text) {
        if (typeof text === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replaceAll(client.config.token, '[TOKEN HIdDEN]');
        return text;
    }

    let code = options.getString("code");
    if (code.includes("client.token") || code.includes("client.config.token") || code.includes("client.config.TOKEN")) {
        code = code
            .replace(/client\.token/g, "'[TOKEN HIDDEN]'")
            .replace(/client\.config\.token/g, "'[TOKEN HIDDEN]'")
            .replace(/client\.config\.TOKEN/g, "'[TOKEN HIDDEN]'");
    }
    const evaled = new Promise((resolve) => resolve(eval(code)));
    evaled.then(async output => {
        if(typeof output !== "string"){
            output = require("util").inspect(output, { depth: 0 });
        }
        if (output.includes(client.token)) {
            output = output.replace(new RegExp(client.token.replace(/\./g, "\."), "g"), "[TOKEN HIDDEN]");
        }
        return interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag + " Eval", iconURL: interaction.user.displayAvatarURL() })
                    .setColor("#67b0d1")
                    .setDescription(`\`\`\`js\n${await clean(output)}\n\`\`\``)
            ]
        }).catch(e => client.log('error', e))
    })
        .catch(async e => {
            client.log("error", e)
            e =e.toString()
            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: interaction.user.tag + " Eval", iconURL: interaction.user.displayAvatarURL() })
                        .setColor("#67b0d1")
                        .setDescription(`\`\`\`js\n${e}\n\`\`\``)
                ]
            }).catch(e => client.log('error', e))
        });
}


module.exports.help = {
    name: scriptName.replace(".js", ""),
    categorie: 'utils',
    description: 'Exécute le code donné *Merlode uniquement*',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "code",
            description: "Le code à exécuter",
            required: true,
        }
    ]
}