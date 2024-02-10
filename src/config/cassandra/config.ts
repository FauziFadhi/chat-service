import { registerAs } from '@nestjs/config';

export default registerAs('cassandra', () => ({
  hosts: process.env.CASSANDRA_NODE_HOSTS,
  datacenter: process.env.CASSANDRA_DATACENTER,
  keyspace: process.env.CASSANDRA_KEYSPACE,
}));
