import { ApplicationCommandData, CommandInteraction, Message, PermissionString } from 'discord.js';

import { EventData } from '../../models/index.js';
import { GuildRepo } from '../../services/database/repos/index.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, FormatUtils, InteractionUtils } from '../../utils/index.js';
import { Command } from '../index.js';

export class DateFormatSubCommand implements Command {
    constructor(public guildRepo: GuildRepo) {}
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('settingType.dateFormat'),
        description: undefined,
    };

    public deferType = undefined;
    public requireDev = false;
    public requireGuild = true;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = [];
    public requireSetup = true;
    public requireVote = false;
    public requirePremium = false;

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let dateFormat: string;
        let reset = intr.options.getBoolean(Lang.getCom('arguments.reset')) ?? false;

        if (!reset) {
            // prompt them for a setting
            let collect = CollectorUtils.createMsgCollect(intr.channel, intr.user, async () => {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('results', 'fail.promptExpired', data.lang())
                );
            });

            let _prompt = await InteractionUtils.send(
                intr,
                Lang.getEmbed('prompts', 'config.dateFormat', data.lang())
            );

            dateFormat = await collect(async (nextMsg: Message) => {
                let input = FormatUtils.extractDateFormatType(nextMsg.content)?.toLowerCase();
                if (!input) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getErrorEmbed('validation', 'errorEmbeds.invalidSetting', data.lang())
                    );
                    return;
                }

                return input.toLowerCase();
            });
            if (dateFormat === undefined) return;
        } else dateFormat = 'month_day';

        await this.guildRepo.updateDateFormat(intr.guild.id, dateFormat);

        await InteractionUtils.send(
            intr,
            Lang.getSuccessEmbed('results', 'successEmbeds.dateFormatSet', data.lang(), {
                SETTING: Lang.getRef(
                    'info',
                    `types.${dateFormat === 'month_day' ? 'monthDay' : 'dayMonth'}`,
                    data.lang()
                ),
            })
        );
    }
}
