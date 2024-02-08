import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { engines } from '../package.json';
import { satisfies } from 'semver';
import { Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const nodeVersion = engines.node;
  if (!satisfies(process.version, nodeVersion)) {
    console.log(
      `Required node version ${nodeVersion} not satisfied with current version ${process.version}.`,
    );
    process.exit(0);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('api');

  new Logger().log(
    `Your Application run in ${await app.getUrl()}`,
    'Nest Application',
  );
}
bootstrap();
