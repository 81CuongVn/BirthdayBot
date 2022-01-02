import { ApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';

import { Command } from './command';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '../utils';

export class InfoCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.info'),
        description: 'Information about the bot.',
    };
    public requireDev = false;
    public requireGuild = false;
    public requireUserPerms: PermissionString[] = [];

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        // await MessageUtils.sendIntr(intr, Lang.getEmbed('embeds.help', data.lang()));
    }
}
