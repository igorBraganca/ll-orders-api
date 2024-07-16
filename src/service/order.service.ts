import { Injectable } from '@nestjs/common';
import { Order } from '@src/@types/order';
import { Product } from '@src/@types/product';
import { User } from '@src/@types/user';
import { OrderDefaultLayout } from '@src/service/layouts/order.default.layout';


@Injectable()
export class OrderService {
    parseFile(buffer: Buffer): OrderDefaultLayout[] {
        const data = buffer.toString('utf8')
        const rows = data.split('\n').filter(r => !!r).map(r => OrderDefaultLayout.from(r))
        return rows
    }

    normalize(rows: OrderDefaultLayout[]): User[] {
        const sortedOrders = rows.sort(OrderDefaultLayout.sort)

        const users: any = {}
        for (const order of sortedOrders) {
            if (order.userId in users === false) {
                users[order.userId] = {
                    id: order.userId,
                    name: order.userName,
                    orders: {}
                }
            }
            const currentUser = users[order.userId]

            if (order.orderId in currentUser.orders === false) {
                currentUser.orders[order.orderId] = {
                    id: order.orderId,
                    date: order.date,
                    products: []
                }
            }
            const currentOrder = currentUser.orders[order.orderId]

            currentOrder.products.push({
                id: order.prodId,
                value: order.value
            })
        }

        return Object.values(users).map((u: any) => {
            const orders = Object.values(u.orders).map((o: any) => {
                const products = o.products.map((p: any) => new Product(p.id, p.value))
                return new Order(o.id, o.date, products)
            })
            return new User(u.id, u.name, orders)
        })
    }
}

