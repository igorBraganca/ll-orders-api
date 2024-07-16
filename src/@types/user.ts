import { Order, OrderDTO } from '@src/@types/order'

export class User {
    id: number
    name: string
    orders: Order[] = []

    constructor(id: number, name: string, orders: Order[] = []) {
        this.id = id
        this.name = name
        this.addOrders(...orders)
    }

    addOrders(...orders: Order[]) {
        this.orders.push(...orders)
    }

    toDTO() {
        return UserDTO.fromUser(this)
    }
}

export class UserDTO {
    user_id: number
    name: string
    orders: OrderDTO[]

    static fromUser(user: User) {
        const u = new UserDTO()
        u.user_id = user.id
        u.name = user.name
        u.orders = user.orders.map((o) => o.toDTO())
        return u
    }
}
