import { Controller, Get, HttpStatus, Param, Res } from "@nestjs/common";
import { OrderService } from "@src/service/order.service";
import { Response } from "express";

@Controller('orders')
export class OrdersController {

    constructor(private readonly orderService: OrderService) { }

    @Get(':id')
    async get(@Param('id') id: string, @Res() response: Response) {
        if (!this.isNumeric(id)) {
            response.status(HttpStatus.BAD_REQUEST).send({
                error: {
                    message: 'id must be an integer'
                }
            })
            return
        }

        const result = await this.orderService.findOrderById(Number(id))
        if (result) {
            response.status(HttpStatus.OK).send(result)
            return
        }

        response.status(HttpStatus.NOT_FOUND).send({
            error: {
                message: 'order not founded'
            }
        })
    }

    private isNumeric(value: string) {
        return /^-?\d+$/.test(value);
    }
}