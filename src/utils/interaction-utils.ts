import { RESTJSONErrorCodes as DiscordApiErrors } from 'discord-api-types/v10';
import {
    ButtonInteraction,
    CommandInteraction,
    DiscordAPIError,
    InteractionReplyOptions,
    InteractionUpdateOptions,
    Message,
    MessageActionRow,
    MessageComponentInteraction,
    MessageEmbed,
    WebhookEditMessageOptions,
} from 'discord.js';

const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
    DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
];

export class InteractionUtils {
    public static async deferReply(
        intr: CommandInteraction | MessageComponentInteraction,
        hidden: boolean = false
    ): Promise<void> {
        try {
            return await intr.deferReply({
                ephemeral: hidden,
            });
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async deferUpdate(intr: MessageComponentInteraction): Promise<void> {
        try {
            return await intr.deferUpdate();
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async deferAndDisableButtons(intr: ButtonInteraction): Promise<void> {
        await intr.deferUpdate();

        await InteractionUtils.editReply(intr, {
            components: this.setComponentsStatus(
                intr.message.components as MessageActionRow[],
                false
            ),
        });
    }

    public static setComponentsStatus(
        rowComponents: MessageActionRow[],
        enabled: boolean
    ): MessageActionRow[] {
        rowComponents.forEach(r => {
            r.components = r.components.map(c => c.setDisabled(!enabled));
        });

        return rowComponents;
    }

    public static async send(
        intr: CommandInteraction | MessageComponentInteraction,
        content: string | MessageEmbed | InteractionReplyOptions,
        hidden: boolean = false
    ): Promise<Message> {
        try {
            let options: InteractionReplyOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof MessageEmbed
                    ? { embeds: [content] }
                    : content;
            if (intr.deferred || intr.replied) {
                return (await intr.followUp({
                    ...options,
                    ephemeral: hidden,
                })) as Message;
            } else {
                return (await intr.reply({
                    ...options,
                    ephemeral: hidden,
                    fetchReply: true,
                })) as Message;
            }
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
        // } catch (error) {
        //     if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
        //         return;
        //     } else {
        //         throw error;
        //     }
        // }
    }

    public static async editReply(
        intr: CommandInteraction | MessageComponentInteraction,
        content: string | MessageEmbed | WebhookEditMessageOptions
    ): Promise<Message> {
        try {
            let options: WebhookEditMessageOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof MessageEmbed
                    ? { embeds: [content] }
                    : content;
            return (await intr.editReply(options)) as Message;
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async update(
        intr: MessageComponentInteraction,
        content: string | MessageEmbed | InteractionUpdateOptions
    ): Promise<Message> {
        try {
            let options: InteractionUpdateOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof MessageEmbed
                    ? { embeds: [content] }
                    : content;
            return (await intr.update({
                ...options,
                fetchReply: true,
            })) as Message;
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }
}
