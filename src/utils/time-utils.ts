import moment, { Moment } from 'moment-timezone';
import { promisify } from 'node:util';

let setTimeoutAsync = promisify(setTimeout);

export class TimeUtils {
    public static async sleep(ms: number): Promise<void> {
        return await setTimeoutAsync(ms);
    }

    public static now(): Moment {
        return moment.utc();
    }

    public static getMoment(time: Date | string): Moment {
        if (!time) {
            return;
        }

        return moment.utc(time);
    }

    public static getMomentInZone(zone: string): Moment {
        return moment.tz(zone);
    }

    public static isLeap(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    public static isHour(input: number): boolean {
        return Number.isInteger(input) && input >= 0 && input <= 23;
    }
}
