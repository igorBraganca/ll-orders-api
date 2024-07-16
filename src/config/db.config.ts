import * as path from 'path'

const BASE_PATH = path.resolve('../database')

export const db = {
    projectDB: {
        client: 'mysql',
        connection: {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '123456',
            database: 'orders',
        },
        migrations: {
            directory: path.join(BASE_PATH, 'migrations'),
        },
        seeds: {
            directory: path.join(BASE_PATH, 'seeds'),
        },
    },
}
