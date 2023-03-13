const Discord = require("discord.js")
const path = require("path")
const fs = require("fs")
const promises = require("fs/promises")
const createMaster = require("./create")
const loadMaster = require("./load")
const utilMaster = require("./util")
let backups = `${__dirname}/backup`
if (!(fs.existsSync)(backups)) {
    (fs.mkdirSync)(backups);
}

/**
 * Checks if a backup exists and returns its data
 */
const getBackupData = async (backupID) => {
    return new Promise(async (resolve, reject) => {
        const files = await (promises.readdir)(backups); // Read "backups" directory
        // Try to get the json file
        const file = files.filter((f) => f.split('.').pop() === 'json').find((f) => f === `${backupID}.json`);
        if (file) {
            // If the file exists
            const backupData = require(`${backups}${path.sep}${file}`);
            // Returns backup informations
            resolve(backupData);
        }
        else {
            // If no backup was found, return an error message
            reject('No backup found');
        }
    });
}

/**
 * Fetches a backyp and returns the information about it
 */
const fetch = (backupID) => {
    return new Promise(async (resolve, reject) => {
        getBackupData(backupID)
            .then((backupData) => {
            const size = (fs.statSync)(`${backups}${path.sep}${backupID}.json`).size; // Gets the size of the file using fs
            const backupInfos = {
                data: backupData,
                id: backupID,
                size: Number((size / 1024).toFixed(2))
            };
            // Returns backup informations
            resolve(backupInfos);
        })
            .catch(() => {
            reject('No backup found');
        });
    });
}
exports.fetch = fetch;

/**
 * Creates a new backup and saves it to the storage
 */
const create = async (guild, options = {
    backupID: null,
    maxMessagesPerChannel: 10,
    jsonBeautify: true,
    doNotBackup: [],
    saveImages: 'base64',
    backupMembers: false
}) => {
    return new Promise(async (resolve, reject) => {
        const intents = new Discord.IntentsBitField(guild.client.options.intents)
        if (!intents.has(Discord.IntentsBitField.Flags.Guilds)) {
            return reject('Guilds intent is required');
        }
        try {
            const backupData = {
                name: guild.name,
                verificationLevel: guild.verificationLevel,
                explicitContentFilter: guild.explicitContentFilter,
                defaultMessageNotifications: guild.defaultMessageNotifications,
                afk: guild.afkChannel ? { name: guild.afkChannel.name, timeout: guild.afkTimeout } : null,
                widget: {
                    enabled: guild.widgetEnabled,
                    channel: guild.widgetChannel ? guild.widgetChannel.name : null
                },
                channels: { categories: [], others: [] },
                roles: [],
                emojis: [],
                bans: [],
                members: [],
                createdTimestamp: Date.now(),
                guildId: guild.id,
                id: options.backupID ?? Discord.SnowflakeUtil.generate().toString()
            }
            if (guild.iconURL()) {
                if (options && options.saveImages && options.saveImages === 'base64') {
                    backupData.iconBase64 = await fetch(guild.iconURL()).then((res) => res.buffer()).then((buffer) => buffer.toString('base64'));
                }
                backupData.iconURL = guild.iconURL();
            }
            if (guild.splashURL()) {
                if (options && options.saveImages && options.saveImages === 'base64') {
                    backupData.splashBase64 = await fetch(guild.splashURL()).then((res) => res.buffer()).then((buffer) => buffer.toString('base64'));
                }
                backupData.splashURL = guild.splashURL();
            }
            if (guild.bannerURL()) {
                if (options && options.saveImages && options.saveImages === 'base64') {
                    backupData.bannerBase64 = await fetch(guild.bannerURL()).then((res) => res.buffer()).then((buffer) => buffer.toString('base64'));
                }
                backupData.bannerURL = guild.bannerURL();
            }
            if (options && options.backupMembers) {
                // Backup members
                backupData.members = await createMaster.getMembers(guild);
            }
            if (!options || !(options.doNotBackup ?? []).includes('bans')) {
                // Backup bans
                backupData.bans = await createMaster.getBans(guild);
            }
            if (!options || !(options.doNotBackup ?? []).includes('roles')) {
                // Backup roles
                backupData.roles = await createMaster.getRoles(guild);
            }
            if (!options || !(options.doNotBackup ?? []).includes('emojis')) {
                // Backup emojis
                backupData.emojis = await createMaster.getEmojis(guild);
            }
            if (!options || !(options.doNotBackup ?? []).includes('channels')) {
                // Backup channels
                const channels = await createMaster.getChannels(guild, options);
            }
            if (!options || options.jsonSave === undefined || options.jsonSave) {
                // Convert Object to JSON
                const backupJSON = options.jsonBeautify
                    ? JSON.stringify(backupData, null, 4)
                    : JSON.stringify(backupData);
                // Save the backup
                await (promises.writeFile)(`${backups}${path.sep}${backupData.id}.json`, backupJSON, 'utf-8');
            }
            // Returns ID
            resolve(backupData);
        }
        catch (e) {
            reject(e);
        }
    })
}
exports.create = create;

/**
 * Loads a backup and returns the guild
 */
const load = async (backup, guild, options = {
    clearGuildBeforeRestore: true,
    maxMessagesPerChannel: 10
}) => {
    return new Promise(async (resolve, reject) => {
        if (!guild) {
            return reject('Invalid guild');
        }
        try {
            const backupData = typeof backup === 'string' ? await getBackupData(backup) : backup;
            try {
                if (options.clearGuildBeforeRestore === undefined || options.clearGuildBeforeRestore) {
                    // Clear guild
                    await utilMaster.clearGuild(guild);
                }
                await Promise.all([
                    // Restore guild configuration
                    loadMaster.loadConfig(guild, backupData),
                    // Restore guild roles
                    loadMaster.loadRoles(guild, backupData),
                    // Restore guild channels
                    loadMaster.loadChannels(guild, backupData, options),
                    // Restore afk channel and timeout
                    loadMaster.loadAfk(guild, backupData),
                    // Restore guild emojis
                    loadMaster.loadEmojis(guild, backupData),
                    // Restore guild bans
                    loadMaster.loadBans(guild, backupData),
                    // Restore embed channel
                    loadMaster.loadEmbedChannel(guild, backupData),
                ])
            }
            catch (e) {
                reject(e);
            }
            // Then return the backup data
            return resolve(backupData);
        }
        catch (e) {
            return reject("No backup found");
        }
    })
};
exports.load = load;

/**
 * Removes a backup
 */
const remove = async (backupID) => {
    return new Promise(async (resolve, reject) => {
        try {
            require(`${backups}${path.sep}${backupID}.json`)
            await (promises.unlink)(`${backups}${path.sep}${backupID}.json`);
            resolve();
        }
        catch (e) {
            reject(e);
        }
    })
}
exports.remove = remove;

/**
 * Returns the list of all backups
 */
const list = async () => {
    const files = await (promises.readdir)(backups);
    return files.map(f => f.split('.')[0]);
}
exports.list = list;

/**
 * Change the storage path
 */
const setStorageFolder = (newPath) => {
    if (newPath.endsWith(path.sep)) {
        newPath = newPath.slice(0, -1);
    }
    backups = newPath;
    if (!fs.existsSync(backups)) {
        fs.mkdirSync(backups);
    }
};
exports.setStorageFolder = setStorageFolder;

exports.default = {
    create: exports.create,
    fetch: exports.fetch,
    list: exports.list,
    load: exports.load,
    remove: exports.remove,
};