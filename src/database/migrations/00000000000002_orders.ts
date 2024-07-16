import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('orders', function (table) {
        table.increments('id')
        table.dateTime('date').notNullable().index()
        table.integer('userId').unsigned().index().references('id').inTable('users')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('orders')
}
