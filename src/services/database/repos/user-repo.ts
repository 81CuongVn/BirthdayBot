import { UserData, UserDataResults } from '../../../models/database/index.js';
import { SqlUtils } from '../../../utils/index.js';
import { DataAccess, Procedure } from '../index.js';

export class UserRepo {
    constructor(private dataAccess: DataAccess) {}

    public async getUser(discordId: string): Promise<UserData> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_Get, [discordId]);
        return SqlUtils.getRow(results, 0, 0);
    }

    public async getAllUsers(discordIds: string[]): Promise<UserData[]> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetAll, [
            discordIds.join(','),
        ]);
        return SqlUtils.getTable(results, 0);
    }

    public async addOrUpdateUser(
        discordId: string,
        birthday: string,
        timeZone: string,
        changesLeft: number
    ): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.User_AddOrUpdate, [
            discordId,
            birthday,
            timeZone,
            changesLeft,
        ]);
    }

    public async getBirthdayListFullFromDate(
        discordIds: string[],
        pageSize: number,
        date: string
    ): Promise<UserDataResults> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetFullListFromDate, [
            discordIds.join(','),
            pageSize,
            date,
        ]);

        let userData = SqlUtils.getTable(results, 0);
        let stats = SqlUtils.getRow(results, 1, 0);
        return new UserDataResults(userData, stats);
    }

    public async getBirthdayListFull(
        discordIds: string[],
        pageSize: number,
        page: number
    ): Promise<UserDataResults> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetFullList, [
            discordIds.join(','),
            pageSize,
            page,
        ]);

        let userData = SqlUtils.getTable(results, 0);
        let stats = SqlUtils.getRow(results, 1, 0);
        return new UserDataResults(userData, stats);
    }

    public async getUsersWithBirthday(birthday: string): Promise<UserData[]> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetBirthdays, [
            birthday,
        ]);

        return SqlUtils.getTable(results, 0);
    }

    public async addUserVote(botSiteName: string, discordId: string): Promise<void> {
        await this.dataAccess.executeProcedure(Procedure.User_AddVote, [botSiteName, discordId]);
    }

    public async getUserCount(): Promise<number> {
        let results = await this.dataAccess.executeProcedure(Procedure.User_GetTotalCount, []);
        return SqlUtils.getRow(results, 0, 0).Total;
    }
}
