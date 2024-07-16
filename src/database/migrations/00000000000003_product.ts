import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('products', function (table) {
        table.increments('id')
        table.decimal('value').notNullable()
        table.integer('orderId').unsigned().index().references('id').inTable('orders')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('products')
}
