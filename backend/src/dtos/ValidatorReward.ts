import Reward from "src/dtos/Reward";

interface ValidatorReward {
    address: string;
    reward: Reward[];
}

export default ValidatorReward;