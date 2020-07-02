import { Guild, GuildMember, MessageEmbed, Role, TextChannel } from 'discord.js';

import { GuildData } from '../models/database/guild-models';
import { ActionUtils, BdayUtils, FormatUtils, PermissionUtils } from '../utils';
import { CustomMessageRepo, UserRepo } from './database/repos';

let Config = require('../../config/config.json');

export class BirthdayService {
    constructor(private userRepo: UserRepo, private customMessageRepo: CustomMessageRepo) {}

    public async celebrateBirthdays(guild: Guild, guildData: GuildData): Promise<void> {
        let birthdayChannel: TextChannel;
        let birthdayRole: Role;
        let trustedRole: Role;

        try {
            birthdayChannel = guild.channels.resolve(
                guildData.BirthdayChannelDiscordId
            ) as TextChannel;
        } catch (error) {
            // No Birthday Channel
        }
        try {
            birthdayRole = guild.roles.resolve(guildData.BirthdayRoleDiscordId);
        } catch (error) {
            // No Birthday Channel
        }
        try {
            trustedRole = guild.roles.resolve(guildData.TrustedRoleDiscordId);
        } catch (error) {
            // No Birthday Channel
        }

        if (!guild.me.hasPermission('MANAGE_ROLES')) birthdayRole = null; // If I can't edit roles the birthday Role is essentially null since I can't give the role
        if (birthdayChannel && !PermissionUtils.canSend(birthdayChannel)) birthdayChannel = null; // If I can't message in the birthday channel it is essentially null since I can't send the birthday message

        if (!birthdayRole && !birthdayChannel) {
            // Skip guild
            return;
        }

        let preventMessage = guildData.TrustedPreventsMessage;
        let preventRole = guildData.TrustedPreventsRole;

        let userData = await this.userRepo.getAllUsers(guild.members.cache.keyArray());

        if (!userData) return;

        let birthdayUsers: GuildMember[] = [];

        for (let user of userData) {
            let member: GuildMember;
            try {
                member = guild.members.resolve(user.UserDiscordId);
            } catch (error) {
                // Can't find member?
                continue;
            }

            if (
                trustedRole &&
                preventMessage &&
                preventRole &&
                !member.roles.cache.has(trustedRole.id)
            ) {
                continue;
            }

            if (
                birthdayRole &&
                BdayUtils.isTimeForBirthdayRole(user) &&
                !(trustedRole && preventRole && !member.roles.cache.has(trustedRole.id))
            ) {
                ActionUtils.giveRole(member, birthdayRole);
            }

            if (
                birthdayChannel &&
                BdayUtils.isTimeForBirthdayMessage(guildData.MessageTime, user) &&
                !(trustedRole && preventMessage && !member.roles.cache.has(trustedRole.id))
            ) {
                birthdayUsers.push(member);
            }

            if (
                birthdayRole &&
                member.roles.cache.has(birthdayRole.id) &&
                BdayUtils.isntBirthday(user)
            ) {
                ActionUtils.removeRole(member, birthdayRole);
            }
        }

        // Birthday Message
        if (birthdayUsers.length > 0) {
            let userList = FormatUtils.joinWithAnd(birthdayUsers.map(user => user.toString()));
            let message = BdayUtils.randomMessage(
                await this.customMessageRepo.getCustomMessages(guild.id)
            ).replace('@Users', userList);

            // Find mentioned role
            let mentionSetting: string;
            let roleInput: Role = guild.roles.resolve(guildData.MentionSetting);

            if (!roleInput || roleInput.guild.id !== guild.id) {
                if (
                    guildData.MentionSetting.toLowerCase() === 'everyone' ||
                    guildData.MentionSetting.toLowerCase() === 'here'
                ) {
                    mentionSetting = '@' + guildData.MentionSetting;
                }
            } else {
                mentionSetting = roleInput.toString();
            }

            if (mentionSetting) birthdayChannel.send(mentionSetting);
            let embed = new MessageEmbed().setDescription(message).setColor(Config.colors.default);
            await birthdayChannel.send(guildData.UseEmbed ? embed : message);
        }
    }
}