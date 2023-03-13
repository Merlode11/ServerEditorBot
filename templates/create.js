const Discord = require('discord.js');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const util = require('./util');

/**
 * Returns an array with the banned members of the guild
 * @param {Guild} guild The Discord guild
 * @returns {Promise<BanData[]>} The banned members
 */
async function getBans(guild) {
    const bans = [];
    const cases = await guild.bans.fetch(); // Gets the list of the banned members
    cases.forEach((ban) => {
        bans.push({
            id: ban.user.id,
            reason: ban.reason // Ban reason
        });
    });
    return bans;
}
exports.getBans = getBans;

/**
 * Returns an array with the members of the guild
 * @param {Guild} guild The Discord guild
 * @returns {Promise<MemberData>}
 */
async function getMembers(guild) {
    const members = [];
    guild.members.cache.forEach((member) => {
        members.push({
            userId: member.user.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatarUrl: member.user.avatarURL(),
            joinedTimestamp: member.joinedTimestamp,
            roles: member.roles.cache.map((role) => role.id),
            bot: member.user.bot // Member bot
        });
    });
    return members;
}
exports.getMembers = getMembers;

/**
 * Returns an array with the roles of the guild
 * @param {Guild} guild The discord guild
 * @param {CreateOptions} options The backup options
 * @returns {Promise<RoleData[]>} The roles of the guild
 */
async function getRoles(guild, options) {
    const roles = [];
    const cachedRoles = guild.roles.cache
        .filter((role) => !role.managed)
        .sort((a, b) => b.position - a.position)
        util.asyncForEach([...cachedRoles.values()], async (role) => {
        const roleData = {
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            permissions: role.permissions.bitfield.toString(),
            mentionable: role.mentionable,
            position: role.position,
            unicodeEmoji: role.unicodeEmoji,
            isEveryone: role.id === guild.id
        };
        if (role.iconURL()) {
            if (options.saveImages && options.saveImages === "base64") {
                roleData.iconBase64 = await fetch(role.iconURL()).then((res) => res.buffer()).then((buffer) => buffer.toString("base64"));
            } else {
                roleData.iconUrl = role.iconURL();
            }
        }
        roles.push(roleData);
    });
    return roles;
}
exports.getRoles = getRoles;

/**
 * Returns an array with the emojis of the guild
 * @param {Guild} guild The discord guild
 * @param {CreateOptions} options The backup options
 * @returns {Promise<EmojiData[]>} The emojis of the guild
 */
async function getEmojis(guild, options) {
    const emojis = [];
    util.asyncforEach([...guild.emojis.cache.values()], async (emoji) => {
        const emojiData = {
            name: emoji.name
        };
        if (options.saveImages && options.saveImages === "base64") {
            emojiData.base64 = await fetch(emoji.url).then((res) => res.buffer()).then((buffer) => buffer.toString("base64"));
        } else {
            emojiData.url = emoji.url;
        }
        emojis.push(emojiData);
    });
    return emojis;
}
exports.getEmojis = getEmojis;

/**
 * Returns an array with the channels of the guild
 * @param {Guild} guild The discord guild
 * @param {CreateOptions} options The backup options
 * @returns {Promise<ChannelData[]>} The channels of the guild
 */
async function getChannels(guild, options) {
    return new Promise(async (resolve) => {
        const channels = {
            categories: [],
            others: []
        };
        // Gets the list of the categories and sort them by position
        const categories = guild.channels.cache
            .filter((channel) => channel.type === Discord.ChannelType.GuildCategory)
            .sort((a, b) => a.position - b.position)
            .toJSON();
        for (const category of categories) {
            const categoryData = {
                name: options.saveAsTemplate ? util.changeChannelName(category.name) : category.name,
                position: category.position,
                permissions: util.fetchChannelPermissions(category),
                children: []
            };
            // Get the children channels of the category and sort them by position
            const children = category.children.cache.sort((a, b) => a.position - b.position).toJSON();
            for (const child of children) {
                // For each child channel
                if (child.type === Discord.ChannelType.GuildText || child.type === Discord.ChannelType.GuildNews) {
                    const channelData = await util.fetchTextChannelData(child, options); // Gets the channel data
                    categoryData.children.push(channelData);
                }
                else {
                    const channelData = await util.fetchVoiceChannelData(child, options); // Gets the channel data
                    categoryData.children.push(channelData);
                }
            }
            channels.categories.push(categoryData);
        }
        // Gets the list of the channels that are not in a category and sort them by position
        const others = guild.channels.cache
            .filter((ch) => {
                return !ch.parent && ch.type !== Discord.ChannelType.GuildCategory
                && ch.type !== Discord.ChannelType.GuildNewsThread && ch.type !== Discord.ChannelType.GuildPublicThread && ch.type !== Discord.ChannelType.GuildPrivateThread; // threads will be saved with fetchTextChannelData
            })
            .sort((a, b) => a.position - b.position)
            .toJSON();
        for (const channel of others) {
            // For each channel
            if (channel.type === Discord.ChannelType.GuildText || channel.type === Discord.ChannelType.GuildNews) {
                const channelData = await util.fetchTextChannelData(channel, options); // Gets the channel data
                channels.others.push(channelData);
            }
            else {
                const channelData = await util.fetchVoiceChannelData(channel, options); // Gets the channel data
                channels.others.push(channelData);
            }
        }
        resolve(channels); // Returns the channels
    })
}
exports.getChannels = getChannels;