import { Module } from '@nestjs/common'
import { ControllerModule } from '@src/controller/controller.module'
import { ParseOrdersController } from '@src/controller/parse-orders-controller'

@Module({
    imports: [ControllerModule]
})
export class AppModule { }
