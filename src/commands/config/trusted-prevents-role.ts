import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ButtonInteraction, CommandInteraction, PermissionString } from 'discord.js';

import { CustomRole } from '../../enums/index.js';
import { EventData } from '../../models/index.js';
import { GuildRepo } from '../../services/database/repos/index.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Command } from '../index.js';

export class TrustedPreventsRoleSubCommand implements Command {
    constructor(public guildRepo: GuildRepo) {}
    public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
        name: Lang.getCom('settingType.trustedPreventsRole'),
        description: undefined,
        dm_permission: false,
        default_member_permissions: undefined,
    };

    public deferType = undefined;
    public requireDev = false;
    public requireClientPerms: PermissionString[] = [];
    public requireRole = [CustomRole.BirthdayMaster];
    public requireSetup = true;
    public requireVote = false;
    public requirePremium = false;

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let reset = intr.options.getBoolean(Lang.getCom('arguments.reset')) ?? false;
        let result: { intr: ButtonInteraction | CommandInteraction; value: boolean };

        // Get the prompt embed based on the setting, all are a true or false
        let promptEmbed = Lang.getEmbed('prompts', `config.trustedPreventsRole`, data.lang());

        if (!reset) {
            result = await CollectorUtils.getBooleanFromButton(intr, data, promptEmbed);

            if (result === undefined) return;
        } else result = { intr: intr, value: true };

        await this.guildRepo.updateTrustedPreventsRole(intr.guild.id, result.value ? 1 : 0);

        await InteractionUtils.send(
            result.intr,
            Lang.getSuccessEmbed(
                'results',
                result
                    ? 'successEmbeds.trustedPreventsRoleYes'
                    : 'successEmbeds.trustedPreventsRoleNo',
                data.lang()
            )
        );
    }
}
