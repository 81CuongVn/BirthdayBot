import { ApplicationCommandData, CommandInteraction, PermissionString, Role } from 'discord.js';
import { createRequire } from 'node:module';

import { EventData } from '../../models/index.js';
import { MemberAnniversaryRoleRepo } from '../../services/database/repos/index.js';
import { Lang } from '../../services/index.js';
import { MessageUtils } from '../../utils/index.js';
import { Command } from '../index.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class MarAddSubCommand implements Command {
    constructor(public memberAnniversaryRoleRepo: MemberAnniversaryRoleRepo) {}
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('subCommands.add'),
        description: undefined,
    };

    public deferType = undefined;
    public requireDev = false;
    public requireGuild = true;
    public requireClientPerms: PermissionString[] = [];
    public requireUserPerms: PermissionString[] = [];
    public requireSetup = true;
    public requireVote = false;
    public requirePremium = false;

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let role = intr.options.getRole(Lang.getCom('arguments.role'));
        let year = intr.options.getInteger(Lang.getCom('arguments.year'));

        if (!(role instanceof Role)) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getErrorEmbed(
                    'validation',
                    'errorEmbeds.rawAPIInteractionDataReceived',
                    data.lang()
                )
            );
            return;
        }

        if (role.managed) {
            MessageUtils.sendIntr(
                intr,
                Lang.getErrorEmbed('validation', 'errorEmbeds.marManaged', data.lang())
            );
            return;
        }

        if (role.id === intr.guild.id) {
            // can't blacklist everyone
            await MessageUtils.sendIntr(
                intr,
                Lang.getErrorEmbed('validation', 'errorEmbeds.everyoneIsNotAValidRole', data.lang())
            );
            return;
        }

        let memberAnniversaryRoles = await this.memberAnniversaryRoleRepo.getMemberAnniversaryRoles(
            intr.guild.id
        );

        if (memberAnniversaryRoles.memberAnniversaryRoles.find(role => role.Year === year)) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getErrorEmbed('validation', 'errorEmbeds.marDuplicateYear', data.lang(), {
                    YEAR: year.toString(),
                })
            );
            return;
        }

        if (
            memberAnniversaryRoles &&
            memberAnniversaryRoles.memberAnniversaryRoles.length >=
                Config.validation.memberAnniversaryRoles.maxCount.paid
        ) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getErrorEmbed('validation', 'errorEmbeds.marMaxPaid', data.lang(), {
                    PAID_MAX: Config.validation.trustedRoles.maxCount.paid.toString(),
                })
            );
            return;
        }

        await this.memberAnniversaryRoleRepo.addMemberAnniversaryRole(
            intr.guild.id,
            role?.id,
            year
        );

        await MessageUtils.sendIntr(
            intr,
            Lang.getSuccessEmbed('results', 'successEmbeds.marAdd', data.lang(), {
                ROLE: role.toString(),
                YEAR: year.toString(),
            })
        );
    }
}
