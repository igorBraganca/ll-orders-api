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
            expect(result[0].userId).toBe(70)
            expect(result[0].userName).toBe('Palmer Prosacco')
            expect(result[0].orderId).toBe(753)
            expect(result[0].prodId).toBe(3)
            expect(result[0].value).toBe('1836.74')
            expect(result[0].date).toBe('2021-03-08')
        });
    });

    describe('normalize', () => {
        it('should return a list of order', () => {
            const { sut } = makeSut()

            const buffer = readFileSync('./data/data_1.txt')
            const data = sut.parseFile(buffer)
            const result = sut.normalize(data)

            console.log(result)
        });
    });
});
