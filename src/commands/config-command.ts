import { ApplicationCommandOptionType } from 'discord-api-types/payloads/v9';
import { ApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';

import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { CommandUtils } from '../utils';
import { Command } from './command';

export class ConfigCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.config'),
        description: 'Manage config settings.',
        options: [
            {
                name: Lang.getCom('arguments.setting'),
                description: `Change Birthday Bot's config settings.`,
                type: ApplicationCommandOptionType.String.valueOf(),
                required: true,
                choices: [
                    {
                        name: Lang.getCom('settingType.nameFormat'),
                        value: Lang.getCom('settingType.nameFormat'),
                    },
                    {
                        name: Lang.getCom('settingType.timeZone'),
                        value: Lang.getCom('settingType.timeZone'),
                    },
                    {
                        name: Lang.getCom('settingType.useTimezone'),
                        value: Lang.getCom('settingType.useTimezone'),
                    },
                    {
                        name: Lang.getCom('settingType.dateFormat'),
                        value: Lang.getCom('settingType.dateFormat'),
                    },
                    {
                        name: Lang.getCom('settingType.trustedPreventsMessage'),
                        value: Lang.getCom('settingType.trustedPreventsMessage'),
                    },
                    {
                        name: Lang.getCom('settingType.trustedPreventsRole'),
                        value: Lang.getCom('settingType.trustedPreventsRole'),
                    },
                    {
                        name: Lang.getCom('settingType.requireAllTrustedRoles'),
                        value: Lang.getCom('settingType.requireAllTrustedRoles'),
                    },
                    {
                        name: Lang.getCom('settingType.channel'),
                        value: Lang.getCom('settingType.channel'),
                    },
                    {
                        name: Lang.getCom('settingType.role'),
                        value: Lang.getCom('settingType.role'),
                    },
                ],
            },
            {
                name: Lang.getCom('arguments.reset'),
                description: 'Reset this setting to the default value.',
                type: ApplicationCommandOptionType.Boolean.valueOf(),
                required: false,
            },
        ],
    };
    public requireDev = false;
    public requireGuild = true;
    public requireClientPerms: PermissionString[] = [];
    public requireUserPerms: PermissionString[] = [];
    public requireSetup = true;
    public requireVote = false;
    public requirePremium = false;

    constructor(private commands: Command[]) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let command = CommandUtils.findCommand(
            this.commands,
            intr.options.getString(Lang.getCom('arguments.setting'))
        );
        if (!command) {
            // TODO: Should we log error here?
            return;
        }

        let passesChecks = await CommandUtils.runChecks(command, intr, data);
        if (passesChecks) {
            await command.execute(intr, data);
        }
    }
}
