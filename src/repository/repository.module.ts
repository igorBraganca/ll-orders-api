import { Module } from '@nestjs/common'
import { LibModule } from '@src/libs/lib.module'
import { OrderRepository } from '@src/repository/order.repository'

@Module({
    imports: [LibModule],
    providers: [OrderRepository],
    exports: [OrderRepository]
})
export class RepositoryModule { }
