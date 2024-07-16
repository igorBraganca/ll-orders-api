import { Controller, Get, HttpStatus, Param, Query, Res } from "@nestjs/common";
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

    @Get()
    async findAll(@Query() params: any, @Res() response: Response) {
        const errors = []
        if (params.order_id && !this.isNumeric(params.order_id)) {
            errors.push('order_id must be an integer')
        }
        if (!!params.start_date !== !!params.end_date) {
            errors.push('both, start_date and end_date, must be defined')
        }
        if (params.start_date && !this.isDate(params.start_date)) {
            errors.push('start_date must be in format yyyy-mm-dd')
        }
        if (params.end_date && !this.isDate(params.end_date)) {
            errors.push('end_date must be in format yyyy-mm-dd')
        }

        if (errors.length > 0) {
            response.status(HttpStatus.BAD_REQUEST).send({
                errors: errors.map(e => ({ message: e }))
            })
            return
        }

        const result = await this.orderService.filterOrders({
            orderId: params.order_id ? Number(params.order_id) : undefined,
            startDate: params.start_date ? new Date(params.start_date) : undefined,
            endDate: params.end_date ? new Date(params.end_date) : undefined,
        })
        response.status(HttpStatus.OK).send(result)
    }

    private isNumeric(value: string) {
        return /^-?\d+$/.test(value);
    }

    private isDate(value: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
}