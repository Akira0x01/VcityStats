import { registerAs } from "@nestjs/config";

export default registerAs('appConfig', () => {
    return {
        WS_JSON_RPC: process.env.WS_JSON_RPC,
        EOA_ADDRESS: process.env.EOA_ADDRESS,
        BASE_DISTRIBUTION_URL: process.env.BASE_DISTRIBUTION_URL,
        HTTP_RPC: process.env.HTTP_RPC,
        DISTRIBUTION_ADDRESS: process.env.DISTRIBUTION_ADDRESS,
    }
})