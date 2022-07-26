import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../models/index.js';

export interface Command {
    metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
    cooldown?: RateLimiter;
    deferType: CommandDeferType;
    requireClientPerms: PermissionString[];
    requireSetup: boolean;
    requireVote: boolean;
    requirePremium: boolean;
    execute(intr: CommandInteraction, data: EventData): Promise<void>;
}

export enum CommandDeferType {
    PUBLIC = 'PUBLIC',
    HIDDEN = 'HIDDEN',
    NONE = 'NONE',
}
