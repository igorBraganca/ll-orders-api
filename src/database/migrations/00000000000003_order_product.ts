import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('order_product', function (table) {
        table.integer('orderId').unsigned().index().notNullable().references('id').inTable('orders')
        table.integer('productId').unsigned().index().notNullable()

        table.index(['orderId', 'productId']);

        table.decimal('value').notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('order_product')
}
