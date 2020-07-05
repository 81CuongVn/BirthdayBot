import { Message, MessageEmbed, TextChannel } from 'discord.js';

import { GuildRepo } from '../services/database/repos';
import { SetupUtils } from '../utils';
import { Command } from './command';

let Config = require('../../config/config.json');

export class SetupCommand implements Command {
    public name: string = 'setup';
    public aliases = ['configure', 'set-up'];
    public requireSetup = false;
    public guildOnly = true;
    public adminOnly = true;
    public ownerOnly = false;

    constructor(private guildRepo: GuildRepo) {}

    public async execute(args: string[], msg: Message, channel: TextChannel) {
        // Run required setup if no arguments
        if (args.length <= 2) {
            if (
                !msg.guild.me.hasPermission('MANAGE_CHANNELS') ||
                !msg.guild.me.hasPermission('MANAGE_ROLES')
            ) {
                let embed = new MessageEmbed()
                    .setTitle('Missing Permissions!')
                    .setDescription(
                        'I need permission to **Manage Channels** and **Manage Roles**!'
                    )
                    .setColor(Config.colors.error);
                await channel.send(embed);
                return;
            }

            await SetupUtils.executeRequiredSetup(msg, channel, this.guildRepo);
            return;
        }

        // Required setup is needed to run any specific setup
        let guildData = await this.guildRepo.getGuild(msg.guild.id);
        if (!guildData) {
            let embed = new MessageEmbed()
                .setTitle('Setup Required!')
                .setDescription('You must run `bday setup` before using this command!')
                .setColor(Config.colors.error);

            await channel.send(embed);
            return;
        }

        // Run the appropriate setup
        switch (args[2].toLowerCase()) {
            case 'message':
                await SetupUtils.executeMessageSetup(msg, channel, this.guildRepo);
                return;
            case 'trusted':
                if (!msg.guild.me.hasPermission('MANAGE_ROLES')) {
                    let embed = new MessageEmbed()
                        .setTitle('Not Enough Permissions!')
                        .setDescription('The bot must have permission to manage  roles!')
                        .setColor(Config.colors.error);
                    await channel.send(embed);
                    return;
                }
                await SetupUtils.executeTrustedSetup(msg, channel, this.guildRepo);
                return;
            default:
                let embed = new MessageEmbed()
                    .setTitle('Invalid Usage!')
                    .setDescription(
                        `Please specify which setup you'd like to run!\n\nSetup options: \`message\` or \`trusted\``
                    )
                    .setColor(Config.colors.error);
                await channel.send(embed);
                return;
        }
    }
}
