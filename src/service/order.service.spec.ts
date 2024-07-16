import { Test } from '@nestjs/testing'
import { DBConnection } from '@src/libs/db.connection'
import { OrderRepository } from '@src/repository/order.repository'
import { RepositoryModule } from '@src/repository/repository.module'
import { OrderService } from '@src/service/order.service'
import { readFileSync } from 'fs'

let sut: OrderService = null
let orderRepository: OrderRepository = null

beforeEach(async () => {
    const module = await Test.createTestingModule({
        imports: [RepositoryModule],
        providers: [OrderService],
    }).compile()

    // module.useLogger(new ConsoleLogger());

    orderRepository = module.get<OrderRepository>(OrderRepository)
    sut = module.get<OrderService>(OrderService)
})

afterAll(() => {
    DBConnection.disconnectAll()
})

describe('OrderService', () => {
    describe('parseFile', () => {
        it('should return a list of order', () => {
            const buffer = readFileSync('./data/data_1.txt')
            const result = sut.parseFile(buffer)

            expect(result.length).toBe(2352)

            const firstLine = result[0]

            expect(firstLine.userId).toBe(70)
            expect(firstLine.userName).toBe('Palmer Prosacco')
            expect(firstLine.orderId).toBe(753)
            expect(firstLine.prodId).toBe(3)
            expect(firstLine.value).toBe(1836.74)
            expect(firstLine.date.toISOString()).toBe(new Date(2021, 2, 8).toISOString())
        })
    })

    describe('normalize', () => {
        it('should return a list of order normalized', () => {
            const buffer = readFileSync('./data/data_1.txt')
            const data = sut.parseFile(buffer)
            const result = sut.normalize(data)

            expect(result.length).toBe(100)

            const firstUser = result[0]
            expect(firstUser.id).toBe(1)
            expect(firstUser.name).toBe('Sammie Baumbach')
            expect(firstUser.orders.length).toBe(15)

            const firstOrder = firstUser.orders[0]
            expect(firstOrder.id).toBe(2)
            expect(firstOrder.date.toISOString()).toBe(new Date(2021, 9, 28).toISOString())
            expect(firstOrder.total).toBe(2966.46)
            expect(firstOrder.products.length).toBe(3)
            expect(firstOrder.products[0].id).toBe(2)
            expect(firstOrder.products[0].value).toBe(601.43)
            expect(firstOrder.products[1].id).toBe(2)
            expect(firstOrder.products[1].value).toBe(798.03)
            expect(firstOrder.products[2].id).toBe(5)
            expect(firstOrder.products[2].value).toBe(1567.0)
        })
    })

    describe('persiste', () => {
        it('should persiste all data', async () => {
            const insertOrUpdateUsersFn = jest.spyOn(orderRepository, 'insertOrUpdateUsers').mockImplementation(async (args) => expect(args.length).toBe(100))
            const insertOrUpdateOrdersFn = jest.spyOn(orderRepository, 'insertOrUpdateOrders').mockImplementation(async (args) => expect(args.length).toBe(1084))
            const insertOrUpdateProductsFn = jest.spyOn(orderRepository, 'insertOrUpdateProducts').mockImplementation(async (args) => expect(args.length).toBe(2352))
            const deleteProductsByOrdersFn = jest.spyOn(orderRepository, 'deleteProductsByOrders').mockImplementation(async (args) => expect(args.length).toBe(1084))

            const buffer = readFileSync('./data/data_1.txt')
            const data = sut.parseFile(buffer)
            const normalizedData = sut.normalize(data)
            await sut.persiste(normalizedData)

            expect(insertOrUpdateUsersFn).toHaveBeenCalled()
            expect(insertOrUpdateOrdersFn).toHaveBeenCalled()
            expect(insertOrUpdateProductsFn).toHaveBeenCalled()
            expect(deleteProductsByOrdersFn).toHaveBeenCalled()
        }, 600000)
    })

    describe('findOrderById', () => {
        it('should find an order', async () => {
            jest.spyOn(orderRepository, 'findOrderById').mockResolvedValue([
                { orderId: 1, orderDate: new Date(2020, 0, 1), userId: 1, userName: 'teste_1', productId: 1, productValue: 1.11 },
                { orderId: 1, orderDate: new Date(2020, 0, 1), userId: 1, userName: 'teste_1', productId: 2, productValue: 2.22 },
                { orderId: 1, orderDate: new Date(2020, 0, 1), userId: 1, userName: 'teste_1', productId: 3, productValue: 3.33 },
            ])

            const result = await sut.findOrderById(1)

            expect(result.order_id).toBe(1)
            expect(result.date).toBe('2020-01-01')
            expect(result.total).toBe('6.66')
            expect(result.user.user_id).toBe(1)
            expect(result.user.name).toBe('teste_1')
            expect(result.products[0].product_id).toBe(1)
            expect(result.products[0].value).toBe('1.11')
            expect(result.products[1].product_id).toBe(2)
            expect(result.products[1].value).toBe('2.22')
            expect(result.products[2].product_id).toBe(3)
            expect(result.products[2].value).toBe('3.33')
        })

        it('not found', async () => {
            jest.spyOn(orderRepository, 'findOrderById').mockResolvedValue([])

            const result = await sut.findOrderById(1)

            expect(result).toBeUndefined()
        })
    })
})
