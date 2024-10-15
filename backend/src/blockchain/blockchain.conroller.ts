import { Controller, Get, Param } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller('blockchain')
export class BlockchainController {
    constructor(private blockchainService: BlockchainService) {}

    @Get()
    getHello(): string {
        return this.blockchainService.getHello();
    }

    // 获取指定高度区块的增加的奖励
    @Get('reward/:height')
    async getRewardByHeight(@Param('height') height: number ): Promise<string> {
        return this.blockchainService.getRewardByHeight(height);
    }

    // 获取当前未提取的奖励总数
    @Get('unwithdrawed')
    async getTotalReward(): Promise<string> {
        return this.blockchainService.getUnwithdrawedRewards();
    }

    // 获取最新区块高度
    @Get('block/latest')
    async getLatestBlock(): Promise<string> {
        return this.blockchainService.getLatestBlock();
    }

    // 获取最早的区块高度
    @Get('block/earliest')
    async getEarliestBlock(): Promise<string> {
        return this.blockchainService.getEarliestBlock();
    }
}