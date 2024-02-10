import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { engines } from '../package.json';
import { satisfies } from 'semver';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const nodeVersion = engines.node;
  if (!satisfies(process.version, nodeVersion)) {
    console.log(
      `Required node version ${nodeVersion} not satisfied with current version ${process.version}.`,
    );
    process.exit(0);
  }

  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const kafkaConfig = configService.get<any>('kafka');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaConfig.brokers,
        ssl: process.env.ENV !== 'local',
        sasl: {
          username: kafkaConfig.username,
          password: kafkaConfig.password,
          mechanism: kafkaConfig.mechanism ? kafkaConfig.mechanism : 'plain',
        },
      },
      consumer: {
        groupId: kafkaConfig.consumerGroup,
      },
    },
  });

  await app.listen(3000);
  app.startAllMicroservices();

  new Logger().log(
    `Your Application run in ${await app.getUrl()}`,
    'Nest Application',
  );
}
bootstrap();
