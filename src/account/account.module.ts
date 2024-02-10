import { Module } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { AccountController } from './controllers/account.controller';
import { CassandraConfigModule } from '@config/cassandra/config.module';

@Module({
  imports: [CassandraConfigModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
