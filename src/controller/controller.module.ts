import { Module } from '@nestjs/common'
import { ParseOrdersController } from '@src/controller/parse-orders-controller'
import { ServiceModule } from '@src/service/service.module'

@Module({
    imports: [ServiceModule],
    controllers: [ParseOrdersController]
})
export class ControllerModule { }
