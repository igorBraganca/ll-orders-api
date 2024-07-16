import { Injectable, Logger } from '@nestjs/common'
import { Order } from '@src/@types/order'
import { Product } from '@src/@types/product'
import { User } from '@src/@types/user'
import { OrderRepository } from '@src/repository/order.repository'
import { OrderDefaultLayout } from '@src/service/layouts/order.default.layout'

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name)
    constructor(private readonly orderRepository: OrderRepository) { }

    parseFile(buffer: Buffer): OrderDefaultLayout[] {
        const data = buffer.toString('utf8')
        const rows = data
            .split('\n')
            .filter((r) => !!r)
            .map((r) => OrderDefaultLayout.from(r))
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
                    orders: {},
                }
            }
            const currentUser = users[order.userId]

            if (order.orderId in currentUser.orders === false) {
                currentUser.orders[order.orderId] = {
                    id: order.orderId,
                    date: order.date,
                    products: [],
                }
            }
            const currentOrder = currentUser.orders[order.orderId]

            currentOrder.products.push({
                id: order.prodId,
                value: order.value,
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

    async persiste(users: User[]) {
        // insere os usuarios
        await this.orderRepository.insertOrUpdateUsers(users.map(u => ({ id: u.id, name: u.name })))

        // insere os pedidos
        const orders = []
        for (const u of users) {
            orders.push(...u.orders.map(o => ({ id: o.id, date: o.date, userId: u.id })))
        }
        await this.orderRepository.insertOrUpdateOrders(orders)

        // deleta todos os produtos relacionadas aos pedidos processados
        // para nao gerar duplicidade
        await this.orderRepository.deleteProductsByOrders(orders.map(o => o.id))

        // insere os produtos, agora ja com a base limpa
        const products = []
        for (const u of users) {
            for (const o of u.orders) {
                products.push(...o.products.map(p => ({ productId: p.id, value: p.value, orderId: o.id })))
            }
        }
        await this.orderRepository.insertOrUpdateProducts(products)
    }

    async findOrderById(orderId: number) {
        const result = await this.orderRepository.findOrderById(orderId)
        if (result.length === 0) {
            return
        }

        const user = new User(result[0].userId, result[0].userName)
        const order = new Order(result[0].orderId, result[0].orderDate)
        order.user = user
        order.addProducts(...result.map(r => new Product(r.productId, r.productValue)))

        return order.toDTO()
    }

    async filterOrders(filters: { orderId?: number, startDate?: Date, endDate?: Date } = {}) {
        const result = await this.orderRepository.findOrders(filters)
        if (result.length === 0) {
            return
        }

        const orders: Order[] = []
        let currentUser = new User(result[0].userId, result[0].userName)
        let currentOrder = new Order(result[0].orderId, result[0].orderDate)
        currentOrder.user = currentUser

        for (const row of result) {
            if (currentOrder.id != row.orderId) {
                orders.push(currentOrder)

                currentUser = new User(row.userId, row.userName)
                currentOrder = new Order(row.orderId, row.orderDate)
                currentOrder.user = currentUser
            }

            currentOrder.addProducts(new Product(row.productId, row.productValue))
        }
        orders.push(currentOrder)

        return orders.map(o => o.toDTO())
    }
}