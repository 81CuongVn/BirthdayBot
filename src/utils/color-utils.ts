import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let colors: { name: string; hex: string }[] = require('color-name-list');

const COLOR_HEX_REGEX = /#?([0-9A-F]{6})/i;

export class ColorUtils {
    public static isHex(input: string): boolean {
        return COLOR_HEX_REGEX.test(input);
    }

    public static findHex(input: string): string {
        if (this.isHex(input)) {
            return this.formatHexOutput(input);
        }

        let color =
            colors.find(color => color.name.toLowerCase() === input.toLowerCase()) ??
            colors.find(color => color.name.toLowerCase().includes(input.toLowerCase()));
        if (!color) {
            return;
        }

        return this.formatHexOutput(color.hex);
    }

    private static formatHexOutput(hex: string): string {
        hex = COLOR_HEX_REGEX.exec(hex)[0];
        hex = hex.toUpperCase();
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        if (hex === 'FFFFFF') {
            hex = 'FEFEFE';
        }
        return hex;
    }
}
