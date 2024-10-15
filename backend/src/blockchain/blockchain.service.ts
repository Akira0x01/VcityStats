import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ethers } from "ethers";
import { BlockEntity } from "src/entities/block.entity";
import { HttpService } from "@nestjs/axios";
import { AddressTransformer } from "src/utils/addressTransformer";
import DelegatorRewardsResponse from "src/dtos/DelegatorRewardsResponse";

@Injectable()
export class BlockchainService {
    private readonly config: any;
    private readonly logger = new Logger(BlockchainService.name);
    
    constructor(
        private configService: ConfigService,
        @InjectRepository(BlockEntity)
        private blockRepository: Repository<BlockEntity>,
        private readonly httpService: HttpService,
    ) { this.config = this.configService.get('appConfig'); }

    getHello(): string {
        return 'Hello Blockchain!';
    }

    async parseBlock(block: ethers.Block) {
        let blockEntity: BlockEntity = new BlockEntity();
        blockEntity.hash = block.hash;
        blockEntity.height = block.number;
        blockEntity.time = block.timestamp;
        blockEntity.txlength = block.transactions.length;
        blockEntity.miner = block.miner;
        await this.saveBlock(blockEntity);
    }

    async saveBlock(block: BlockEntity): Promise<BlockEntity> {
        block.eoaAddress = this.config.EOA_ADDRESS;
        // save block to database
        try {
            this.logger.log(`Saving block ${block.height}`);
            let total = await this.getDelegatorRewards(this.config.EOA_ADDRESS);
            total = parseFloat(total).toFixed(8);
            if (!total) {
                this.logger.error(`Error getting delegator rewards for ${this.config.EOA_ADDRESS}`);
                return null;
            }
            block.cumulativeReward = total;
            // 判断数据库中是否存在至少一个区块
            const blocks = await this.blockRepository.find({
                order: {
                    height: 'DESC'
                },
                take: 1
            });

            if (blocks.length > 0) {
                const lastBlock = blocks[blocks.length - 1];
                const reward = ethers.parseUnits(total, 18) - ethers.parseUnits(lastBlock.cumulativeReward.toString(), 18);
                if (reward < 0) { 
                    block.reward = '0';
                    block.isWithdraw = true;
                } else {
                    const newReward = ethers.formatUnits(reward, 18);
                    block.reward = newReward;
                }
            } else {
                block.reward = total;
            }

            await this.blockRepository.save(block);
        } catch (error) {
            this.logger.error(`Error saving block ${block.height}, error: ${error}`);
        }
        return block;
    }

    // 查询delegator所有的奖励
    async getDelegatorRewards(eoaAddress: string): Promise<string | null> {
        let delegatorAddress = AddressTransformer.eip55HexToBech32(eoaAddress);
        if (!delegatorAddress) {
            this.logger.error(`Invalid delegator address ${eoaAddress}`);
            return null;
        }
        try {
            const url = `${this.config.HTTP_RPC}${this.config.BASE_DISTRIBUTION_URL}delegators/${delegatorAddress}/rewards`;
            this.logger.log(`Getting delegator rewards by url: ${url}`);
            const response = await this.httpService.get(url).toPromise();
            const rewardsData: DelegatorRewardsResponse = response.data;
            const amout = ethers.toBigInt(rewardsData.total[0].amount.toString().split('.')[0]);
            const total = ethers.formatUnits(amout, 18);
            this.logger.log(`Delegator total rewards: ${total.toString()} vcity`);
            return total;
        } catch (error) {
            this.logger.error(`Error getting delegator rewards for ${delegatorAddress}, error: ${error}`);
            return null;
        }
    }

    // 根据高度查询奖励
    async getRewardByHeight(height: number): Promise<string | null> {
        try {
            const block = await this.blockRepository.findOne({ 
                where: { height: height }
             });
            if (!block) {
                this.logger.error(`Block ${height} not found`);
                return null;
            }
            return block.reward;
        } catch (error) {
            this.logger.error(`Error getting reward for block ${height}, error: ${error}`);
            return null;
        }
    }

    // 查询当前未提取的奖励总数
    async getUnwithdrawedRewards(): Promise<string | null> {
        try {
            const blocks = await this.blockRepository.find({
                order: {
                    height: 'DESC'
                },
                take: 1
            });
            if (blocks.length === 0) {
                this.logger.error(`No blocks found`);
                return null;
            }
            return blocks[0].cumulativeReward;
        } catch (error) {
            this.logger.error(`Error getting unwithdrawed rewards, error: ${error}`);
            return null;
        }
    }

    async getLatestBlock(): Promise<string | null> {
        try {
            const blocks = await this.blockRepository.find({
                order: {
                    height: 'DESC'
                },
                take: 1
            });
            if (blocks.length === 0) {
                this.logger.error(`No blocks found`);
                return null;
            }
            return blocks[0].height.toString();
        } catch (error) {
            this.logger.error(`Error getting latest block, error: ${error}`);
            return null;
        }
    }

    async getEarliestBlock(): Promise<string | null> {
        try {
            const blocks = await this.blockRepository.find({
                order: {
                    height: 'ASC'
                },
                take: 1
            });
            if (blocks.length === 0) {
                this.logger.error(`No blocks found`);
                return null;
            }
            return blocks[0].height.toString();
        } catch (error) {
            this.logger.error(`Error getting earliest block, error: ${error}`);
            return null;
        }
    }
}