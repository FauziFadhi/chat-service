import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  brokers: `${process.env.KAFKA_BROKERS}`?.split(',') || '',
  consumerGroup: process.env.KAFKA_CONSUMER_GROUP,
  serviceName: process.env.KAFKA_SERVICE_NAME,
  username: process.env.KAFKA_USERNAME,
  password: process.env.KAFKA_PASSWORD,
  mechanism: process.env.KAFKA_MECHANISM,
}));
