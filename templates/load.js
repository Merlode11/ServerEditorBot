const Discord = require('discord.js');
const util = require('./util');

/**
 * Restores the guild configuration
 */
const loadConfig = (guild, backupData) => {
    const configPromises = [];
    if (backupData.name) {
        configPromises.push(guild.setName(backupData.name));
    }
    if (backupData.iconBase64) {
        configPromises.push(guild.setIcon(Buffer.from(backupData.iconBase64, 'base64')));
    }
    else if (backupData.iconURL) {
        configPromises.push(guild.setIcon(backupData.iconURL));
    }
    if (backupData.splashBase64) {
        configPromises.push(guild.setSplash(Buffer.from(backupData.splashBase64, 'base64')));
    }
    else if (backupData.splashURL) {
        configPromises.push(guild.setSplash(backupData.splashURL));
    }
    if (backupData.bannerBase64) {
        configPromises.push(guild.setBanner(Buffer.from(backupData.bannerBase64, 'base64')));
    }
    else if (backupData.bannerURL) {
        configPromises.push(guild.setBanner(backupData.bannerURL));
    }
    if (backupData.verificationLevel) {
        configPromises.push(guild.setVerificationLevel(backupData.verificationLevel));
    }
    if (backupData.defaultMessageNotifications) {
        configPromises.push(guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications));
    }
    const changeableExplicitLevel = guild.features.includes(Discord.GuildFeature.Community);
    if (backupData.explicitContentFilter && changeableExplicitLevel) {
        configPromises.push(guild.setExplicitContentFilter(backupData.explicitContentFilter));
    }
    return Promise.all(configPromises);
}
exports.loadConfig = loadConfig;

/**
 * Restore the guild roles
 */
const loadRoles = (guild, backupData) => {
    const rolePromises = [];
    backupData.roles.forEach((roleData) => {
        if (roleData.isEveryone) {
            rolePromises.push(guild.roles.cache.get(guild.id).edit({
                name: roleData.name,
                color: roleData.color,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            }));
        }
        else {
            const role = {
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            }
            if (roleData.iconBase64) {
                role.icon = Buffer.from(roleData.iconBase64, 'base64');
            }
            else if (roleData.iconUrl) {
                role.icon = roleData.iconUrl;
            }
            else if (roleData.unicodeEmoji) {
                role.unicodeEmoji = roleData.unicodeEmoji;
            }
            rolePromises.push(guild.roles.create(role));
        }
    });
    return Promise.all(rolePromises);
}
exports.loadRoles = loadRoles;

/**
 * Restore the guild channels
 */
const loadChannels = (guild, backupData, options) => {
    const loadChannelPromises = [];
    backupData.channels.categories.forEach((categoryData) => {
        loadChannelPromises.push(new Promise((resolve, reject) => {
            util.loadCategory(guild, categoryData, options).then((category) => {
                categoryData.children.forEach((channelData) => {
                    loadChannelPromises.push(util.loadChannel(channelData, guild, category, options));
                });
            });
        }));
    });
    backupData.channels.others.forEach((channelData) => {
        loadChannelPromises.push(util.loadChannel(channelData, guild, null, options));
    })
    return Promise.all(loadChannelPromises);
}
exports.loadChannels = loadChannels;

/**
 * Restore the afk configuration
 */
const loadAfk = (guild, backupData) => {
    const afkPromises = [];
    if (backupData.afk) {
        afkPromises.push(guild.setAFKChannel(guild.channels.cache.find(ch => ch.name === backupData.afk.name && ch.type === Discord.ChannelType.GuildVoice)));
        afkPromises.push(guild.setAFKTimeout(backupData.afk.timeout));
    }
    return Promise.all(afkPromises);
}
exports.loadAfk = loadAfk;

/**
 * Restore the guild emojis
 */
const loadEmojis = (guild, backupData) => {
    const emojiPromises = [];
    backupData.emojis.forEach((emoji) => {
        if (emoji.url) {
            emojiPromises.push(guild.emojis.create({
                name: emoji.name,
                attachment: emoji.url
            }));
        }
        else if (emoji.base64) {
            emojiPromises.push(guild.emojis.create({
                name: emoji.name,
                image: Buffer.from(emoji.base64, 'base64')
            }));
        }
    });
    return Promise.all(emojiPromises);
}
exports.loadEmojis = loadEmojis;

/**
 * Restore the guild bans
 */
const loadBans = (guild, backupData) => {
    const banPromises = [];
    backupData.bans.forEach((ban) => {
        banPromises.push(guild.members.ban(ban.id, {reason: ban.reason}));
    });
    return Promise.all(banPromises);
}
exports.loadBans = loadBans;

/**
 * Restore the embedChannel configuration
 */
const loadEmbedChannel = (guild, backupData) => {
    const embedChannelPromises = [];
    if (backupData.widget.channel) {
        embedChannelPromises.push(guild.setWidgetSettings({
            enabled: backupData.widget.enabled,
            channel: guild.channels.cache.find((ch) => ch.name === backupData.widget.channel)
        }));
    }
    return Promise.all(embedChannelPromises);
}
exports.loadEmbedChannel = loadEmbedChannel;