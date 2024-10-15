import { Module } from "@nestjs/common";
import { BlockchainController } from "./blockchain.conroller";
import { BlockchainService } from "./blockchain.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockEntity } from "src/entities/block.entity";
import { BlockListenerService } from "./block-listener.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [TypeOrmModule.forFeature([BlockEntity]), HttpModule],
    controllers: [BlockchainController],
    providers: [BlockchainService, BlockListenerService],
})

export class BlockchainModule {}