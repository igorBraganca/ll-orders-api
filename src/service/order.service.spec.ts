import { readFileSync } from "fs";
import { OrderService } from "./order.service";

function makeSut() {
    const sut = new OrderService()
    return { sut }
}

describe('OrderService', () => {
    describe('parseFile', () => {
        it('should return a list of order', () => {
            const { sut } = makeSut()

            const buffer = readFileSync('./data/data_1.txt')
            const result = sut.parseFile(buffer)

            expect(result.length).toBe(2352)

            const firstLine = result[0]

            expect(firstLine.userId).toBe(70)
            expect(firstLine.userName).toBe('Palmer Prosacco')
            expect(firstLine.orderId).toBe(753)
            expect(firstLine.prodId).toBe(3)
            expect(firstLine.value).toBe('1836.74')
            expect(firstLine.date).toBe('2021-03-08')
        });
    });

    describe('normalize', () => {
        it('should return a list of order', () => {
            const { sut } = makeSut()

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
            expect(firstOrder.date).toBe('2021-10-28')
            expect(firstOrder.total).toBe(2966.46)
            expect(firstOrder.products.length).toBe(3)
            expect(firstOrder.products[0].id).toBe(2)
            expect(firstOrder.products[1].id).toBe(2)
            expect(firstOrder.products[2].id).toBe(5)
        });
    });
});