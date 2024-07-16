import { Module } from '@nestjs/common'
import { RepositoryModule } from '@src/repository/repository.module'
import { OrderService } from '@src/service/order.service'
@Module({
    imports: [RepositoryModule],
    providers: [OrderService],
    exports:[OrderService]
})
export class ServiceModule { }
