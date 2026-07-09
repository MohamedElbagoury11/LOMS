import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPermissionOverride } from './entities/user-permission-override.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserPermissionOverride])],
    exports: [TypeOrmModule],
})
export class UserPermissionOverridesModule { }
