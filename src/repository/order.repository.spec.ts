import { ConsoleLogger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DBConnection } from "@src/libs/db.connection";
import { LibModule } from "@src/libs/lib.module";
import { OrderRepository } from "@src/repository/order.repository";
import { TestHelper } from "@test/utils/test.helper";

let sut = null
let conn = null

beforeEach(async () => {
    const module = await Test.createTestingModule({
        imports: [LibModule],
        providers: [OrderRepository],
    }).compile()

    module.useLogger(new ConsoleLogger());

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

            const queryResult = await conn.query(knex => knex('users'), 'OrderRepository.insertOrUpdateUsers.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].id).toBe(1)
            expect(queryResult[0].name).toBe('teste_1')

            const mergeUsers = [{ id: 1, name: 'teste_1_merged' }]

            await sut.insertOrUpdateUsers(mergeUsers)

            const mergedResult = await conn.query(knex => knex('users').where('id', 1).first(), 'OrderRepository.insertOrUpdateUsers.test')
            expect(mergedResult.id).toBe(1)
            expect(mergedResult.name).toBe('teste_1_merged')
        })
    })

    describe('insertOrUpdateOrders', () => {
        it('should insert all the orders', async () => {
            const [idUser] = await conn.query(knex => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.insertOrUpdateOrders.test')

            const orders = [
                { id: 1, date: '2020-01-01', userId: idUser },
                { id: 2, date: '2020-01-02', userId: idUser },
                { id: 3, date: '2020-01-03', userId: idUser },
            ]

            await sut.insertOrUpdateOrders(orders)

            const queryResult = await conn.query(knex => knex('orders'), 'OrderRepository.insertOrUpdateOrders.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].id).toBe(1)
            expect(queryResult[0].userId).toBe(idUser)
            expect(queryResult[0].date).toStrictEqual(new Date(2020, 0, 1))
            expect(queryResult[1].date).toStrictEqual(new Date(2020, 0, 2))
            expect(queryResult[2].date).toStrictEqual(new Date(2020, 0, 3))

            const mergeOrders = [{ id: 1, date: '2020-01-09', userId: idUser }]

            await sut.insertOrUpdateOrders(mergeOrders)

            const mergedResult = await conn.query(knex => knex('orders').where('id', 1).first(), 'OrderRepository.insertOrUpdateOrders.test')
            expect(mergedResult.id).toBe(1)
            expect(mergedResult.date).toStrictEqual(new Date(2020, 0, 9))
        })
    })

    describe('insertOrUpdateProducts', () => {
        it('should insert all the orders', async () => {
            const [idUser] = await conn.query(knex => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.insertOrUpdateProducts.test')
            const [idOrder] = await conn.query(knex => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.insertOrUpdateProducts.test')

            const products = [
                { id: 1, value: 1.11, orderId: idOrder },
                { id: 2, value: 2.22, orderId: idOrder },
                { id: 3, value: 3.33, orderId: idOrder },
            ]

            await sut.insertOrUpdateProducts(products)

            const queryResult = await conn.query(knex => knex('products'), 'OrderRepository.insertOrUpdateProducts.test')
            expect(queryResult.length).toBe(3)
            expect(queryResult[0].id).toBe(1)
            expect(queryResult[0].orderId).toBe(idOrder)
            expect(queryResult[0].value).toBe(1.11)
            expect(queryResult[1].value).toBe(2.22)
            expect(queryResult[2].value).toBe(3.33)

            const mergeProduct = [{ id: 1, value: 9.99, orderId: idOrder }]

            await sut.insertOrUpdateProducts(mergeProduct)

            const mergedResult = await conn.query(knex => knex('products').where('id', 1).first(), 'OrderRepository.insertOrUpdateProducts.test')
            expect(mergedResult.id).toBe(1)
            expect(mergedResult.value).toBe(9.99)
        })
    })
})