import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import * as moment from 'moment-timezone';

@Entity()
export class BlockEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hash: string;

    @Column()
    height: number;

    @Column()
    time: number;

    @Column()
    txlength: number;

    @Column()
    miner: string;

    @Column()
    eoaAddress: string;

    @Column({ type: 'integer' })
    reward: string;

    @Column({ type: 'integer' })
    cumulativeReward: string;

    @Column({ default: false })
    isWithdraw: boolean;

    @Column({ type: 'integer' })
    createdAt: Date;

    @BeforeInsert()
    updateTimestamp() {
        moment.tz.setDefault('Asia/Shanghai');
        this.createdAt = moment().toDate();
    }
}