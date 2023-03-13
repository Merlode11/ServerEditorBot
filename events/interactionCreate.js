const { PermissionsBitField } = require("discord.js");
const backup = require("../templates/index");

module.exports = async (client, interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (cmd) {
                await interaction.deferReply()
                if (cmd.help.name === 'help') {
                    const timeCommandRun = Date.now()
                    return cmd.runSlash(client, interaction, interaction.options).then(() => {
                        const timeCommandEnd = Date.now()
                        client.log('action', `**${interaction.user.tag}** (${interaction.user.id}) has \`/${cmd.help.name}\` commande made on ${interaction.guild.name} (${interaction.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\``)
                    }).catch(e => client.log('error', e));
                } else if (cmd.help.name === 'createserv' && client.config.allowedUsers.includes(interaction.member.id) && interaction.channel.parentId === '701783320849285120') {
                    const timeCommandRun = Date.now()
                    return cmd.runSlash(client, interaction, interaction.options).then(() => {
                        const timeCommandEnd = Date.now()
                        client.log('action', `**${interaction.user.tag}** (${interaction.user.id}) has \`/${cmd.help.name}\` commande made on ${interaction.guild.name} (${interaction.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\``)
                    }).catch(e => client.log('error', e));
                } else if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.editReply("Vous devez être administrateur pour faire cette commande").catch(e => client.log('error', e));
                } else if (!client.config.allowedUsers.includes(interaction.member.id)) {
                    return interaction.editReply("Vous devez être vérifié pour faire cette commande").catch(e => client.log('error', e));
                } else {
                    const timeCommandRun = Date.now()
                    return cmd.runSlash(client, interaction, interaction.options).then(() => {
                        const timeCommandEnd = Date.now()
                        client.log('action', `**${interaction.user.tag}** (${interaction.user.id}) has \`/${cmd.help.name}\` commande made on ${interaction.guild.name} (${interaction.guild.id}). This command has been realised in \`${timeCommandEnd - timeCommandRun}ms\``)
                    }).catch(e => client.log('error', e));
                }
            } else {
                return interaction.editReply("Une erreur est survenue: cette commande n'existe pas").catch(e => client.log('error', e));
            }
        } else if (interaction.isAutocomplete()) {
            if (interaction.options.data.find(o => o.name === "webhook")) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.user.id !== client.config.owner) {
                    return interaction.respond([{
                        name: "Vous devez être administrateur pour faire cette commande",
                        value: "false"
                    }]).catch(e => client.log('error', e))
                }
                const webhooks = await interaction.guild.fetchWebhooks().catch((e) => {
                    client.log('error', e);
                    return interaction.respond([]).catch(e => client.log('error', e))
                });

                const value = interaction.options.data.find(o => o.name === "webhook").value;
                const results = [];
                webhooks.forEach(webhook => {
                    if (webhook.name.toLowerCase().startsWith(value.toLowerCase())) {
                        results.push({
                            name: webhook.name + " (" + webhook.id + ")",
                            value: webhook.id
                        });
                    } else if (webhook.name.toLowerCase().includes(value.toLowerCase())) {
                        results.push({
                            name: webhook.name + " (" + webhook.id + ")",
                            value: webhook.id
                        });
                    } else if (webhook.id.includes(value.toLowerCase())) {
                        results.push({
                            name: webhook.name + " (" + webhook.id + ")",
                            value: webhook.id
                        });
                    }
                })

                results.sort((a, b) => a.name.localeCompare(b.name));
                results.splice(25);

                interaction.respond(results).catch(e => client.log('error', e));
            }
            else if (interaction.options.data.find(o => o.name === "permissions")) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && interaction.member.id !== "424485502071209984") {
                    interaction.respond([{
                        name: "Vous devez être administrateur pour faire cette commande",
                        value: "false"
                    }]).catch(e => client.log('error', e))
                }

                const value = interaction.options.data.find(o => o.name === "permissions").value;
                const userPerms = value.split(/\s+|\s?;\s?|\s?-\s?|\s?,\s?/);
                const lastPerm = userPerms.pop();
                let permissions = [];
                Object.keys(PermissionsBitField.Flags).forEach(k => {
                    if (!userPerms.includes(k)){
                        const permStr = (userPerms.length ? userPerms.join("; ") + "; " : "") + k
                        if (k.toLowerCase().includes(lastPerm.toLowerCase())) {
                            permissions.push({
                                name: permStr,
                                value: permStr
                            });
                        } else if (PermissionsBitField.Flags[k] === lastPerm) {
                            permissions.push({
                                name: permStr,
                                value: permStr
                            });
                        }
                    }
                })

                permissions.splice(25)
                interaction.respond(permissions).catch(e => client.log('error', e));
            }
            else if (interaction.options.data.find(o => o.name === "server")) {
                if (interaction.user.id !== client.config.owner) return interaction.respond([{
                    name: "Vous n'avez pas la permission de faire cette action",
                    value: "false"
                }]).catch(e => client.log('error', e));
                const value = interaction.options.data.find(o => o.name === "server").value;
                let servers = [...client.guilds.cache.values()]
                if (value) servers = servers.filter(g => g.name.toLowerCase().includes(value.toLowerCase()) || g.id.toString().includes(value));
                servers = servers.map(s => {
                    return {
                        name: `${s.name} (${s.id})`,
                        value: s.id
                    }
                })
                servers.splice(25)
                interaction.respond(servers).catch(e => client.log('error', e));
            }
            else if (interaction.options.data.find(o => o.name === "template")) {
                // console.log(interaction)
                const list = await backup.list().catch(e => client.log('error', e));
                const value = interaction.options.data.find(o => o.name === "template").value;
                const templates = [];
                list.forEach(template => {
                    if (value.toLowerCase() || template.toLowerCase().includes(value.toLowerCase())) {
                        templates.push({
                            name: template,
                            value: template
                        })
                    }
                })
                templates.splice(25)
                interaction.respond(templates).catch(e => client.log('error', e));
            }
        } else if (interaction.isButton()) {
            console.log(interaction.customId)
        }
    } catch (e) {
        client.log('error', e);
    }
}
