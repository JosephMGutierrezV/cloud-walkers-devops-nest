import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheManagerModule } from './cacheManager';
import { ICustomOptions } from './common/interfaces/interfaces';
import { LoggerModule } from './log';
import { MailModule } from './mail/mail.module';
import { RabbitMQModule } from './rabbitMQ';

@Module({})
export class CloudWalkersModule {
  static forRoot(options: ICustomOptions): DynamicModule {
    return {
      module: CloudWalkersModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: options.envFilePath,
          isGlobal: options.isGlobal,
          load: options.load,
          validationSchema: options.validationSchema,
        }),
        LoggerModule,
        CacheManagerModule,
        RabbitMQModule,
        MailModule,
      ],
      controllers: [],
      providers: [],
      exports: [LoggerModule, CacheManagerModule, RabbitMQModule, MailModule],
    };
  }
}
