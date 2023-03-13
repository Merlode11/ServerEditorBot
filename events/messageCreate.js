const { EmbedBuilder, Colors, PermissionsBitField} = require("discord.js")

module.exports = (client, message) => {
    // Ignorer les messages du bot
    if (message.author.bot) return;

    // Renvoyer un message d'erreur si l'ancien préfixe ("cs:") est utilisé
    if (message.content.startsWith("cs:")) return message.channel.send("⚠ Le préfixe du bot **a été changé**, utilisez **__`se:`__** à la place de `cs:`")
    // Ignorer les messages n'ayant pas le préfixe
    if (message.content.indexOf(client.config.prefix) !== 0) return;

    // Définir args et les commandes
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // chercher la commande
    const cmd = client.commands.get(command);

    // Si la commande n'existe pas, abandonner
    if (!cmd) return;

    if (cmd.help.name === 'help') {
      message.channel.sendTyping().then(() => {})
      const timeCommandRun = Date.now()
      return cmd.runText(client, message, args).then(() => {
          const timeCommandEnd = Date.now()
          client.log('action', `**${message.author.tag}** (${message.author.id}) has \`${cmd.help.name}\` commande made on ${message.guild.name} (${message.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\`\n${message.content}`)
      }).catch(e => {
          client.log("error", e)
          message.reply({embeds: [new EmbedBuilder().setTitle("Une erreur est apparue").setDescription(e).setColor(Colors.Red)]})
      })
    }

    if (cmd.help.name === 'createserv' && client.config.allowedUsers.includes(message.member.id) && message.channel.parentId === '701783320849285120') {
      message.channel.sendTyping().then(() => {})
      const timeCommandRun = Date.now()
      return cmd.runText(client, message, args).then(() => {
          const timeCommandEnd = Date.now()
          client.log('action', `**${message.author.tag}** (${message.author.id}) has \`${cmd.help.name}\` commande made on ${message.guild.name} (${message.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\`\n${message.content}`)
      }).catch(e => {
          client.log("error", e)
          message.reply({embeds: [new EmbedBuilder().setTitle("Une erreur est apparue").setDescription(e).setColor(Colors.Red)]})
      })
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== client.config.owner) return message.reply("Vous devez être administrateur pour faire cette commande").catch(e => client.log("error",e));

    if (!client.config.allowedUsers.includes(message.member.id)) return message.reply("Vous devez être vérifié pour faire cette commande").catch(e => client.log("error",e));

    message.channel.sendTyping().then(() => {})
    const timeCommandRun = Date.now()
    cmd.runText(client, message, args).then(() => {
        const timeCommandEnd = Date.now()
        client.log('action', `**${message.author.tag}** (${message.author.id}) has \`${cmd.help.name}\` commande made on ${message.guild.name} (${message.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\`\n${message.content}`)
    }).catch(e => {
        client.log("error", e)
        message.reply({embeds: [new EmbedBuilder().setTitle("Une erreur est apparue").setDescription(e).setColor(Colors.Red)]}).catch(e => client.log("error",e))
    })
};