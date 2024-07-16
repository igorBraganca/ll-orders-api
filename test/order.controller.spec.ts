import { Test, TestingModule } from '@nestjs/testing'
import { ConsoleLogger, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DBConnection } from '@src/libs/db.connection'
import { TestHelper } from '@test/utils/test.helper'
import { Knex } from 'knex'

afterAll(() => {
    DBConnection.disconnectAll()
})

describe('OrdersController (e2e)', () => {
    let app: INestApplication
    let conn: DBConnection

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        // module.useLogger(new ConsoleLogger());

        conn = module.get<DBConnection>('DEFAULT_CONN')
        await TestHelper.cleanDatabase(conn)

        app = module.createNestApplication()
        await app.init()
    })

    describe('/orders/:id (GET)', () => {
        it('(200) should return the order', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrderById.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrderById.test')

            const response = await request(app.getHttpServer()).get('/orders/1')

            expect(response.statusCode).toBe(200)

            const data = response.body
            expect(data.order_id).toBe(idOrder1)
            expect(data.date).toBe('2020-01-01')
            expect(data.total).toBe('4.44')
            expect(data.user.user_id).toBe(idUser)
            expect(data.user.name).toBe('teste_1')
            expect(data.products[0].product_id).toBe(1)
            expect(data.products[0].value).toBe('1.11')
            expect(data.products[1].product_id).toBe(3)
            expect(data.products[1].value).toBe('3.33')
        })

        it('(404) should return not found', async () => {
            const response = await request(app.getHttpServer()).get('/orders/1')

            expect(response.statusCode).toBe(404)
            expect(response.body).toStrictEqual({
                error: {
                    message: 'order not founded'
                }
            })
        })

        it('(400) should return bad request', async () => {
            const response = await request(app.getHttpServer()).get('/orders/s')

            expect(response.statusCode).toBe(400)
            expect(response.body).toStrictEqual({
                error: {
                    message: 'id must be an integer'
                }
            })
        })
    })

})
