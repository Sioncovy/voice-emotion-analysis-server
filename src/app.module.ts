import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './servers/user/user.module';
import { AuthModule } from './servers/auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './servers/auth/jwt-auth.guard';
import { RolesGuard } from './servers/user/roles.guard';
import { AdviceModule } from './servers/advice/advice.module';
import { ShareModule } from './servers/share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    // 然后使用MongooseModule.forRoot动态读取数据库连接字符串
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService], // 注入ConfigService实例
    }),
    UserModule,
    AuthModule,
    AdviceModule,
    ShareModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
