import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import config from './config';
import schema from './schema';
import { KAFKA } from '@chat/constant';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      expandVariables: true,
      validationSchema: schema,
    }),
    ClientsModule.registerAsync([
      {
        name: KAFKA.CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const kafkaConfig = configService.get('kafka');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: kafkaConfig.brokers,
                clientId: kafkaConfig.serviceName,
                ssl: process.env.ENV !== 'local',
                sasl: {
                  username: kafkaConfig.username,
                  password: kafkaConfig.password,
                  mechanism: kafkaConfig.mechanism
                    ? kafkaConfig.mechanism
                    : 'plain',
                },
              },
              producer: {
                idempotent: true,
              },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaConfigModule {}
