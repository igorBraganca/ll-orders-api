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

    async insertOrUpdateProducts(products: { id: number, value: number, orderId: number }[]) {
        this.logger.debug(`OrderRepository.insertOrUpdateProducts :: inserindo ${products.length} usuários`)
        await this.conn.query((knex) => {
            return knex('products')
                .insert(products)
                .onConflict('id')
                .merge()
        }, 'OrderRepository.insertOrUpdateProducts')
    }
}