import { Controller, Get, HttpStatus, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { OrderService } from '@src/service/order.service'
import { Response } from 'express'

@Controller('orders')
export class ParseOrdersController {
    constructor(private readonly orderService: OrderService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('orders'))
    async upload(@UploadedFile() orders: Express.Multer.File, @Res() response: Response) {
        if (!orders) {
            response.status(HttpStatus.BAD_REQUEST).send({
                error: {
                    message: 'orders is required'
                }
            })
            return
        }

        const parsedData = this.orderService.parseFile(orders.buffer)
        const normalizedUsers = this.orderService.normalize(parsedData)

        await this.orderService.persiste(normalizedUsers)

        response.status(HttpStatus.OK).send(normalizedUsers.map((u) => u.toDTO()))
    }
}
