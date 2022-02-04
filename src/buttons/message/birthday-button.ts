import { ButtonInteraction, Message } from 'discord.js';
import { createRequire } from 'node:module';

import { EventData } from '../../models/internal-models.js';
import { CustomMessageRepo } from '../../services/database/repos/index.js';
import { ButtonUtils } from '../../utils/button-utils.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import { ListUtils } from '../../utils/list-utils.js';
import { RegexUtils } from '../../utils/regex-utils.js';
import { Button, ButtonDeferType } from '../button.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class BirthdayMessageButton implements Button {
    public ids = [
        'birthday_message_previous',
        'birthday_message_next',
        'birthday_message_previous_more',
        'birthday_message_next_more',
        'birthday_message_refresh',
    ];
    public deferType = ButtonDeferType.UPDATE;
    public requireGuild = true;

    constructor(private customMessageRepo: CustomMessageRepo) {}

    public async execute(intr: ButtonInteraction, msg: Message, data: EventData): Promise<void> {
        let embed = msg.embeds[0];

        let pageNum = RegexUtils.pageNumber(embed.title);
        if (pageNum === undefined) {
            return;
        }

        let newPageNum = ButtonUtils.getNewPageNum(
            pageNum,
            intr.customId.replace(/^birthday_message_/, '')
        );
        if (newPageNum === undefined) return;
        if (newPageNum <= 0) newPageNum = 1;

        let customMessageData = await this.customMessageRepo.getCustomMessageList(
            intr.guild.id,
            Config.experience.messageListSize,
            newPageNum,
            'birthday'
        );

        let newEmbed = await ListUtils.getCustomMessageListEmbed(
            intr.guild,
            customMessageData,
            customMessageData.stats.Page,
            Config.experience.messageListSize,
            'birthday',
            data
        );

        await InteractionUtils.editReply(intr, newEmbed);
        return;
    }
}
