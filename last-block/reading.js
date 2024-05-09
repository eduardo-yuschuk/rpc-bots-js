import { connect, keyStores, utils } from 'near-api-js';
//import dotenv from 'dotenv';
//dotenv.config();

//const privateKey = process.env.PRIVATE_KEY
//const keyPair = utils.KeyPair.fromString(privateKey);

const keyStore = new keyStores.InMemoryKeyStore();
//keyStore.setKey('testnet', 'example-account.testnet', keyPair);

const providers = {
    "NEAR": "https://rpc.mainnet.near.org",
    "Pagoda": "https://near-mainnet.api.pagoda.co/rpc/v1",
    "1RPC": "https://1rpc.io/near",
    "All That Node": "https://near-mainnet-rpc.allthatnode.com:3030", // provide API KEY
    "ankr.com": "https://rpc.ankr.com/near",
    "BlockPi": "https://public-rpc.blockpi.io/http/near",
    "dRPC": "https://near.drpc.org",
    "fast-near web4": "https://rpc.web4.near.page",
    "FASTNEAR Free": "https://free.rpc.fastnear.com",
    "Gateway.fm": "https://rpc.near.gateway.fm/",
    "GetBlock": "https://getblock.io/nodes/near/",
    "Lava Network": "https://near.lava.build",
    "Lavender.Five Nodes": "https://near.lavenderfive.com/",
    "NodeReal": "https://nodereal.io/api-marketplace/near-rpc",
    "NOWNodes": "https://near.nownodes.io/", // provide API KEY
    "OMNIA": "https://endpoints.omniatech.io/v1/near/mainnet/public",
    "Seracle": "https://api.seracle.com/saas/baas/rpc/near/mainnet/public"
};

// const config = {
//     keyStore,
//     networkId: 'mainnet',
//     nodeUrl: 'https://rpc.mainnet.near.org',
//     walletUrl: 'https://wallet.mainnet.near.org',
//     helperUrl: 'https://helper.mainnet.near.org',
//     explorerUrl: 'https://explorer.mainnet.near.org'
// };

async function getLatestBlockOnEveryProvider() {

    const promises = Object.entries(providers).map(([providerName, providerUrl]) => {
        const config = {
            networkId: 'mainnet',
            nodeUrl: providerUrl,
        };

        return (async () => {
            try {
                const near = await connect(config)
                const latestBlock = await near.connection.provider.status();
                return { providerName, latestBlockHeight: latestBlock.sync_info.latest_block_height };
            } catch (error) {
                return { providerName, error: error.message };
            }
        })();
    });

    const results = await Promise.allSettled(promises);

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            const { providerName, latestBlockHeight, error } = result.value;
            if (error) {
                console.log(`Provider: ${providerName}, ERROR: ${error}`);
            } else {
                console.log(`Provider: ${providerName}, Latest Block Height: ${latestBlockHeight}`);
            }
        } else {
            const { providerName, error } = result.reason;
            console.error(`Provider: ${providerName}, Error: ${error}`);
        }
    });

}

getLatestBlockOnEveryProvider();
