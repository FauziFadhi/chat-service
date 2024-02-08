import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import config from './config';
import { CacheConfigProvider } from './config.provider';
import schema from './schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: schema,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigProvider,
      imports: [ConfigModule],
    }),
  ],
  providers: [],
  exports: [CacheModule],
})
export class CacheConfigModule {}
