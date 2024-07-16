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

    describe('/orders (GET)', () => {
        it('(200) should return all orders', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrderById.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrderById.test')

            const response = await request(app.getHttpServer()).get('/orders')

            expect(response.statusCode).toBe(200)

            const data = response.body
            expect(data.length).toBe(2)
            expect(data[0].order_id).toBe(idOrder1)
            expect(data[0].date).toBe('2020-01-01')
            expect(data[0].total).toBe('4.44')
            expect(data[0].user.user_id).toBe(idUser)
            expect(data[0].user.name).toBe('teste_1')
            expect(data[0].products[0].product_id).toBe(1)
            expect(data[0].products[0].value).toBe('1.11')
            expect(data[0].products[1].product_id).toBe(3)
            expect(data[0].products[1].value).toBe('3.33')
        })

        it('(200) should return orders filtered by order_id', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrderById.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrderById.test')

            const response = await request(app.getHttpServer()).get('/orders?order_id=1')

            expect(response.statusCode).toBe(200)

            const data = response.body
            expect(data.length).toBe(1)
            expect(data[0].order_id).toBe(idOrder1)
            expect(data[0].date).toBe('2020-01-01')
            expect(data[0].total).toBe('4.44')
            expect(data[0].user.user_id).toBe(idUser)
            expect(data[0].user.name).toBe('teste_1')
            expect(data[0].products[0].product_id).toBe(1)
            expect(data[0].products[0].value).toBe('1.11')
            expect(data[0].products[1].product_id).toBe(3)
            expect(data[0].products[1].value).toBe('3.33')
        })

        it('(200) should return orders filtered by date', async () => {
            const [idUser] = await conn.query((knex: Knex) => knex('users').insert({ id: 1, name: 'teste_1' }), 'OrderRepository.findOrderById.test')
            const [idOrder1] = await conn.query((knex: Knex) => knex('orders').insert({ id: 1, date: '2020-01-01', userId: idUser }), 'OrderRepository.findOrderById.test')
            const [idOrder2] = await conn.query((knex: Knex) => knex('orders').insert({ id: 2, date: '2020-01-09', userId: idUser }), 'OrderRepository.findOrderById.test')
            await conn.query((knex: Knex) => knex('order_product').insert([
                { productId: 1, value: 1.11, orderId: idOrder1 },
                { productId: 2, value: 2.22, orderId: idOrder2 },
                { productId: 3, value: 3.33, orderId: idOrder1 },
            ]), 'OrderRepository.findOrderById.test')

            const response = await request(app.getHttpServer()).get('/orders?start_date=2020-01-08&end_date=2020-01-10')

            expect(response.statusCode).toBe(200)

            const data = response.body
            expect(data.length).toBe(1)
            expect(data[0].order_id).toBe(idOrder2)
            expect(data[0].date).toBe('2020-01-09')
            expect(data[0].total).toBe('2.22')
            expect(data[0].user.user_id).toBe(idUser)
            expect(data[0].user.name).toBe('teste_1')
            expect(data[0].products[0].product_id).toBe(2)
            expect(data[0].products[0].value).toBe('2.22')
        })

        it('(400) should return bad request for invalid order_id', async () => {
            const response = await request(app.getHttpServer()).get('/orders?order_id=a')

            expect(response.statusCode).toBe(400)
            expect(response.body).toStrictEqual({
                errors: [{
                    message: 'order_id must be an integer'
                }]
            })
        })

        it('(400) should return bad request for start_date or end_date not defined', async () => {
            const response = await request(app.getHttpServer()).get('/orders?start_date=a')

            expect(response.statusCode).toBe(400)
            expect(response.body).toStrictEqual({
                errors: [
                    {
                        message: 'both, start_date and end_date, must be defined'
                    },
                    {
                        message: "start_date must be in format yyyy-mm-dd",
                    }
                ]
            })

            const response2 = await request(app.getHttpServer()).get('/orders?end_date=a')

            expect(response2.statusCode).toBe(400)
            expect(response2.body).toStrictEqual({
                errors: [
                    {
                        message: 'both, start_date and end_date, must be defined'
                    },
                    {
                        message: "end_date must be in format yyyy-mm-dd",
                    }
                ]
            })
        })

        it('(400) should return bad request for invalid start_date or end_date', async () => {
            const response = await request(app.getHttpServer()).get('/orders?start_date=a&end_date=2020-10-10')

            expect(response.statusCode).toBe(400)
            expect(response.body).toStrictEqual({
                errors: [{
                    message: 'start_date must be in format yyyy-mm-dd'
                }]
            })

            const response2 = await request(app.getHttpServer()).get('/orders?start_date=2020-10-10&end_date=a')

            expect(response2.statusCode).toBe(400)
            expect(response2.body).toStrictEqual({
                errors: [{
                    message: 'end_date must be in format yyyy-mm-dd'
                }]
            })
        })
    })

})
