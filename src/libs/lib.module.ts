import { Module } from "@nestjs/common";
import { DBConnection } from "@src/libs/db.connection";

const connectionProvider = {
    provide: 'DEFAULT_CONN',
    useFactory: () => {
        return new DBConnection('projectDB')
    },
};

@Module({
    providers: [connectionProvider],
    exports: [connectionProvider],
})
export class LibModule { }