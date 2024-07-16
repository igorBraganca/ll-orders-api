import { Inject, Injectable, Logger } from "@nestjs/common";
import { Order } from "@src/@types/order";
import { Product } from "@src/@types/product";
import { User } from "@src/@types/user";
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
}