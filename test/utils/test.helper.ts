import { DBConnection } from "@src/libs/db.connection";

export class TestHelper {
    static async cleanDatabase(conn: DBConnection) {
        const tables = [
            'products',
            'orders',
            'users'
        ]
        for (const table of tables) {
            await conn.query(knex => knex(table).delete(), 'TestHelper.cleanDatabase')
        }
    }
}