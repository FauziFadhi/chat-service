import { Injectable } from '@nestjs/common';
import { Client } from 'cassandra-driver';

Injectable();
export class CassandraClient extends Client {}
