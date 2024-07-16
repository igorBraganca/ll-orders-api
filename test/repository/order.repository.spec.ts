import { ConsoleLogger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DBConnection } from "@src/libs/db.connection";
import { LibModule } from "@src/libs/lib.module";
import { OrderRepository } from "@src/repository/order.repository";
import { TestHelper } from "@test/utils/test.helper";
import { Knex } from "knex";

let sut: OrderRepository
let conn: DBConnection

beforeEach(async () => {
    const module = await Test.createTestingModule({
        imports: [LibModule],
        providers: [OrderRepository],
    }).compile()

    // module.useLogger(new ConsoleLogger());

    sut = module.get<OrderRepository>(OrderRepository)
    conn = module.get<DBConnection>('DEFAULT_CONN')

    await TestHelper.cleanDatabase(conn)
})

afterAll(() => {
    DBConnection.disconnectAll()
})

describe('OrderRepository', () => {
    describe('insertOrUpdateUsers', () => {
        it('should insert all the users', async () => {
            const users = [
                { id: 1, name: 'teste_1' },
                { id: 2, name: 'teste_2' },
                { id: 3, name: 'teste_3' },
            ]

            await sut.insertOrUpdateUsers(users)

            const queryResult = await conn.query((knex: Knex) => knex('users'), 'OrderRepository.insertOrUpdateUsers.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].id).toBe(1)
            expect(queryResult[0].name).toBe('teste_1')

            const mergeUsers = [{ id: 1, name: 'teste_1_merged' }]

            await sut.insertOrUpdateUsers(mergeUsers)

            const mergedResult = await conn.query((knex: Knex) => knex('users').where('id', 1).first(), 'OrderRepository.insertOrUpdateUsers.test')
            expect(mergedResult.id).toBe(1)
            expect(mergedResult.name).toBe('teste_1_merged')
        })
    })

    describe('insertOrUpdateOrders', () => {
        it('should insert all the orders', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.insertOrUpdateOrders.test')

            const orders = [
                { id: 1, date: new Date('2020-01-01'), userId: idUser },
                { id: 2, date: new Date('2020-01-02'), userId: idUser },
                { id: 3, date: new Date('2020-01-03'), userId: idUser },
            ]

            await sut.insertOrUpdateOrders(orders)

            const queryResult = await conn.query((knex: Knex) => knex('orders'), 'OrderRepository.insertOrUpdateOrders.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].id).toBe(1)
            expect(queryResult[0].userId).toBe(idUser)
            expect(queryResult[0].date).toStrictEqual(new Date('2020-01-01'))
            expect(queryResult[1].date).toStrictEqual(new Date('2020-01-02'))
            expect(queryResult[2].date).toStrictEqual(new Date('2020-01-03'))

            const mergeOrders = [{ id: 1, date: new Date('2020-01-09'), userId: idUser }]

            await sut.insertOrUpdateOrders(mergeOrders)

            const mergedResult = await conn.query((knex: Knex) => knex('orders').where('id', 1).first(), 'OrderRepository.insertOrUpdateOrders.test')
            expect(mergedResult.id).toBe(1)
            expect(mergedResult.date).toStrictEqual(new Date('2020-01-09'))
        })
    })

    describe('insertOrUpdateProducts', () => {
        it('should insert all the orders', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.insertOrUpdateProducts.test')
            const [idOrder] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.insertOrUpdateProducts.test')

            const products = [
                { productId: 1, value: 1.11, orderId: idOrder },
                { productId: 2, value: 2.22, orderId: idOrder },
                { productId: 3, value: 3.33, orderId: idOrder },
            ]

            await sut.insertOrUpdateProducts(products)

            const queryResult = await conn.query((knex: Knex) => knex('order_product'), 'OrderRepository.insertOrUpdateProducts.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].productId).toBe(1)
            expect(queryResult[0].orderId).toBe(idOrder)
            expect(queryResult[0].value).toBe(1.11)
            expect(queryResult[1].value).toBe(2.22)
            expect(queryResult[2].value).toBe(3.33)
        })
    })

    describe('deleteProductsByOrders', () => {
        it('should delete all products', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.deleteProductsByOrders.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.deleteProductsByOrders.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.deleteProductsByOrders.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.deleteProductsByOrders.test')

            await sut.deleteProductsByOrders([idOrder1])

            const queryResult1 = await conn.query((knex: Knex) => knex('order_product').where('orderId', idOrder1), 'OrderRepository.deleteProductsByOrders.test')
            expect(queryResult1.length).toBe(0)

            const queryResult2 = await conn.query((knex: Knex) => knex('order_product').where('orderId', idOrder2), 'OrderRepository.deleteProductsByOrders.test')
            expect(queryResult2.length).toBe(1)
        })
    })

    describe('findOrderById', () => {
        it('should delete all products', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrderById.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrderById.test')

            const result = await sut.findOrderById(idOrder1)

            expect(result.length).toBe(2)
            expect(result[0].orderId).toBe(idOrder1)
            expect(result[0].orderDate).toStrictEqual(new Date(2020, 0, 1))
            expect(result[0].userId).toBe(idUser)
            expect(result[0].userName).toBe('teste_1')
            expect(result[0].productId).toBe(1)
            expect(result[0].productValue).toBe(1.11)
            expect(result[1].productId).toBe(3)
            expect(result[1].productValue).toBe(3.33)
        })
    })

    describe('findOrders', () => {
        it('should find by order id', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrders.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrders.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrders.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrders.test')

            const result = await sut.findOrders({ orderId: idOrder1 })

            expect(result.length).toBe(2)
            expect(result[0].orderId).toBe(idOrder1)
            expect(result[0].orderDate).toStrictEqual(new Date(2020, 0, 1))
            expect(result[0].userId).toBe(idUser)
            expect(result[0].userName).toBe('teste_1')
            expect(result[0].productId).toBe(1)
            expect(result[0].productValue).toBe(1.11)
            expect(result[1].productId).toBe(3)
            expect(result[1].productValue).toBe(3.33)
        })

        it('should find by date', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrders.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrders.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-15', userId: idUser }), 'OrderRepository.findOrders.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrders.test')

            const result = await sut.findOrders({ startDate: new Date('2020-01-14'), endDate: new Date('2020-01-16') })

            expect(result.length).toBe(1)
            expect(result[0].orderId).toBe(idOrder2)
            expect(result[0].orderDate).toStrictEqual(new Date(2020, 0, 15))
            expect(result[0].userId).toBe(idUser)
            expect(result[0].userName).toBe('teste_1')
            expect(result[0].productId).toBe(2)
            expect(result[0].productValue).toBe(2.22)
        })

        it('should find by date and orderId', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrders.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-15', userId: idUser }), 'OrderRepository.findOrders.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-15', userId: idUser }), 'OrderRepository.findOrders.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrders.test')

            const result = await sut.findOrders({ orderId: idOrder2, startDate: new Date('2020-01-14'), endDate: new Date('2020-01-16') })

            expect(result.length).toBe(1)
            expect(result[0].orderId).toBe(idOrder2)
            expect(result[0].orderDate).toStrictEqual(new Date(2020, 0, 15))
            expect(result[0].userId).toBe(idUser)
            expect(result[0].userName).toBe('teste_1')
            expect(result[0].productId).toBe(2)
            expect(result[0].productValue).toBe(2.22)
        })

        it('should find anything', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrders.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-15', userId: idUser }), 'OrderRepository.findOrders.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-15', userId: idUser }), 'OrderRepository.findOrders.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrders.test')

            const result = await sut.findOrders({ orderId: 3, startDate: new Date('2020-01-14'), endDate: new Date('2020-01-16') })

            expect(result.length).toBe(0)

            const result2 = await sut.findOrders({ orderId: idOrder1, startDate: new Date('2022-01-14'), endDate: new Date('2022-01-16') })

            expect(result2.length).toBe(0)
        })
    })
})