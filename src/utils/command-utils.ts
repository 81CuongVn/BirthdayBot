import { CommandInteraction, GuildChannel, GuildMember, Permissions } from 'discord.js';

import { Command } from '../commands';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '.';
import { Permission } from '../models/enums';

let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');

export class CommandUtils {
    public static async runChecks(
        command: Command,
        intr: CommandInteraction,
        data: EventData
    ): Promise<boolean> {
        if (command.requireDev && !Config.developers.includes(intr.user.id)) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('validation', 'embeds.devOnlyCommand', data.lang())
            );
            return false;
        }

        if (command.requireGuild && !intr.guild) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('validation', 'embeds.serverOnlyCommand', data.lang())
            );
            return false;
        }

        if (
            intr.channel instanceof GuildChannel &&
            !intr.channel.permissionsFor(intr.client.user).has(command.requireClientPerms)
        ) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('validation', 'embeds.missingClientPerms', data.lang(), {
                    PERMISSIONS: command.requireClientPerms
                        .map(perm => `**${Permission.Data[perm].displayName(data.lang())}**`)
                        .join(', '),
                })
            );
            return false;
        }

        // TODO: Remove "as GuildMember",  why does discord.js have intr.member as a "APIInteractionGuildMember"?
        if (intr.member && !this.hasPermission(intr.member as GuildMember, command)) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('validation', 'embeds.missingUserPerms', data.lang())
            );
            return false;
        }

        return true;
    }

    private static hasPermission(member: GuildMember, command: Command): boolean {
        // Debug option to bypass permission checks
        if (Debug.skip.checkPerms) {
            return true;
        }

        // Developers, server owners, and members with "Manage Server" have permission for all commands
        if (
            member.guild.ownerId === member.id ||
            member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) ||
            Config.developers.includes(member.id)
        ) {
            return true;
        }

        // Check if member has required permissions for command
        if (!member.permissions.has(command.requireUserPerms)) {
            return false;
        }

        return true;
    }
}
