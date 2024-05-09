import { connect, keyStores, utils } from 'near-api-js';

const keyStore = new keyStores.InMemoryKeyStore();

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

function calculateMedian(values) {
    const sortedValues = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
        return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    } else {
        return sortedValues[mid];
    }
}

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

    console.log("\nAll the results --------------------------------------------\n");

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

    console.log("\nActive nodes -----------------------------------------------\n");

    const successfulResults = results.filter(result => result.status === 'fulfilled' && !result.value.error);

    successfulResults.forEach(result => {
        const { providerName, latestBlockHeight } = result.value;
        console.log(`Provider: ${providerName}, Latest Block Height: ${latestBlockHeight}`)
    });


    // delayed nodes

    const latestBlockHeights = successfulResults.map(x => x.value.latestBlockHeight);
    const medianBlockHeight = calculateMedian(latestBlockHeights);
    console.log(`\nMedian Block Height: ${medianBlockHeight}`)


    console.log("\nDelayed nodes ----------------------------------------------\n");


    const deviationThreshold = 10;
    const delayedResults = successfulResults.filter(result => Math.abs(result.value.latestBlockHeight - medianBlockHeight) > deviationThreshold);

    delayedResults.forEach(result => {
        const { providerName, latestBlockHeight } = result.value;
        console.log(`Provider: ${providerName}, Latest Block Height: ${latestBlockHeight}`)
    });
}

getLatestBlockOnEveryProvider();
