import { DiscordAPIError, GuildMember, Role } from 'discord.js';
import { createRequire } from 'node:module';

import { TimeUtils } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class ActionUtils {
    public static async giveRole(member: GuildMember, role: Role, delay?: number): Promise<void> {
        delay = Config.delays.enabled ? delay : 0;
        try {
            await member.roles.add(role);
            await TimeUtils.sleep(delay ?? 0);
        } catch (error) {
            // 10011: "Unknown Role" (Role was deleted)
            // 50001: "Missing Access"
            // 50013: "Missing Permission"
            if (error instanceof DiscordAPIError && [10011, 50001, 50013].includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async removeRole(member: GuildMember, role: Role, delay?: number): Promise<void> {
        delay = Config.delays.enabled ? delay : 0;
        try {
            await member.roles.remove(role);
            await TimeUtils.sleep(delay ?? 0);
        } catch (error) {
            // 10011: "Unknown Role" (Role was deleted)
            // 50001: "Missing Access"
            // 50013: "Missing Permission"
            if (error instanceof DiscordAPIError && [10011, 50001, 50013].includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }
}
