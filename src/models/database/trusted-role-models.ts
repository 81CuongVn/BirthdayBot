import { StatsData } from './index.js';

export class TrustedRoles {
    trustedRoles: TrustedRole[];
    stats: StatsData;

    constructor(trustedRoleRows: TrustedRole[], statsRow: StatsData) {
        this.trustedRoles = trustedRoleRows;
        this.stats = statsRow;
    }
}

export class TrustedRole {
    GuildId: number;
    TrustedRoleDiscordId: string;
    Position: number;
}
