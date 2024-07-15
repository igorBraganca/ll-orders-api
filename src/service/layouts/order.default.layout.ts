export class OrderDefaultLayout {
    userId: number
    userName: string
    orderId: number
    prodId: number
    value: string
    date: string

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
        o.value = line.substring(75, 87).trim()
        o.date = OrderDefaultLayout.formatDate(line.substring(87).trim())
        return o
    }

    static formatDate(txtDate: string) {
        const year = txtDate.substring(0, 4)
        const month = txtDate.substring(4, 6)
        const day = txtDate.substring(6, 8)
        return `${year}-${month}-${day}`
    }

}
