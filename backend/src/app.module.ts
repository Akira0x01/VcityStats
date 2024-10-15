import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { BlockchainModule } from './blockchain/blockchain.module';
import { BlockListenerService } from './blockchain/block-listener.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockEntity } from './entities/block.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [BlockEntity],
      synchronize: true,
    }),
    BlockchainModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
