import * as Joi from 'joi';

export default Joi.object({
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CONSUMER_GROUP: Joi.string().required(),
  KAFKA_SERVICE_NAME: Joi.string().required(),
});
