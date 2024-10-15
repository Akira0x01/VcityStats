import ValidatorReward from "./ValidatorReward";

interface TotalReward {
    denom: string;
    amount: string;
}

interface DelegatorRewardsResponse {
    rewards: ValidatorReward[];
    total: TotalReward[];
}

export default DelegatorRewardsResponse;