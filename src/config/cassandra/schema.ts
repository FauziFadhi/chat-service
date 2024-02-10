import * as Joi from 'joi';

export default Joi.object({
  CASSANDRA_KEYSPACE: Joi.string().required(),
  CASSANDRA_DATACENTER: Joi.string().required(),
  CASSANDRA_NODE_HOSTS: Joi.string().required(),
});
