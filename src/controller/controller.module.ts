import { Module } from '@nestjs/common'
import { OrdersController } from '@src/controller/orders-controller'
import { ParseOrdersController } from '@src/controller/parse-orders-controller'
import { ServiceModule } from '@src/service/service.module'

@Module({
    imports: [ServiceModule],
    controllers: [ParseOrdersController, OrdersController]
})
export class ControllerModule { }
