import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { OrderService } from '@src/service/order.service'

@Controller('orders')
export class ParseOrdersController {
    constructor(private readonly orderService: OrderService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('orders'))
    upload(@UploadedFile() orders: Express.Multer.File) {
        const parsedData = this.orderService.parseFile(orders.buffer)
        const normalizedUsers = this.orderService.normalize(parsedData)
        return normalizedUsers.map((u) => u.toDTO())
    }
}
