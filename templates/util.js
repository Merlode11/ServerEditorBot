const Discord = require("discord.js");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));;
const MaxBitRatePerTier = {
    [Discord.GuildPremiumTier.None]: 64000,
    [Discord.GuildPremiumTier.Tier1]: 128000,
    [Discord.GuildPremiumTier.Tier2]: 256000,
    [Discord.GuildPremiumTier.Tier3]: 384000
}
const ChannelDecoratorsReplacement = {
    "『": "$",
    "』": "%",
    "「": "$",
    "」": "%",
    "【": "$",
    "】": "%",
    "〔": "$",
    "〕": "%",
    "《": "$",
    "》": "%",
    "〈": "$",
    "〉": "%",
    "⦅": "$",
    "⦆": "%",
    "•": "%",
    "・": "%",
    "┃": "%",
    "（": "$",
    "）": "%",
    "〖": "$",
    "〗": "%",
    "〡": "%",
    "〃": "%",
    "┆": "%",
}

/**
 * Gets the permissions for a channel
 */
function fetchChannelPermissions(channel) {
    const permissions = [];
    channel.permissionOverwrites.cache
        .filter(p => p.type === Discord.OverwriteType.Role)
        .forEach(perm => {
            // For each overwrites permission
            const role = channel.guild.roles.cache.get(perm.id);
            if (role) {
                permissions.push({
                    id: role.id,
                    allow: perm.allow.bitfield.toString(),
                    deny: perm.deny.bitfield.toString()
                });
            }
        })
    return permissions;
}
exports.fetchChannelPermissions = fetchChannelPermissions;

/**
 * Fetches the voice channel data that is necessary for the backup
 */
async function fetchVoiceChannelData(channel, options) {
    return new Promise(async (resolve) => {
        let name = channel.name;
        if (options.saveAsTemplate) {
            name = changeChannelName(name);
        }
        const channelData = {
            type: Discord.ChannelType.GuildVoice,
            name,
            position: channel.position,
            bitrate: channel.bitrate,
            userLimit: channel.userLimit,
            parent: channel.parent ? channel.parent.name : null,
            rateLimitPerUser: channel.rateLimitPerUser,
            permissions: fetchChannelPermissions(channel)
        }
        /* Return the channel data */
        resolve(channelData);
    });
}
exports.fetchVoiceChannelData = fetchVoiceChannelData;

/**
 * Edit the name of the channel in accordance of the template
 */
function changeChannelName(name) {
    let baseName = name
    Object.keys(ChannelDecoratorsReplacement).forEach((key) => {
        name = name.replace(key, ChannelDecoratorsReplacement[key]);
        if (baseName.includes(key) && ChannelDecoratorsReplacement[key] === "%" && name.includes("$")) {
            return;
        }
    });
    if (!name.startsWith("$")) name = "$"+name
    return name
}
exports.changeChannelName = changeChannelName

async function fetchChannelMessages(channel, options) {
    let messages = [];
    const messageCount = isNaN(options.maxMessagesPerChannel) ? 10 : options.maxMessagesPerChannel;
    const fetchOptions = { limit: 100 };
    let lastMessageId;
    let fetchComplete = false;
    while (!fetchComplete) {
        if (lastMessageId) fetchOptions.before = lastMessageId;
        const fetched = await channel.messages.fetch(fetchOptions);
        if (fetched.size === 0) break;
        lastMessageId = fetched.last().id;
        await Promise.all(fetched.map(async (msg) => {
            if (!msg.author || messages.length >= messageCount) {
                fetchComplete = true;
                return;
            }
            const files = await Promise.all(msg.attachments.map(async (a) => {
                let attach = a.url;
                if (a.url && ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi'].includes(a.url)) {
                    if (options.saveImages && options.saveImages === 'base64') {
                        attach = await fetch(a.url).then(res => res.buffer()).then(buffer => buffer.toString('base64'));
                    }
                }
                return {
                    name: a.name,
                    attachment: attach
                };
            }));
            messages.push({
                username: msg.author.username,
                avatar: msg.author.displayAvatarURL(),
                content: msg.cleanContent,
                files,
                pinned: msg.pinned,
                sendAt: msg.createdAt.toISOString(),
            })
        }));
    }
    return messages;
}
exports.fetchChannelMessages = fetchChannelMessages;

/**
 * Fetches the text channel data that is necessary for the backup
 */
async function fetchTextChannelData(channel, options) {
    return new Promise(async (resolve) => {
        let name = channel.name;
        if (options.saveAsTemplate) {
            name = changeChannelName(name);
        }
        const channelData = {
            type: channel.type,
            name,
            position: channel.position,
            topic: channel.topic,
            nsfw: channel.nsfw,
            parent: channel.parent ? channel.parent.name : null,
            rateLimitPerUser: channel.rateLimitPerUser,
            permissions: fetchChannelPermissions(channel),
            messages: [],
            isNews: channel.type === Discord.ChannelType.GuildNews,
            threads: []
        }
        /* Fetch channel threads */
        if (channel.threads.cache.size > 0) {
            await Promise.all(channel.threads.cache.map(async (thread) => {
                const threadData = {
                    name: thread.name,
                    type: thread.type,
                    archived: thread.archived,
                    autoArchiveDuration: thread.autoArchiveDuration,
                    locked: thread.locked,
                    rateLimitPerUser: thread.rateLimitPerUser,
                    messages: []
                }
                try {
                    threadData.messages = await fetchChannelMessages(thread, options);
                }
                catch {}

                channelData.threads.push(threadData);
            }));
        }
        /* Fetch channel messages */
        try {
            channelData.messages = await fetchChannelMessages(channel, options);
        }
        catch {}
        /* Return the channel data */
        resolve(channelData);
    });
}
exports.fetchTextChannelData = fetchTextChannelData;

/**
 * Creates a category for the guild
 */
async function loadCategory(guild, categoryData, options) {
    return new Promise(async (resolve) => {
        let name = categoryData.name;
        if (options.decorations) {
            name = name.replace(/\$/g, options.decorations.before ?? "")
                .replace(/%/g, options.decorations.after ?? "");
        } else {
            name = name.replace(/\$/g, "")
                .replace(/%/g, "");
        }
        guild.channels.create({
            name,
            type: Discord.ChannelType.GuildCategory,
        }).then(async (category) => {
            // When the category is created
            const finalPermissions = [];
            categoryData.permissions.forEach((perm) => {
                const role = guild.roles.cache.find((r) => r.name === perm.roleName);
                if (role) {
                    finalPermissions.push({
                        id: role.id,
                        allow: BigInt(perm.allow),
                        deny: BigInt(perm.deny),
                    });
                }
            });
            await category.permissionOverwrites.set(finalPermissions);
            resolve(category);
        })
    });
}
exports.loadCategory = loadCategory;

/**
 * Creates a channel and returns it
 */
async function loadChannel(channelData, guild, category, options) {
    return new Promise(async (resolve) => {
        const loadMessages = (channel, messages, previousWebhook = null) => {
            return new Promise(async (resolve) => {
                const webhook = previousWebhook ?? await channel.createWebhook({
                    name: 'MessagesBackup',
                    avatar: channel.client.user.displayAvatarURL()
                }).catch(() => { });
                if (!webhook)  return resolve();
                messages = messages
                    .filter(m => m.content.length > 0 || m.files.length > 0 || m.embeds.length > 0)
                    .reverse();
                messages = messages.slice(messages.length - options.maxMessagesPerChannel);
                for (const msg of messages) {
                    const sentMsg = await webhook.send({
                        content: msg.content.length ? msg.content : undefined,
                        username: msg.username,
                        avatarURL: msg.avatar,
                        embeds: msg.embeds,
                        files: msg.files.map(f => new Discord.AttachmentBuilder(f.attachment, { name: f.name })),
                        allowedMentions: options.allowedMentions,
                        threadId: channel.isThread() ? channel.id : undefined
                    }).catch(err => console.error(err));
                    if (msg.pinned && sentMsg) await sentMsg.pin();
                }
                resolve(webhook);
            });
        }
        const createOtions = {
            name: channelData.name,
            type: null,
            parent: category
        };
        if (options.decorations) {
            createOtions.name = createOtions.name.replace(/\$/g, options.decorations.before ?? "")
                .replace(/%/g, options.decorations.after ?? "");
        } else {
            createOtions.name = createOtions.name.replace(/\$/g, "")
                .replace(/%/g, "");
        }

        if (channelData.type === Discord.ChannelType.GuildText || channelData.type === Discord.ChannelType.GuildNews) {
            createOtions.topic = channelData.topic;
            createOtions.nsfw = channelData.nsfw;
            createOtions.rateLimitPerUser = channelData.rateLimitPerUser;
            createOtions.type = channelData.isNews && guild.features.includes('NEWS')
                ? Discord.ChannelType.GuildNews : Discord.ChannelType.GuildText;
        } else if (channelData.type === Discord.ChannelType.GuildVoice) {
            // Downgrade bitrate
            let bitrate = channelData.bitrate;
            const bitrates = {
                0: 8000,
                1: 16000,
                2: 64000,
                3: 128000,
                4: 256000,
            };
            while (bitrate > MaxBitRatePerTier[guild.premiumTier]) {
                bitrate = bitrates[guild.premiumTier];
            }
            createOtions.bitrate = bitrate;
            createOtions.userLimit = channelData.userLimit;
            createOtions.type = Discord.ChannelType.GuildVoice;
            createOtions.rateLimitPerUser = channelData.rateLimitPerUser;
            createOtions.rtcRegion = channelData.rtcRegion;
        }
        guild.channels.create(createOtions).then(async (channel) => {
            /* Update channel permissions */
            const finalPermissions = [];
            channelData.permissions.forEach((perm) => {
                const role = guild.roles.cache.find((r) => r.name === perm.roleName);
                if (role) {
                    finalPermissions.push({
                        id: role.id,
                        allow: BigInt(perm.allow),
                        deny: BigInt(perm.deny),
                    });
                }
            });
            await channel.permissionOverwrites.set(finalPermissions);
            if (channelData.type === Discord.ChannelType.GuildText || channelData.type === Discord.ChannelType.GuildVoice) {
                /* Load messages */
                let webhook;
                if (channelData.messages?.length > 0) {
                    webhook = await loadMessages(channel, channelData.messages).catch(() => { });
                }
                /* Load threads */
                if (channelData.threads?.length > 0 && channel.isText()) {
                    await Promise.all(channelData.threads.map(async (threadData) => {
                        return channel.threads.create({
                            name: threadData.name,
                            autoArchiveDuration: threadData.autoArchiveDuration,
                        }).then(async (thread) => {
                            if (!webhook) return;
                            return loadMessages(thread, threadData.messages, webhook);
                        });
                    }));
                }
                return resolve(channel)
            }
            else {
                resolve(channel); // Return the channel
            }
        });
    });
}
exports.loadChannel = loadChannel;

/**
 * Delete all roles, all channels, all emojis, etc of a guild
 */
async function clearGuild(guild) {
    guild.roles.cache
        .filter(role => role.managed && role.editable && role.id !== guild.id)
        .forEach(role => role.delete().catch(() => { }));

    guild.channels.cache.forEach(channel => {
        if (channel.deletable) channel.delete().catch(() => { });
    })

    guild.emojis.cache.forEach(emoji => {
        emoji.delete().catch(() => { });
    })
    const webhooks = await guild.fetchWebhooks();
    webhooks.forEach(webhook => {
        webhook.delete().catch(() => { });
    });
    const bans = await guild.bans.fetch();
    bans.forEach(ban => {
        guild.members.unban(ban.user).catch(() => { });
    })
    guild.setAFKChannel(null);
    guild.setAFKTimeout(60 * 5);
    guild.setIcon(null);
    guild.setBanner(null).catch(() => { });
    guild.setSplash(null).catch(() => { });
    guild.setDefaultMessageNotifications(Discord.GuildDefaultMessageNotifications.OnlyMentions);
    guild.setWidgetSettings({
        enabled: false,
        channel: null
    });
    if (!guild.features.includes(Discord.GuildFeature.Community)) {
        guild.setExplicitContentFilter(Discord.GuildExplicitContentFilter.Disabled);
        guild.setVerificationLevel(Discord.GuildVerificationLevel.None);
    }
    guild.setSystemChannel(null);
    guild.setSystemChannelFlags(
        Discord.GuildSystemChannelFlags.SuppressGuildReminderNotifications,
        Discord.GuildSystemChannelFlags.SuppressJoinNotifications,
        Discord.GuildSystemChannelFlags.SuppressPremiumSubscriptions
    );
    return;
}
exports.clearGuild = clearGuild;

/**
 * Runs a function for each element in an array asynchronously
 * @param {Array} array The array to iterate over
 * @param {Function} callback The function to run for each element
 * @returns {Promise<void>}
 */
async function asyncForEach(array, callback) {
    for (let index = 0, len = array.length; index < len; index++) {
        await callback(array[index], index, array);
    }
}
exports.asyncForEach = asyncForEach;