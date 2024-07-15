import { Injectable } from '@nestjs/common';
import { OrderDefaultLayout } from './layouts/order.default.layout';

@Injectable()
export class OrderService {
    parseFile(buffer: Buffer): OrderDefaultLayout[] {
        const data = buffer.toString('utf8')
        const rows = data.split('\n').filter(r => !!r).map(r => OrderDefaultLayout.from(r))
        return rows
    }

    normalize(rows: OrderDefaultLayout[]): User[] {
        const sortedOrders = rows.sort((a, b) => {
            if (a.userId === b.userId && a.orderId === b.orderId) {
                return a.prodId - b.prodId
            }
            if (a.userId === b.userId) {
                return a.orderId - b.orderId
            }
            return a.userId - b.userId
        })

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
                const total = o.products.reduce((acc: number, curr: Product) => acc + Number(curr.value), 0)
                return {
                    ...o,
                    total
                }
            })

            return {
                ...u,
                orders
            }
        })
    }
}

export interface User {
    id: number
    name: string
    orders: Order[]
}

export interface Order {
    id: number
    total: string
    date: string
    products: Product[]
}

export interface Product {
    id: number
    value: string
}