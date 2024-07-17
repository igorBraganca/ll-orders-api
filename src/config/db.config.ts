import * as path from 'path'

const BASE_PATH = path.resolve(`${__dirname}/../database`)

export const db = {
    projectDB: {
        client: 'mysql2',
        connection: {
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
            user: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASS || '123456',
            database: process.env.DATABASE || 'orders',
        },
        migrations: {
            directory: path.join(BASE_PATH, 'migrations'),
        },
        seeds: {
            directory: path.join(BASE_PATH, 'seeds'),
        },
    },
}
