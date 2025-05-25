import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { ChargesModule } from './charges/charges.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './category/category.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { SupportTicketModule } from './support-ticket/support-ticket.module';
import { StatisticsModule } from './statistics/statistics.module';
import { MinioModule } from './minio/minio.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        logger: 'debug',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AdminsModule,
    OtpModule,
    AuthModule,
    ChargesModule,
    ProductsModule,
    CategoriesModule,
    UserActivityModule,
    SupportTicketModule,
    StatisticsModule,
    MinioModule,
    ImagesModule,
  ],
})
export class AppModule {}
