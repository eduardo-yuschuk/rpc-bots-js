import sqlite3 from 'sqlite3';
import { connect, keyStores, utils } from 'near-api-js';

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

const getDatabase = () => {
    const db = new sqlite3.Database('measurements.db');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS LATEST_BLOCK (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT,
            block_height INTEGER,
            err TEXT
        )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        }
    });
    return db;
};




db.close();


(async () => {
    try {
        const db = getDatabase();

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

        const insertDataQuery = `
            INSERT INTO LATEST_BLOCK (PROVIDER, BLOCK_HEIGHT, ERROR) VALUES (?, ?, ?)
        `;

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { providerName, latestBlockHeight, error } = result.value;
                if (error) {
                    console.log(`Provider: ${providerName}, ERROR: ${error}`);

                    const provider = providerName;
                    const blockHeight = null;
                    const error = error.message;

                    db.run(insertDataQuery, [provider, blockHeight, error], (err) => {
                        if (err) {
                            console.error('Insertion error:', err.message);
                        } else {
                            console.log('Samples saved');
                        }
                    });

                } else {
                    console.log(`Provider: ${providerName}, Latest Block Height: ${latestBlockHeight}`);

                    const provider = providerName;
                    const blockHeight = latestBlockHeight;
                    const error = null;

                    db.run(insertDataQuery, [provider, blockHeight, error], (err) => {
                        if (err) {
                            console.error('Insertion error:', err.message);
                        } else {
                            console.log('Samples saved');
                        }
                    });
                }
            } else {
                const { providerName, error } = result.reason;
                console.error(`Provider: ${providerName}, Error: ${error}`);
            }
        });

    } catch (e) {
        // Deal with the fact the chain failed
    }
})();
