import { Product, ProductDTO } from '@src/@types/product'

export class Order {
    id: number
    total: number
    date: Date
    products: Product[] = []

    constructor(id: number, date: Date, products: Product[] = []) {
        this.id = id
        this.date = date
        this.total = 0
        this.addProducts(...products)
    }

    addProducts(...products: Product[]) {
        this.total += products.reduce((acc: number, curr: Product) => acc + curr.value, 0)
        this.products.push(...products)
    }

    toDTO() {
        return OrderDTO.fromOrder(this)
    }
}

export class OrderDTO {
    order_id: number
    total: string
    date: string
    products: ProductDTO[]

    private formatDate(d: Date) {
        const year = d.getFullYear()
        const month = d.getMonth()
        const day = d.getDate()
        return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    static fromOrder(order: Order) {
        const o = new OrderDTO()
        o.order_id = order.id
        o.date = o.formatDate(order.date)
        o.total = order.total.toFixed(2)
        o.products = order.products.map((p) => p.toDTO())
        return o
    }
}
