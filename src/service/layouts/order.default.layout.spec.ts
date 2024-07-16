import { OrderDefaultLayout } from '@src/service/layouts/order.default.layout'

describe('OrderDefaultLayout', () => {
    describe('from', () => {
        it('should return an structured object', () => {
            const data = '0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308'
            const order = OrderDefaultLayout.from(data)

            expect(order.userId).toBe(70)
            expect(order.userName).toBe('Palmer Prosacco')
            expect(order.orderId).toBe(753)
            expect(order.prodId).toBe(3)
            expect(order.value).toBe(1836.74)
            expect(order.date.toISOString()).toBe(new Date(2021, 2, 8).toISOString())
        })
    })
})
