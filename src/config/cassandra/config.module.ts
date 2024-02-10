import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import config from './config';
import schema from './schema';
import { CassandraClient } from './client';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: schema,
    }),
  ],
  providers: [
    {
      provide: CassandraClient,
      useFactory: (configService: ConfigService) => {
        return new CassandraClient({
          keyspace: configService.get('cassandra.keyspace'),
          contactPoints: configService.getOrThrow('cassandra.hosts').split(','),
          localDataCenter: configService.getOrThrow('cassandra.datacenter'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [CassandraClient],
})
export class CassandraConfigModule {}
