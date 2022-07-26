import { ButtonInteraction, Message } from 'discord.js';
import { createRequire } from 'node:module';

import { EventData } from '../models/internal-models.js';
import { BlacklistRepo } from '../services/database/repos/index.js';
import { ButtonUtils, InteractionUtils, ListUtils, RegexUtils } from '../utils/index.js';
import { Button, ButtonDeferType } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class BlacklistButton implements Button {
    public ids = [
        'blacklist_previous',
        'blacklist_next',
        'blacklist_previous_more',
        'blacklist_next_more',
        'blacklist_refresh',
    ];
    public deferType = ButtonDeferType.UPDATE;
    public requireGuild = true;

    constructor(private blacklistRepo: BlacklistRepo) {}

    public async execute(intr: ButtonInteraction, msg: Message, data: EventData): Promise<void> {
        let embed = msg.embeds[0];

        let pageNum = RegexUtils.pageNumber(embed.title);
        if (pageNum === undefined) {
            return;
        }

        let newPageNum = ButtonUtils.getNewPageNum(
            pageNum,
            intr.customId.replace(/^blacklist_/, '')
        );
        if (newPageNum === undefined) return;
        if (newPageNum <= 0) newPageNum = 1;

        let blacklistData = await this.blacklistRepo.getBlacklistList(
            intr.guild.id,
            Config.experience.blacklistSize,
            newPageNum
        );

        let newEmbed = await ListUtils.getBlacklistFullEmbed(
            intr.guild,
            blacklistData,
            blacklistData.stats.Page,
            Config.experience.blacklistSize,
            data
        );

        await InteractionUtils.editReply(intr, newEmbed);
        return;
    }
}
