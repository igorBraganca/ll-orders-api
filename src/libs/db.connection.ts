import { Logger } from '@nestjs/common'
import { db } from '@src/config/db.config'
import knex, { Knex } from 'knex'

export class DBConnection {
    private static readonly allConnections: Record<string, Knex> = {}

    static getConnection(name: string): Knex {
        if (name in this.allConnections) {
            return this.allConnections[name]
        }
        if (name in db) {
            this.allConnections[name] = knex(db[name])
            return this.allConnections[name]
        }
        throw new Error(`DBConnection.getConnection :: unknown connection ${name}`)
    }

    static async disconnectAll() {
        for (const key of Object.keys(DBConnection.allConnections)) {
            await DBConnection.allConnections[key].destroy()
        }
    }

    private readonly logger = new Logger(DBConnection.name)
    private readonly currentConnection: Knex

    constructor(connectionName: string) {
        this.currentConnection = DBConnection.getConnection(connectionName)
    }

    async query(fn: (k: Knex) => {}, identification = 'undefined'): Promise<any> {
        this.logger.debug(`DBConnection.query :: running query ${fn(this.currentConnection).toString()}`)
        const t0 = performance.now()
        const result = fn(this.currentConnection)
        const t1 = performance.now()
        this.logger.log(`DBConnection.query :: query took ${t1 - t0} ms [${identification}]`)
        return result
    }
}
