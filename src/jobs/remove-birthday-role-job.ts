import { Client } from 'discord.js';
import schedule from 'node-schedule';
import { createRequire } from 'node:module';

import { GuildData } from '../models/database/guild-models.js';
import { GuildRepo } from '../services/database/repos/guild-repo.js';
import { UserRepo } from '../services/database/repos/user-repo.js';
import { Logger } from '../services/index.js';
import { ActionUtils, CelebrationUtils, TimeUtils } from '../utils/index.js';
import { Job } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class RemoveBirthdayRoleJob implements Job {
    public name = 'Remove Birthday Role';
    public schedule: string = Config.jobs.updateMemberCacheJob.schedule; // update
    public log: boolean = Config.jobs.updateMemberCacheJob.log; // update
    public interval: number = Config.jobs.updateMemberCacheJob.interval; // update

    constructor(private client: Client, private guildRepo: GuildRepo, private userRepo: UserRepo) {}

    public async run(): Promise<void> {
        // Collection of guilds
        let guildCache = this.client.guilds.cache;
        let _discordIds = guildCache.map(guild => guild.id);

        // TODO: Get all the guilds from the database
        let guildDatas: GuildData[] = [];

        for (let guildData of guildDatas) {
            try {
                if (!guildData.BirthdayRoleDiscordId) continue;
                // loop through the guilds roles
                let guild = await this.client.guilds.fetch(guildData.GuildDiscordId);

                let members = guild.members.cache;
                let userData = await this.userRepo.getAllUsers(members.map(member => member.id));

                let role = guild.roles.cache.get(guildData.BirthdayRoleDiscordId);

                if (!role) continue;

                let counter = 0;
                let calculatedMax = (guild.memberCount / 365) * 3;

                // filter out the members who don't have the birthday role
                let membersWithRole = members.filter(member => member.roles.cache.has(role.id));

                // Get the celebration data for these members
                let membersWithBirthdayTodayOrYesterday = membersWithRole.filter(member =>
                    CelebrationUtils.isBirthdayTodayOrYesterday(
                        userData.find(data => data.UserDiscordId === member.id),
                        guildData
                    )
                );

                let birthdayMemberStatuses = membersWithBirthdayTodayOrYesterday.map(m =>
                    CelebrationUtils.getBirthdayMemberStatus(
                        userData.find(data => data.UserDiscordId === m.id),
                        m,
                        guildData
                    )
                );

                // Remove the birthday role from the members
                for (let birthdayMemberStatus of birthdayMemberStatuses) {
                    if (counter >= calculatedMax) break;
                    if (birthdayMemberStatus.needsRoleRemoved) {
                        ActionUtils.removeRole(birthdayMemberStatus.member, role);
                        counter++;
                    }
                }
            } catch (error) {
                // Ignore, not much we can do
            } finally {
                // Regardless we wait since we made an api call
                await TimeUtils.sleep(this.interval);
            }
        }
    }

    public start(): void {
        schedule.scheduleJob(this.schedule, async () => {
            try {
                await this.run();
            } catch (error) {
                Logger.error(Logs.error.updateMemberCache, error);
            }
        });
    }
}
