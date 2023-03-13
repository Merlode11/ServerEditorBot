const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({
    intents: Object.keys(Discord.IntentsBitField.Flags).map(key => Discord.IntentsBitField.Flags[key])
});

const config = require("./config.json");
client.config = config;


client.log = async function (type, message) {
    const hook = new Discord.WebhookClient(client.config.logWebhook);
    if (!client.user) {
        client.user = {}
        client.user.tag = "Unkown Bot"
        client.user.id = ""
        client.user.displayAvatarURL = function () {
            return "https://i.imgur.com/jNz2Dwp.png"
        }
    }
    let embed = new Discord.EmbedBuilder()
        .setAuthor({name: `${client.user.tag} (${client.user.id})`, iconURL: client.user.displayAvatarURL()})

    let logLineDetails = ((new Error().stack).split("at ")[2]).trim();

    switch (type) {
        case 'error' : {
            embed.setTitle(`An error happend`)
                .setColor('#ff0000')
                .setDescription(message.toString())
                .addFields([{name: `File :`, value: logLineDetails}])
            console.error(message)
            break;
        }
        case 'action' : {
            embed.setColor('#00f7ff')
                .setDescription(message.toString())
                .addFields([{name: `File :`, value: logLineDetails}])
        }
    }
    await hook.send({embeds: [embed.setTimestamp()]}).catch(console.error)
}

if (!client.config.allowedUsers.includes(client.config.owner)) {
    client.config.allowedUsers.push(client.config.owner)
    fs.writeFileSync("./config.json", JSON.stringify(client.config, null, 4), "utf-8")
}

client.commands = new Discord.Collection();

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);

    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`Attempting to load event ${eventName}`);
        try {
            client.on(eventName, event.bind(null, client));
        }
        catch (e) {
            client.log("error", e);
        }
    });
});

client.login(config.token).then(() => {}).catch(e => client.log("error", e));


process.on('unhandledRejection', error => {
    client.log("error", error)
})

process.on('uncaughtException', error => {
    client.log("error", error)
})

process.on('warning', error => {
    client.log("error", error)
})

process.on('error', error => {
    client.log("error", error)
})

process.on('exit', error => {
    client.log("error", error)
})
