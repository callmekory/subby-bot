"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Kick users
 */
class Kick extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            category: 'Admin',
            description: 'Kick em out',
            usage: [`kick <@username>`],
            guildOnly: true,
            args: true,
            permsNeeded: ['KICK_MEMBERS']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils, db } = client;
        const { warningMessage, embed } = Utils;
        const { author, channel, guild, mentions, createdAt } = msg;
        // * ------------------ Config --------------------
        const { prefix, logChannel } = db.server;
        // * ------------------ Check Config --------------------
        // If server doesnt have a log channel set then notify
        if (!logChannel) {
            return warningMessage(msg, `It appears that you do not have a Log channel.
        Please set one with \`${prefix}server set logChannel <channelID>\``);
        }
        const serverLogChannel = guild.channels.get(logChannel);
        // * ------------------ Logic --------------------
        // If no user to kick is specifed, notify
        if (msg.mentions.members.size === 0)
            return warningMessage(msg, `Please mention a user to kick`);
        // User the first member mentioned as the member to kick
        const kickMember = mentions.members.first();
        // If user doesnt specify ban reason then notify
        if (!args[1])
            return warningMessage(msg, `Please put a reason for the kick`);
        // Kick user
        const target = await kickMember.kick(args.join(' '));
        const reason = args.slice(1).join(' ');
        // Notify in server log channel that the member was kicked and why
        return serverLogChannel.send(embed('yellow')
            .setThumbnail(target.user.avatarURL)
            .addField('Kicked Member', `**${target.user.username}** with an ID: ${target.user.id}`)
            .addField('Kicked By', `**${author.username}** with an ID: ${author.id}`)
            .addField('Kicked Time', createdAt)
            .addField('Kicked At', channel)
            .addField('Kicked Reason', reason)
            .setFooter('Kicked user information', target.user.displayAvatarURL));
    }
}
exports.default = Kick;
