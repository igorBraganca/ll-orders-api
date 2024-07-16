export class OrderDefaultLayout {
    userId: number
    userName: string
    orderId: number
    prodId: number
    value: number
    date: Date

    private parseDate(txtDate: string) {
        const year = Number(txtDate.substring(0, 4))
        const month = Number(txtDate.substring(4, 6))
        const day = Number(txtDate.substring(6, 8))
        return new Date(year, month - 1, day, 0, 0, 0, 0)
    }

    // campo tamanho tipo
    // id usuário - 10 - numérico
    // nome - 45 - texto
    // id pedido - 10 - numérico
    // id produto - 10 - numérico
    // valor do produto - 12 - decimal
    // data compra - 8 - numérico ( formato: yyyymmdd )
    static from(line: string): OrderDefaultLayout {
        if (line.length != 95) {
            throw new Error('OrderDefaultLayout.from :: invalid layout')
        }

        const o = new OrderDefaultLayout()
        o.userId = Number(line.substring(0, 10))
        o.userName = line.substring(10, 55).trim()
        o.orderId = Number(line.substring(55, 65))
        o.prodId = Number(line.substring(65, 75))
        o.value = Number(line.substring(75, 87).trim())
        o.date = o.parseDate(line.substring(87).trim())
        return o
    }

    static sort(a: OrderDefaultLayout, b: OrderDefaultLayout) {
        if (a.userId === b.userId && a.orderId === b.orderId && a.prodId === b.prodId) {
            return a.value - b.value
        }
        if (a.userId === b.userId && a.orderId === b.orderId) {
            return a.prodId - b.prodId
        }
        if (a.userId === b.userId) {
            return a.orderId - b.orderId
        }
        return a.userId - b.userId
    }
}
