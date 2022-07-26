import { LangCode } from '../../enums/index.js';
import { Lang } from '../../services/index.js';

export class Language {
    public static keyword(langCode: LangCode): string {
        return Lang.getRef('info', 'meta.language', langCode);
    }

    public static regex(langCode: LangCode): RegExp {
        return Lang.getRegex('info', 'metaRegexes.language', langCode);
    }

    public static displayName(langCode: LangCode): string {
        return Lang.getRef('info', 'meta.languageDisplay', langCode);
    }

    public static locale(langCode: LangCode): string {
        return Lang.getRef('info', 'meta.locale', langCode);
    }

    public static translators(langCode: LangCode): string {
        return Lang.getRef('info', 'meta.translators', langCode);
    }

    public static find(input: string): LangCode {
        for (let langCode of Object.values(LangCode)) {
            if (this.regex(langCode).test(input)) {
                return langCode;
            }
        }
    }

    public static list(): string {
        return Object.values(LangCode)
            .map(langCode => {
                return Lang.getRef('info', 'lists.languageItem', langCode, {
                    LANGUAGE_NAME: this.displayName(langCode),
                    LANGUAGE_KEYWORD: this.keyword(langCode),
                });
            })
            .join('\n')
            .trim();
    }
}
