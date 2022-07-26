import { ButtonInteraction, Message } from 'discord.js';

import { EventData } from '../models/index.js';

export interface Button {
    ids: string[];
    deferType: ButtonDeferType;
    requireGuild: boolean;
    execute(intr: ButtonInteraction, msg: Message, data: EventData): Promise<void>;
}

export enum ButtonDeferType {
    REPLY = 'REPLY',
    UPDATE = 'UPDATE',
    NONE = 'NONE',
}
