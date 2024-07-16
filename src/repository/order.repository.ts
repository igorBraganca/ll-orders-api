import { Inject, Injectable, Logger } from "@nestjs/common";
import { DBConnection } from "@src/libs/db.connection";

@Injectable()
export class OrderRepository {
    private readonly logger = new Logger(OrderRepository.name)
    constructor(@Inject('DEFAULT_CONN') private readonly conn: DBConnection) { }

    async insertOrUpdateUsers(users: { id: number, name: string }[]) {
        this.logger.debug(`OrderRepository.insertOrUpdateUsers :: inserindo ${users.length} usuários`)
        await this.conn.query((knex) => {
            return knex('users')
                .insert(users)
                .onConflict('id')
                .merge()
        }, 'OrderRepository.insertOrUpdateUsers')
    }

    async insertOrUpdateOrders(orders: { id: number, date: Date, userId: number }[]) {
        this.logger.debug(`OrderRepository.insertOrUpdateOrders :: inserindo ${orders.length} pedidos`)
        await this.conn.query((knex) => {
            return knex('orders')
                .insert(orders)
                .onConflict('id')
                .merge()
        }, 'OrderRepository.insertOrUpdateOrders')
    }

    async insertOrUpdateProducts(products: { productId: number, value: number, orderId: number }[]) {
        this.logger.debug(`OrderRepository.insertOrUpdateProducts :: inserindo ${products.length} usuários`)
        await this.conn.query((knex) => {
            return knex('order_product')
                .insert(products)
        }, 'OrderRepository.insertOrUpdateProducts')
    }

    async deleteProductsByOrders(ordersId: number[]) {
        this.logger.debug(`OrderRepository.deleteProductsByOrders :: deletando produtos para pedidos ${JSON.stringify(ordersId)}`)
        await this.conn.query((knex) => {
            return knex('order_product')
                .delete()
                .whereIn('orderId', ordersId)
        }, 'OrderRepository.deleteProductsByOrders')
    }

    async findOrderById(id: number) {
        this.logger.debug(`OrderRepository.findOrderById :: procurando pedido ${id}`)
        return this.conn.query((knex) => {
            return knex('orders')
                .join('users', 'orders.userId', 'users.id')
                .join('order_product', 'order_product.orderId', 'orders.id')
                .where('orders.id', id)
                .select({
                    orderId: 'orders.id',
                    orderDate: 'orders.date',
                    userId: 'users.id',
                    userName: 'users.name',
                    productId: 'order_product.productId',
                    productValue: 'order_product.value'
                })
        }, 'OrderRepository.findOrderById')
    }

    async findOrders(filters: { orderId?: number, startDate?: Date, endDate?: Date } = {}) {
        this.logger.debug(`OrderRepository.findOrders :: filtrando pedidos para ${JSON.stringify(filters)}`)
        const result = this.conn.query((knex) => {
            const query = knex('orders')
                .join('users', 'orders.userId', 'users.id')
                .join('order_product', 'order_product.orderId', 'orders.id')
                .select({
                    orderId: 'orders.id',
                    orderDate: 'orders.date',
                    userId: 'users.id',
                    userName: 'users.name',
                    productId: 'order_product.productId',
                    productValue: 'order_product.value'
                })

            if (filters.orderId) {
                query.where('orders.id', filters.orderId)
            }

            if (filters.startDate && filters.endDate) {
                query.whereBetween('orders.date', [filters.startDate, filters.endDate]);
            }

            return query
        }, 'OrderRepository.findOrders')
        return result
    }
}