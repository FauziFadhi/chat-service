#!/bin/bash

# Define the keyspace name and replication strategy options
KEYSPACE="chat_service"
CONTAINER_NAME="wgw_cassandra_db"
REPLICATION="{'class':'SimpleStrategy', 'replication_factor':1}"

# Define the CQL query file
QUERY_FILE="database_ddl.cql"

# Define the CQL command to create the keyspace
CQL_COMMAND="CREATE KEYSPACE IF NOT EXISTS $KEYSPACE WITH REPLICATION = $REPLICATION;"

# Execute the CQL command using cqlsh
echo "Executing: $CQL_COMMAND"
docker exec -it $CONTAINER_NAME cqlsh -e "$CQL_COMMAND"

echo "Keyspace $KEYSPACE created successfully."

docker exec -i "$CONTAINER_NAME" cqlsh < "$QUERY_FILE"

echo "database definition created successfully."
