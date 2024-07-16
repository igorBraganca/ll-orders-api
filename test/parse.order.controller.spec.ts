import { Test, TestingModule } from '@nestjs/testing'
import { ConsoleLogger, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DBConnection } from '@src/libs/db.connection'

afterAll(() => {
    DBConnection.disconnectAll()
})

describe('ParseOrdersController (e2e)', () => {
    let app: INestApplication

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        // module.useLogger(new ConsoleLogger());

        app = module.createNestApplication()
        await app.init()
    })

    it('/orders/upload (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/orders/upload')
            .attach('orders', 'data/data_1.txt')

        expect(response.statusCode).toBe(200)

        const data = response.body
        expect(data.length).toBe(100)

        const firstUser = data[0]
        expect(firstUser.user_id).toBe(1)
        expect(firstUser.name).toBe('Sammie Baumbach')
        expect(firstUser.orders.length).toBe(15)

        const firstOrder = firstUser.orders[0]
        expect(firstOrder.order_id).toBe(2)
        expect(firstOrder.date).toBe('2021-10-28')
        expect(firstOrder.total).toBe('2966.46')
        expect(firstOrder.products.length).toBe(3)
        expect(firstOrder.products[0].product_id).toBe(2)
        expect(firstOrder.products[0].value).toBe('601.43')
        expect(firstOrder.products[1].product_id).toBe(2)
        expect(firstOrder.products[1].value).toBe('798.03')
        expect(firstOrder.products[2].product_id).toBe(5)
        expect(firstOrder.products[2].value).toBe('1567.00')
    })

    it('/orders/upload (POST) error', async () => {
        const response = await request(app.getHttpServer())
            .post('/orders/upload')

        expect(response.statusCode).toBe(400)
        expect(response.body).toStrictEqual({
            error: {
                message: 'orders is required'
            }
        })
    })
})
