const scriptName = __filename.split(/[\\/]/).pop(); // Remove the last array element
const { EmbedBuilder } = require("discord.js")

module.exports.runText = async (client, message) => {
  const msg = await message.reply(`<a:colorloading:749281394504499260>Pinging`).catch(e => client.log('error', e))

  const embed = new EmbedBuilder()
      .setTitle('🏓Pong !')
      .addFields([
        {
            name: "🤖Latence du bot",
            value: `**${msg.createdTimestamp - message.createdTimestamp}**ms`,
        },
        {
            name: "📈Latence de l'API",
            value: `**${Math.round(client.ws.ping)}**ms`,
        }
      ])
      .setFooter({
        text: `Demandé par : ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
  return msg.edit({
    content: "",
    embeds: [embed]
  }).catch(e => client.log('error', e));
};

module.exports.runSlash = async (client, interaction, options) => {
    const msg = await interaction.editReply({
        content: `<a:colorloading:749281394504499260>Pinging`,
        fetchReply: true
    }).catch(e => client.log('error', e))

    const embed = new EmbedBuilder()
        .setTitle('🏓Pong !')
        .addFields([
            {
                name: "🤖Latence du bot",
                value: `**${msg.createdTimestamp - interaction.createdTimestamp}**ms`,
            },
            {
                name: "📈Latence de l'API",
                value: `**${Math.round(client.ws.ping)}**ms`,
            }
        ])
        .setFooter({
            text: `Demandé par : ${interaction.author.username}`,
            iconURL: interaction.author.displayAvatarURL()
        })
    return interaction.editReply({
        content: "",
        embeds: [embed]
    }).catch(e => client.log('error', e));
}

module.exports.help = {
  name: scriptName.replace(".js", ""),
  categorie: 'utils',
  description: 'Récupère le ping',
  options: []
}
