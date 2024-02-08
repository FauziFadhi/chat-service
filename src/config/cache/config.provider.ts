import { Injectable } from '@nestjs/common';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';

import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigProvider implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      host: this.configService.get<string>('CACHE_HOST'),
      port: this.configService.get<number>('CACHE_PORT'),
      password: this.configService.get<string>('CACHE_PASSWORD'),
      prefix: this.configService.get<string>('CACHE_PREFIX'),
    };
  }
}
