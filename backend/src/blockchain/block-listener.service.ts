import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ethers } from "ethers";
import { ConfigService } from "@nestjs/config";
import { BlockchainService } from "./blockchain.service";

@Injectable()
export class BlockListenerService implements OnModuleInit {
    private provider: ethers.JsonRpcProvider;
    private readonly config: any;
    private readonly logger = new Logger(BlockListenerService.name);

    constructor(
        private configService: ConfigService,
        private blockchainService: BlockchainService,
    ) {
        this.config = this.configService.get('appConfig');
        this.provider = new ethers.JsonRpcProvider(this.config.WS_JSON_RPC);
    }

    onModuleInit() {
        this.startListening();
    }

    startListening() {
        this.provider.on('block', async (blockNumber) => {
            this.logger.log(`New block ${blockNumber} received`);
            await this.blockchainService.parseBlock(await this.provider.getBlock(blockNumber));
        });
    }
}