import { Module } from '@nestjs/common'
import { ParseOrdersController } from '@src/controller/parse-orders-controller'
import { OrderService } from '@src/service/order.service'

@Module({
    imports: [],
    controllers: [ParseOrdersController],
    providers: [OrderService],
})
export class AppModule {}
