import { Client } from 'discord.js';
import moment from 'moment';
import schedule from 'node-schedule';
import { createRequire } from 'node:module';

import { GuildData } from '../models/database/guild-models.js';
import { UserData } from '../models/database/user-models.js';
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
    public schedule: string = Config.jobs.removeBirthdayRoleJob.schedule;
    public log: boolean = Config.jobs.removeBirthdayRoleJob.log;
    public interval: number = Config.jobs.removeBirthdayRoleJob.interval;

    constructor(private client: Client, private guildRepo: GuildRepo, private userRepo: UserRepo) {}

    public async run(): Promise<void> {
        // Collection of guilds
        let guildCache = this.client.guilds.cache;
        let guildDiscordIds = guildCache.map(guild => guild.id);

        // TODO: Get all the guilds from the database
        let guildDatas: GuildData[] = await this.guildRepo.getAllGuilds(guildDiscordIds);

        let now = moment();
        let today = now.clone().format('MM-DD');
        let tomorrow = now.clone().add(1, 'day').format('MM-DD');
        let yesterday = now.clone().subtract(1, 'day').format('MM-DD');

        // Instead of getting the users for each guild, we can just get the users with a birthday,
        // so we know who not to take the birthday role from
        let birthdayUserData: UserData[] = [
            ...(await this.userRepo.getUsersWithBirthday(today)),
            ...(await this.userRepo.getUsersWithBirthday(tomorrow)),
            ...(await this.userRepo.getUsersWithBirthday(yesterday)),
        ];

        if (
            !TimeUtils.isLeap(now.year()) &&
            (today === '02-28' || tomorrow === '02-28' || yesterday === '02-28')
        ) {
            // Add leap year birthdays to list
            birthdayUserData.push(...(await this.userRepo.getUsersWithBirthday('02-29')));
        }

        for (let guildData of guildDatas) {
            try {
                if (!guildData.BirthdayRoleDiscordId) continue;
                // loop through the guilds roles
                let guild = await this.client.guilds.fetch(guildData.GuildDiscordId);

                let members = guild.members.cache.map(m => m);

                let role = guild.roles.cache.get(guildData.BirthdayRoleDiscordId);

                if (!role) continue;

                let counter = 0;
                let calculatedMax = (guild.memberCount / 365) * 3;

                // filter out the members who don't have the birthday role
                let membersWithRole = members.filter(member => member.roles.cache.has(role.id));

                let membersWithRoleIds = membersWithRole.map(member => member.id);

                // Remove anyone not in membersWithRolesIds (Members not in this server and who don't have the birthday role)
                let memberUserDatas = birthdayUserData.filter(userData =>
                    membersWithRoleIds.includes(userData.UserDiscordId)
                );

                let membersWithBirthdayTodayOrYesterday = members.filter(member =>
                    CelebrationUtils.isBirthdayTodayOrYesterday(
                        memberUserDatas.find(data => data.UserDiscordId === member.id),
                        guildData
                    )
                );

                let birthdayMemberStatuses = membersWithBirthdayTodayOrYesterday.map(m =>
                    CelebrationUtils.getBirthdayMemberStatus(
                        memberUserDatas.find(data => data.UserDiscordId === m.id),
                        m,
                        guildData
                    )
                );

                // Get a list of people who need the birthday role removed
                let membersToRemoveRole = membersWithRole.filter(
                    member =>
                        !birthdayMemberStatuses.find(status => status.member.id === member.id) ||
                        birthdayMemberStatuses.find(status => status.member.id === member.id)
                            .needsRoleRemoved
                );

                // Remove the birthday role from the members
                for (let member of membersToRemoveRole) {
                    if (counter >= calculatedMax) break;
                    if (member.roles.cache.has(role.id)) {
                        Logger.info(`Removing role for ${member.user.tag}`);
                        await ActionUtils.removeRole(member, role);
                        counter++;
                    }
                }
            } catch (error) {
                // Ignore, not much we can do
                Logger.error(error);
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
