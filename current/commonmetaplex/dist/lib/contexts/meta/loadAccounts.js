"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMultipleAccounts = exports.initMetadata = exports.metadataByMintUpdater = exports.processingAccounts = exports.makeSetter = exports.pullMetadataByKeys = exports.loadMetadataForCreator = exports.loadMetadataAndEditionsBySafetyDepositBoxes = exports.loadAuction = exports.loadBidsForAuction = exports.loadArtwork = exports.querySafetyDepositBoxByVault = exports.loadMetaDataAndEditionsForCreators = exports.loadPrizeTrackingTickets = exports.loadAuctionsForAuctionManagers = exports.loadAuctionManagers = exports.loadCreators = exports.loadPayoutTickets = exports.loadVaultsAndContentForAuthority = exports.loadAccounts = exports.loadMetadataForUsers = exports.loadStoreIndexers = exports.limitedLoadAccounts = exports.pullPage = exports.pullPages = exports.pullAuctionSubaccounts = exports.loadSafeteyDepositBoxesForVaults = exports.pullPayoutTickets = exports.pullYourMetadata = exports.pullStoreMetadata = exports.USE_SPEED_RUN = void 0;
const ids_1 = require("../../utils/ids");
const utils_1 = require("../../utils");
const models_1 = require("../../models");
const actions_1 = require("../../actions");
const lodash_1 = require("lodash");
const metaplex_1 = require("../../models/metaplex");
const web3_js_1 = require("@solana/web3.js");
const isMetadataPartOfStore_1 = require("./isMetadataPartOfStore");
const processAuctions_1 = require("./processAuctions");
const processMetaplexAccounts_1 = require("./processMetaplexAccounts");
const processMetaData_1 = require("./processMetaData");
const processVaultData_1 = require("./processVaultData");
const getEmptyMetaState_1 = require("./getEmptyMetaState");
const getMultipleAccounts_1 = require("../accounts/getMultipleAccounts");
const getAccountInfo_1 = require("../accounts/getAccountInfo");
const web3_1 = require("./web3");
const createPipelineExecutor_1 = require("../../utils/createPipelineExecutor");
const __1 = require("../..");
const MULTIPLE_ACCOUNT_BATCH_SIZE = 100;
exports.USE_SPEED_RUN = false;
const WHITELISTED_METADATA = ['98vYFjBYS9TguUMWQRPjy2SZuxKuUMcqR4vnQiLjZbte'];
const WHITELISTED_AUCTION = ['D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e'];
const AUCTION_TO_METADATA = {
    D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e: [
        '98vYFjBYS9TguUMWQRPjy2SZuxKuUMcqR4vnQiLjZbte',
    ],
};
const AUCTION_TO_VAULT = {
    D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e: '3wHCBd3fYRPWjd5GqzrXanLJUKRyU3nECKbTPKfVwcFX',
};
const WHITELISTED_AUCTION_MANAGER = [
    '3HD2C8oCL8dpqbXo8hq3CMw6tRSZDZJGajLxnrZ3ZkYx',
];
const WHITELISTED_VAULT = ['3wHCBd3fYRPWjd5GqzrXanLJUKRyU3nECKbTPKfVwcFX'];
const queryStoreIndexer = async (connection, updateState) => {
    let i = 0;
    let pageKey = await metaplex_1.getStoreIndexer(i);
    let account = await getAccountInfo_1.getAccountInfo(connection, pageKey);
    while (account) {
        pageKey = await metaplex_1.getStoreIndexer(i);
        account = await getAccountInfo_1.getAccountInfo(connection, pageKey);
        if (!account) {
            break;
        }
        processMetaplexAccounts_1.processMetaplexAccounts({
            pubkey: pageKey,
            account,
        }, updateState);
        i++;
    }
};
const pullStoreMetadata = async (connection, tempCache) => {
    const updateTemp = exports.makeSetter(tempCache);
    const loadMetadata = () => pullMetadataByCreators(connection, tempCache, updateTemp);
    const loadEditions = () => pullEditions(connection, updateTemp, tempCache, tempCache.metadata);
    console.log('-------->Loading all metadata for store.');
    await loadMetadata();
    await loadEditions();
    await postProcessMetadata(tempCache);
    console.log('-------->Metadata processing complete.');
    return tempCache;
};
exports.pullStoreMetadata = pullStoreMetadata;
const pullYourMetadata = async (connection, userTokenAccounts, tempCache) => {
    const updateTemp = exports.makeSetter(tempCache);
    console.log('--------->Pulling metadata for user.');
    let currBatch = [];
    let batches = [];
    const editions = [];
    for (let i = 0; i < userTokenAccounts.length; i++) {
        if (userTokenAccounts[i].info.amount.toNumber() == 1) {
            const edition = await actions_1.getEdition(userTokenAccounts[i].info.mint.toBase58());
            const newAdd = [
                await actions_1.getMetadata(userTokenAccounts[i].info.mint.toBase58()),
                edition,
            ];
            editions.push(edition);
            currBatch = currBatch.concat(newAdd);
            if (2 + currBatch.length >= MULTIPLE_ACCOUNT_BATCH_SIZE) {
                batches.push(currBatch);
                currBatch = [];
            }
        }
    }
    if (currBatch.length > 0 && currBatch.length <= MULTIPLE_ACCOUNT_BATCH_SIZE) {
        batches.push(currBatch);
    }
    console.log('------> From token accounts for user', 'produced', batches.length, 'batches of accounts to pull');
    for (let i = 0; i < batches.length; i++) {
        const accounts = await getMultipleAccounts_1.getMultipleAccounts(connection, batches[i], 'single');
        if (accounts) {
            console.log('------->Pulled batch', i, 'with', batches[i].length, 'accounts, processing....');
            for (let j = 0; j < accounts.keys.length; j++) {
                const pubkey = accounts.keys[j];
                await processMetaData_1.processMetaData({
                    pubkey,
                    account: accounts.array[j],
                }, updateTemp);
            }
        }
        else {
            console.log('------->Failed to pull batch', i, 'skipping');
        }
    }
    console.log('------> Pulling master editions for user');
    currBatch = [];
    batches = [];
    for (let i = 0; i < editions.length; i++) {
        if (1 + currBatch.length > MULTIPLE_ACCOUNT_BATCH_SIZE) {
            batches.push(currBatch);
            currBatch = [];
        }
        else if (tempCache.editions[editions[i]]) {
            currBatch.push(tempCache.editions[editions[i]].info.parent);
        }
    }
    if (currBatch.length > 0 && currBatch.length <= MULTIPLE_ACCOUNT_BATCH_SIZE) {
        batches.push(currBatch);
    }
    console.log('------> From token accounts for user', 'produced', batches.length, 'batches of accounts to pull');
    for (let i = 0; i < batches.length; i++) {
        const accounts = await getMultipleAccounts_1.getMultipleAccounts(connection, batches[i], 'single');
        if (accounts) {
            console.log('------->Pulled batch', i, 'with', batches[i].length, 'accounts, processing....');
            for (let j = 0; j < accounts.keys.length; j++) {
                const pubkey = accounts.keys[j];
                await processMetaData_1.processMetaData({
                    pubkey,
                    account: accounts.array[j],
                }, updateTemp);
            }
        }
        else {
            console.log('------->Failed to pull batch', i, 'skipping');
        }
    }
    await postProcessMetadata(tempCache);
    console.log('-------->User metadata processing complete.');
    return tempCache;
};
exports.pullYourMetadata = pullYourMetadata;
const pullPayoutTickets = async (connection, tempCache) => {
    const updateTemp = exports.makeSetter(tempCache);
    const forEach = (fn) => async (accounts) => {
        for (const account of accounts) {
            await fn(account, updateTemp);
        }
    };
    web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                dataSize: metaplex_1.MAX_PAYOUT_TICKET_SIZE,
            },
        ],
    }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts));
    return tempCache;
};
exports.pullPayoutTickets = pullPayoutTickets;
// export const pullPacks = async (
//   connection: Connection,
//   state: MetaState,
//   walletKey?: PublicKey | null,
// ): Promise<MetaState> => {
//   const updateTemp = makeSetter(state);
//   const forEach =
//     (fn: ProcessAccountsFunc) => async (accounts: AccountAndPubkey[]) => {
//       for (const account of accounts.flat()) {
//         await fn(account, updateTemp);
//       }
//     };
//   const store = programIds().store;
//   if (store) {
//     await getPackSets({ connection, storeId: store }).then(
//       forEach(processPackSets),
//     );
//   }
// // Fetch packs' cards
// const fetchCardsPromises = Object.keys(state.packs).map(packSetKey =>
//   getCardsByPackSet({ connection, packSetKey }),
// );
// await Promise.all(fetchCardsPromises).then(cards =>
//   cards.forEach(forEach(processPackCards)),
// );
// const packKeys = Object.keys(state.packs);
// // Fetch vouchers
// const fetchVouchersPromises = packKeys.map(packSetKey =>
//   getVouchersByPackSet({
//     connection,
//     packSetKey,
//   }),
// );
// await Promise.all(fetchVouchersPromises).then(vouchers =>
//   vouchers.forEach(forEach(processPackVouchers)),
// );
// // Fetch proving process if user connected wallet
// if (walletKey) {
//   const fetchProvingProcessPromises = packKeys.map(packSetKey =>
//     getProvingProcessByPackSetAndWallet({
//       connection,
//       packSetKey,
//       walletKey,
//     }),
//   );
//   await Promise.all(fetchProvingProcessPromises).then(provingProcess =>
//     provingProcess.forEach(forEach(processProvingProcess)),
//   );
// }
// const metadataKeys = Object.values(state.packCards).map(
//   ({ info }) => info.metadata,
// );
// const newState = await pullMetadataByKeys(connection, state, metadataKeys);
//   await pullEditions(
//     connection,
//     updateTemp,
//     newState,
//     metadataKeys.map(m => newState.metadataByMetadata[m]),
//   );
//   return newState;
// };
const loadSafeteyDepositBoxesForVaults = async (connection, vaults) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const response = await Promise.all(vaults.map(vault => pullSafetyDepositBoxAccountsForVault(connection, vault)));
    await forEachAccount(processVaultData_1.processVaultData)(response.flat());
    return state;
};
exports.loadSafeteyDepositBoxesForVaults = loadSafeteyDepositBoxesForVaults;
const pullSafetyDepositBoxAccountsForVault = async (connection, vault) => {
    return web3_1.getProgramAccounts(connection, ids_1.VAULT_ID, {
        filters: [
            {
                memcmp: {
                    offset: 1,
                    bytes: vault,
                },
            },
        ],
    });
};
// export const pullPack = async ({
//   connection,
//   state,
//   packSetKey,
//   walletKey,
// }: {
//   connection: Connection;
//   state: MetaState;
//   packSetKey: StringPublicKey;
//   walletKey: PublicKey | null;
// }): Promise<MetaState> => {
//   const updateTemp = makeSetter(state);
//   const packSet = await getPackSetByPubkey(connection, packSetKey);
//   processPackSets(packSet, updateTemp);
//   const packCards = await getCardsByPackSet({
//     connection,
//     packSetKey,
//   });
//   packCards.forEach(card => processPackCards(card, updateTemp));
//   if (walletKey) {
//     const provingProcess = await getProvingProcessByPackSetAndWallet({
//       connection,
//       packSetKey,
//       walletKey,
//     });
//     provingProcess.forEach(process =>
//       processProvingProcess(process, updateTemp),
//     );
//   }
//   // const metadataKeys = Object.values(
//   //   state.packCardsByPackSet[packSetKey] || {},
//   // ).map(({ info }) => info.metadata);
//   // const newState = await pullMetadataByKeys(connection, state, metadataKeys);
//   await pullEditions(
//     connection,
//     updateTemp,
//     newState,
//     metadataKeys.map(m => newState.metadataByMetadata[m]),
//   );
//   return newState;
// };
const pullAuctionSubaccounts = async (connection, auction, tempCache) => {
    var _a;
    const updateTemp = exports.makeSetter(tempCache);
    let cacheKey;
    try {
        cacheKey = await metaplex_1.getAuctionCache(auction);
    }
    catch (e) {
        console.log(e);
        console.log('Failed to get auction cache key');
        return tempCache;
    }
    const cache = (_a = tempCache.auctionCaches[cacheKey]) === null || _a === void 0 ? void 0 : _a.info;
    if (!cache) {
        console.log('-----> No auction cache exists for', auction, 'returning');
        return tempCache;
    }
    const forEach = (fn) => async (accounts) => {
        for (const account of accounts) {
            await fn(account, updateTemp);
        }
    };
    const auctionExtKey = await actions_1.getAuctionExtended({
        auctionProgramId: ids_1.AUCTION_ID,
        resource: cache.vault,
    });
    const promises = [
        // pull editions
        pullEditions(connection, updateTemp, tempCache, cache.metadata.map(m => tempCache.metadataByMetadata[m])),
        // pull auction data ext
        connection
            .getAccountInfo(ids_1.toPublicKey(auctionExtKey))
            .then(a => a
            ? processAuctions_1.processAuctions({ pubkey: auctionExtKey, account: a }, updateTemp)
            : null),
        // bidder metadata pull
        web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 32,
                        bytes: auction,
                    },
                },
            ],
        }).then(forEach(processAuctions_1.processAuctions)),
        // bidder pot pull
        web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 64,
                        bytes: auction,
                    },
                },
            ],
        }).then(forEach(processAuctions_1.processAuctions)),
        // safety deposit pull
        web3_1.getProgramAccounts(connection, ids_1.VAULT_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: cache.vault,
                    },
                },
            ],
        }).then(forEach(processVaultData_1.processVaultData)),
        // bid redemptions
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 10,
                        bytes: cache.auctionManager,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)),
        // bdis where you arent winner
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 2,
                        bytes: cache.auctionManager,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)),
        // safety deposit configs
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: cache.auctionManager,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)),
        // prize tracking tickets
        ...cache.metadata
            .map(md => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: md,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)))
            .flat(),
    ];
    await Promise.all(promises);
    console.log('---------->Pulled sub accounts for auction', auction);
    return tempCache;
};
exports.pullAuctionSubaccounts = pullAuctionSubaccounts;
const pullPages = async (connection) => {
    let i = 0;
    let pageKey = await metaplex_1.getStoreIndexer(i);
    let account = await connection.getAccountInfo(new web3_js_1.PublicKey(pageKey));
    const pages = [];
    while (account) {
        pages.push({
            info: metaplex_1.decodeStoreIndexer(account.data),
            pubkey: pageKey,
            account,
        });
        i++;
        pageKey = await metaplex_1.getStoreIndexer(i);
        account = await connection.getAccountInfo(new web3_js_1.PublicKey(pageKey));
    }
    return pages;
};
exports.pullPages = pullPages;
const pullPage = async (connection, page, tempCache, walletKey, shouldFetchNftPacks) => {
    const updateTemp = exports.makeSetter(tempCache);
    const forEach = (fn) => async (accounts) => {
        for (const account of accounts) {
            await fn(account, updateTemp);
        }
    };
    const pageKey = await metaplex_1.getStoreIndexer(page);
    const account = await connection.getAccountInfo(new web3_js_1.PublicKey(pageKey));
    if (account) {
        processMetaplexAccounts_1.processMetaplexAccounts({
            pubkey: pageKey,
            account,
        }, updateTemp);
        const newPage = tempCache.storeIndexer.find(s => s.pubkey == pageKey);
        const auctionCaches = await getMultipleAccounts_1.getMultipleAccounts(connection, (newPage === null || newPage === void 0 ? void 0 : newPage.info.auctionCaches) || [], 'single');
        if (auctionCaches && auctionCaches.keys.length) {
            console.log('-------->Page ', page, ' found', auctionCaches.keys.length, ' cached auction data');
            auctionCaches.keys.map((pubkey, i) => {
                processMetaplexAccounts_1.processMetaplexAccounts({
                    pubkey,
                    account: auctionCaches.array[i],
                }, updateTemp);
            });
            const batches = [];
            let currBatch = [];
            for (let i = 0; i < auctionCaches.keys.length; i++) {
                const cache = tempCache.auctionCaches[auctionCaches.keys[i]];
                const totalNewAccountsToAdd = cache.info.metadata.length + 3;
                if (totalNewAccountsToAdd + currBatch.length >
                    MULTIPLE_ACCOUNT_BATCH_SIZE) {
                    batches.push(currBatch);
                    currBatch = [];
                }
                else {
                    const newAdd = [
                        ...cache.info.metadata,
                        cache.info.auction,
                        cache.info.auctionManager,
                        cache.info.vault,
                    ];
                    currBatch = currBatch.concat(newAdd);
                }
            }
            if (currBatch.length > 0 &&
                currBatch.length <= MULTIPLE_ACCOUNT_BATCH_SIZE) {
                batches.push(currBatch);
            }
            console.log('------> From account caches for page', page, 'produced', batches.length, 'batches of accounts to pull');
            for (let i = 0; i < batches.length; i++) {
                const accounts = await getMultipleAccounts_1.getMultipleAccounts(connection, batches[i], 'single');
                if (accounts) {
                    console.log('------->Pulled batch', i, 'with', batches[i].length, 'accounts, processing....');
                    for (let i = 0; i < accounts.keys.length; i++) {
                        const pubkey = accounts.keys[i];
                        await processMetaplexAccounts_1.processMetaplexAccounts({
                            pubkey,
                            account: accounts.array[i],
                        }, updateTemp);
                        await processVaultData_1.processVaultData({
                            pubkey,
                            account: accounts.array[i],
                        }, updateTemp);
                        await processMetaData_1.processMetaData({
                            pubkey,
                            account: accounts.array[i],
                        }, updateTemp);
                        await processAuctions_1.processAuctions({
                            pubkey,
                            account: accounts.array[i],
                        }, updateTemp);
                    }
                }
                else {
                    console.log('------->Failed to pull batch', i, 'skipping');
                }
            }
            for (let i = 0; i < auctionCaches.keys.length; i++) {
                const auctionCache = tempCache.auctionCaches[auctionCaches.keys[i]];
                const metadata = auctionCache.info.metadata.map(s => tempCache.metadataByMetadata[s]);
                tempCache.metadataByAuction[auctionCache.info.auction] = metadata;
            }
        }
        // if (shouldFetchNftPacks) {
        //   await pullPacks(connection, tempCache, walletKey);
        // }
        if (page == 0) {
            console.log('-------->Page 0, pulling creators and store');
            await web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
                filters: [
                    {
                        dataSize: models_1.MAX_WHITELISTED_CREATOR_SIZE,
                    },
                ],
            }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts));
            const store = __1.programIds().store;
            if (store) {
                const storeAcc = await connection.getAccountInfo(store);
                if (storeAcc) {
                    await processMetaplexAccounts_1.processMetaplexAccounts({ pubkey: store.toBase58(), account: storeAcc }, updateTemp);
                }
            }
        }
        await postProcessMetadata(tempCache);
    }
    return tempCache;
};
exports.pullPage = pullPage;
const limitedLoadAccounts = async (connection) => {
    const tempCache = getEmptyMetaState_1.getEmptyMetaState();
    const updateTemp = exports.makeSetter(tempCache);
    const forEach = (fn) => async (accounts) => {
        for (const account of accounts) {
            await fn(account, updateTemp);
        }
    };
    const pullMetadata = async (metadata) => {
        const mdKey = new web3_js_1.PublicKey(metadata);
        const md = await connection.getAccountInfo(mdKey);
        const mdObject = actions_1.decodeMetadata(Buffer.from((md === null || md === void 0 ? void 0 : md.data) || new Uint8Array([])));
        const editionKey = await actions_1.getEdition(mdObject.mint);
        const editionData = await connection.getAccountInfo(new web3_js_1.PublicKey(editionKey));
        if (md) {
            //@ts-ignore
            md.owner = md.owner.toBase58();
            processMetaData_1.processMetaData({
                pubkey: metadata,
                account: md,
            }, updateTemp);
            if (editionData) {
                //@ts-ignore
                editionData.owner = editionData.owner.toBase58();
                processMetaData_1.processMetaData({
                    pubkey: editionKey,
                    account: editionData,
                }, updateTemp);
            }
        }
    };
    const pullAuction = async (auction) => {
        const auctionExtendedKey = await actions_1.getAuctionExtended({
            auctionProgramId: ids_1.AUCTION_ID,
            resource: AUCTION_TO_VAULT[auction],
        });
        const auctionData = await getMultipleAccounts_1.getMultipleAccounts(connection, [auction, auctionExtendedKey], 'single');
        if (auctionData) {
            auctionData.keys.map((pubkey, i) => {
                processAuctions_1.processAuctions({
                    pubkey,
                    account: auctionData.array[i],
                }, updateTemp);
            });
        }
    };
    const pullAuctionManager = async (auctionManager) => {
        const auctionManagerKey = new web3_js_1.PublicKey(auctionManager);
        const auctionManagerData = await connection.getAccountInfo(auctionManagerKey);
        if (auctionManagerData) {
            //@ts-ignore
            auctionManagerData.owner = auctionManagerData.owner.toBase58();
            processMetaplexAccounts_1.processMetaplexAccounts({
                pubkey: auctionManager,
                account: auctionManagerData,
            }, updateTemp);
        }
    };
    const pullVault = async (vault) => {
        const vaultKey = new web3_js_1.PublicKey(vault);
        const vaultData = await connection.getAccountInfo(vaultKey);
        if (vaultData) {
            //@ts-ignore
            vaultData.owner = vaultData.owner.toBase58();
            processVaultData_1.processVaultData({
                pubkey: vault,
                account: vaultData,
            }, updateTemp);
        }
    };
    const promises = [
        ...WHITELISTED_METADATA.map(md => pullMetadata(md)),
        ...WHITELISTED_AUCTION.map(a => pullAuction(a)),
        ...WHITELISTED_AUCTION_MANAGER.map(a => pullAuctionManager(a)),
        ...WHITELISTED_VAULT.map(a => pullVault(a)),
        // bidder metadata pull
        ...WHITELISTED_AUCTION.map(a => web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 32,
                        bytes: a,
                    },
                },
            ],
        }).then(forEach(processAuctions_1.processAuctions))),
        // bidder pot pull
        ...WHITELISTED_AUCTION.map(a => web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 64,
                        bytes: a,
                    },
                },
            ],
        }).then(forEach(processAuctions_1.processAuctions))),
        // safety deposit pull
        ...WHITELISTED_VAULT.map(v => web3_1.getProgramAccounts(connection, ids_1.VAULT_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: v,
                    },
                },
            ],
        }).then(forEach(processVaultData_1.processVaultData))),
        // bid redemptions
        ...WHITELISTED_AUCTION_MANAGER.map(a => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 9,
                        bytes: a,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts))),
        // safety deposit configs
        ...WHITELISTED_AUCTION_MANAGER.map(a => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: a,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts))),
        // prize tracking tickets
        ...Object.keys(AUCTION_TO_METADATA)
            .map(key => AUCTION_TO_METADATA[key]
            .map(md => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: md,
                    },
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)))
            .flat())
            .flat(),
        // whitelisted creators
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    dataSize: models_1.MAX_WHITELISTED_CREATOR_SIZE,
                },
            ],
        }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts)),
    ];
    await Promise.all(promises);
    await postProcessMetadata(tempCache);
    return tempCache;
};
exports.limitedLoadAccounts = limitedLoadAccounts;
const loadStoreIndexers = async (connection) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    await queryStoreIndexer(connection, updateState);
    return state;
};
exports.loadStoreIndexers = loadStoreIndexers;
const loadMetadataForUsers = async (connection, userTokenAccounts, whitelistedCreatorsByCreator) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateTemp = exports.makeSetter(state);
    console.log('--------->Pulling metadata for user.');
    let currBatch = [];
    let batches = [];
    const editions = [];
    for (let i = 0; i < userTokenAccounts.length; i++) {
        if (userTokenAccounts[i].info.amount.toNumber() == 1) {
            if (2 + currBatch.length > MULTIPLE_ACCOUNT_BATCH_SIZE) {
                batches.push(currBatch);
                currBatch = [];
            }
            else {
                const edition = await actions_1.getEdition(userTokenAccounts[i].info.mint.toBase58());
                const newAdd = [
                    await actions_1.getMetadata(userTokenAccounts[i].info.mint.toBase58()),
                    edition,
                ];
                editions.push(edition);
                currBatch = currBatch.concat(newAdd);
            }
        }
    }
    if (currBatch.length > 0 && currBatch.length <= MULTIPLE_ACCOUNT_BATCH_SIZE) {
        batches.push(currBatch);
    }
    console.log('------> From token accounts for user', 'produced', batches.length, 'batches of accounts to pull');
    for (let i = 0; i < batches.length; i++) {
        const accounts = await getMultipleAccounts_1.getMultipleAccounts(connection, batches[i], 'single');
        if (accounts) {
            console.log('------->Pulled batch', i, 'with', batches[i].length, 'accounts, processing....');
            for (let j = 0; j < accounts.keys.length; j++) {
                const pubkey = accounts.keys[j];
                await processMetaData_1.processMetaData({
                    pubkey,
                    account: accounts.array[j],
                }, updateTemp);
            }
        }
        else {
            console.log('------->Failed to pull batch', i, 'skipping');
        }
    }
    console.log('------> Pulling master editions for user');
    currBatch = [];
    batches = [];
    for (let i = 0; i < editions.length; i++) {
        if (1 + currBatch.length > MULTIPLE_ACCOUNT_BATCH_SIZE) {
            batches.push(currBatch);
            currBatch = [];
        }
        else if (state.editions[editions[i]]) {
            currBatch.push(state.editions[editions[i]].info.parent);
        }
    }
    if (currBatch.length > 0 && currBatch.length <= MULTIPLE_ACCOUNT_BATCH_SIZE) {
        batches.push(currBatch);
    }
    console.log('------> From token accounts for user', 'produced', batches.length, 'batches of accounts to pull');
    for (let i = 0; i < batches.length; i++) {
        const accounts = await getMultipleAccounts_1.getMultipleAccounts(connection, batches[i], 'single');
        if (accounts) {
            console.log('------->Pulled batch', i, 'with', batches[i].length, 'accounts, processing....');
            for (let j = 0; j < accounts.keys.length; j++) {
                const pubkey = accounts.keys[j];
                await processMetaData_1.processMetaData({
                    pubkey,
                    account: accounts.array[j],
                }, updateTemp);
            }
        }
        else {
            console.log('------->Failed to pull batch', i, 'skipping');
        }
    }
    await postProcessMetadata({ ...state, whitelistedCreatorsByCreator });
    console.log('-------->User metadata processing complete.');
    return state;
};
exports.loadMetadataForUsers = loadMetadataForUsers;
const loadAccounts = async (connection, ownerAddress) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const storeAddress = await utils_1.getStoreID(ownerAddress);
    const forEachAccount = exports.processingAccounts(updateState);
    if (!storeAddress) {
        console.error('no store address. unable to lookup store account.');
        return state;
    }
    const forEach = (fn) => async (accounts) => {
        for (const account of accounts) {
            await fn(account, updateState);
        }
    };
    const loadVaults = () => web3_1.getProgramAccounts(connection, ids_1.VAULT_ID).then(forEachAccount(processVaultData_1.processVaultData));
    const loadAuctions = () => web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID).then(forEachAccount(processAuctions_1.processAuctions));
    const loadMetaplex = () => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID).then(forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts));
    const loadCreators = () => web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                dataSize: models_1.MAX_WHITELISTED_CREATOR_SIZE,
            },
        ],
    }).then(forEach(processMetaplexAccounts_1.processMetaplexAccounts));
    const loadMetadata = () => pullMetadataByCreators(connection, state, updateState);
    const loadEditions = () => pullEditions(connection, updateState, state, state.metadata);
    const loading = [
        loadCreators().then(loadMetadata).then(loadEditions),
        loadVaults(),
        loadAuctions(),
        loadMetaplex(),
    ];
    await Promise.all(loading);
    state.metadata = lodash_1.uniqWith(state.metadata, (a, b) => a.pubkey === b.pubkey);
    return state;
};
exports.loadAccounts = loadAccounts;
const queryAuctionManagers = async (connection, updateState, storeAddress) => {
    const forEachAccount = exports.processingAccounts(updateState);
    const response = await web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                memcmp: {
                    offset: 1,
                    bytes: storeAddress,
                },
            },
        ],
    });
    await forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)(response);
};
const loadVaultsAndContentForAuthority = async (connection, walletPubkey) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const responses = await web3_1.getProgramAccounts(connection, ids_1.VAULT_ID, {
        filters: [
            {
                memcmp: {
                    offset: 1 + // key
                        32 + //token program
                        32,
                    bytes: walletPubkey,
                },
            },
        ],
    });
    await forEachAccount(processVaultData_1.processVaultData)(responses);
    return state;
};
exports.loadVaultsAndContentForAuthority = loadVaultsAndContentForAuthority;
const loadPayoutTickets = async (connection) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const responses = await web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                dataSize: metaplex_1.MAX_PAYOUT_TICKET_SIZE,
            },
        ],
    });
    await forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)(responses);
    return state;
};
exports.loadPayoutTickets = loadPayoutTickets;
const queryCreators = async (connection, updateState) => {
    const forEachAccount = exports.processingAccounts(updateState);
    const response = await web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                dataSize: models_1.MAX_WHITELISTED_CREATOR_SIZE,
            },
        ],
    });
    await forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)(response);
};
const loadCreators = async (connection) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    await queryCreators(connection, updateState);
    return state;
};
exports.loadCreators = loadCreators;
const loadAuctionManagers = async (connection, storeAddress) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    await queryAuctionManagers(connection, updateState, storeAddress);
    return state;
};
exports.loadAuctionManagers = loadAuctionManagers;
const loadAuctionsForAuctionManagers = async (connection, auctionManagers) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    // const auctionIds = auctionManagers.map(({ info: { auction } }) => auction);
    // const auctionExtendedKeys = await Promise.all(
    //   auctionManagers.map(account =>
    //     getAuctionExtended({
    //       auctionProgramId: AUCTION_ID,
    //       resource: account.info.vault,
    //     }),
    //  ),
    // );
    // const auctionData = await getMultipleAccounts(
    //   connection, [
    //   ...auctionIds,
    //   ...auctionExtendedKeys,
    // ]);
    // if (auctionData) {
    //   await Promise.all(
    //     auctionData.keys.map((pubkey, i) => {
    //       processAuctions(
    //         {
    //           pubkey,
    //           account: auctionData.array[i],
    //         },
    //         updateState,
    //       );
    //     }),
    //   );
    // }
    const vaultKeys = auctionManagers.map(({ info: { vault } }) => vault);
    //@ts-ignore
    const vaultData = await getMultipleAccounts_1.getMultipleAccounts(connection, vaultKeys);
    if (vaultData) {
        await Promise.all(vaultData.keys.map((pubkey, i) => {
            processVaultData_1.processVaultData({
                pubkey,
                account: vaultData.array[i],
            }, updateState);
        }));
    }
    return state;
};
exports.loadAuctionsForAuctionManagers = loadAuctionsForAuctionManagers;
const loadPrizeTrackingTickets = async (connection, auctionManager, metadata) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const prizeTrackingKeys = await Promise.all(metadata.map(m => metaplex_1.getPrizeTrackingTicket(auctionManager.pubkey, m.info.mint)));
    const prizeTrackingTicketsResponse = await getMultipleAccounts_1.getMultipleAccounts(connection, prizeTrackingKeys, 'single');
    if (!prizeTrackingTicketsResponse) {
        console.error(`no prize tracking ticket response for auction manager ${auctionManager.pubkey}`);
        return state;
    }
    await Promise.all(prizeTrackingTicketsResponse.keys.map((pubkey, i) => {
        const account = prizeTrackingTicketsResponse.array[i];
        if (!account) {
            return;
        }
        return processMetaplexAccounts_1.processMetaplexAccounts({
            pubkey,
            account,
        }, updateState);
    }));
    return state;
};
exports.loadPrizeTrackingTickets = loadPrizeTrackingTickets;
const loadMetaDataAndEditionsForCreators = async (connection, whitelistedCreatorsByCreator) => {
    const loadMetadata = () => exports.loadMetaDataAndEditionsForCreators(connection, whitelistedCreatorsByCreator);
    const loadEditions = (state) => pullEditions(connection, loadMetadata, state, state.metadata);
    const state = await loadMetadata().then(loadEditions);
    // @ts-ignore
    return state;
};
exports.loadMetaDataAndEditionsForCreators = loadMetaDataAndEditionsForCreators;
const querySafetyDepositBoxByVault = async (connection, vaultPublicKey) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const response = await web3_1.getProgramAccounts(connection, ids_1.VAULT_ID, {
        filters: [
            {
                memcmp: {
                    offset: 1,
                    bytes: vaultPublicKey,
                },
            },
        ],
    });
    await forEachAccount(processVaultData_1.processVaultData)(response);
    return state;
};
exports.querySafetyDepositBoxByVault = querySafetyDepositBoxByVault;
const pullEditions = async (connection, updater, state, metadataArr) => {
    console.log('Pulling editions for optimized metadata');
    let setOf100MetadataEditionKeys = [];
    const editionPromises = [];
    const loadBatch = () => {
        editionPromises.push(getMultipleAccounts_1.getMultipleAccounts(connection, setOf100MetadataEditionKeys, 'recent').then(processEditions));
        setOf100MetadataEditionKeys = [];
    };
    const processEditions = (returnedAccounts) => {
        for (let j = 0; j < returnedAccounts.array.length; j++) {
            processMetaData_1.processMetaData({
                pubkey: returnedAccounts.keys[j],
                account: returnedAccounts.array[j],
            }, updater);
        }
    };
    for (const metadata of metadataArr) {
        // let editionKey: StringPublicKey;
        // TODO the nonce builder isnt working here, figure out why
        //if (metadata.info.editionNonce === null) {
        const editionKey = await actions_1.getEdition(metadata.info.mint);
        /*} else {
          editionKey = (
            await PublicKey.createProgramAddress(
              [
                Buffer.from(METADATA_PREFIX),
                toPublicKey(METADATA_PROGRAM_ID).toBuffer(),
                toPublicKey(metadata.info.mint).toBuffer(),
                new Uint8Array([metadata.info.editionNonce || 0]),
              ],
              toPublicKey(METADATA_PROGRAM_ID),
            )
          ).toBase58();
        }*/
        setOf100MetadataEditionKeys.push(editionKey);
        if (setOf100MetadataEditionKeys.length >= 100) {
            loadBatch();
        }
    }
    if (setOf100MetadataEditionKeys.length >= 0) {
        loadBatch();
    }
    await Promise.all(editionPromises);
    console.log('Edition size', Object.keys(state.editions).length, Object.keys(state.masterEditions).length);
};
const loadArtwork = async (connection, whitelistedCreatorsByCreator, key) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const metaResponse = await getMultipleAccounts_1.getMultipleAccounts(connection, [key], 'single');
    if (!metaResponse) {
        console.error('No meta response');
        return state;
    }
    const [metadataAccount] = metaResponse.keys.map((pubkey, i) => {
        const account = metaResponse.array[i];
        if (!account) {
            return;
        }
        return {
            pubkey,
            account,
            info: actions_1.decodeMetadata(account.data),
        };
    });
    if (!metadataAccount) {
        return state;
    }
    await exports.initMetadata(metadataAccount, whitelistedCreatorsByCreator, updateState);
    await pullEditions(connection, updateState, state, state.metadata);
    return state;
};
exports.loadArtwork = loadArtwork;
const loadBidsForAuction = async (connection, auctionPubkey) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const response = await web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
        filters: [
            {
                memcmp: {
                    offset: 32,
                    bytes: auctionPubkey,
                },
            },
        ],
    });
    await forEachAccount(processAuctions_1.processAuctions)(response);
    return state;
};
exports.loadBidsForAuction = loadBidsForAuction;
const loadAuction = async (connection, auctionManager) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const forEachAccount = exports.processingAccounts(updateState);
    const rpcQueries = [
        // safety deposit box config
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 1,
                        bytes: auctionManager.pubkey,
                    },
                },
            ],
        }).then(forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)),
        // // safety deposit
        pullSafetyDepositBoxAccountsForVault(connection, auctionManager.info.vault).then(forEachAccount(processVaultData_1.processVaultData)),
        // bidder redemptions
        web3_1.getProgramAccounts(connection, ids_1.METAPLEX_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 9,
                        bytes: auctionManager.pubkey,
                    },
                },
            ],
        }).then(forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)),
        // bidder metadata
        web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 32,
                        bytes: auctionManager.info.auction,
                    },
                },
            ],
        }).then(forEachAccount(processAuctions_1.processAuctions)),
        // bidder pot
        web3_1.getProgramAccounts(connection, ids_1.AUCTION_ID, {
            filters: [
                {
                    memcmp: {
                        offset: 64,
                        bytes: auctionManager.info.auction,
                    },
                },
            ],
        }).then(forEachAccount(processAuctions_1.processAuctions)),
    ];
    await Promise.all(rpcQueries);
    const bidderRedemptionIds = await Promise.all(Object.values(state.bidderMetadataByAuctionAndBidder).map(bm => metaplex_1.getBidRedemption(auctionManager.info.auction, bm.pubkey)));
    const bidRedemptionData = await getMultipleAccounts_1.getMultipleAccounts(connection, bidderRedemptionIds, 'single');
    if (bidRedemptionData) {
        await Promise.all(bidRedemptionData.keys.map((pubkey, i) => {
            const account = bidRedemptionData.array[i];
            if (!account) {
                return;
            }
            return processMetaplexAccounts_1.processMetaplexAccounts({
                pubkey,
                account,
            }, updateState);
        }));
    }
    return state;
};
exports.loadAuction = loadAuction;
const loadMetadataAndEditionsBySafetyDepositBoxes = async (connection, safetyDepositBoxesByVaultAndIndex, whitelistedCreatorsByCreator) => {
    const nextState = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(nextState);
    const metadataKeys = await Promise.all(Object.values(safetyDepositBoxesByVaultAndIndex).map(({ info: { tokenMint } }) => actions_1.getMetadata(tokenMint)));
    const metadataData = await getMultipleAccounts_1.getMultipleAccounts(connection, metadataKeys, 'single');
    if (!metadataData) {
        console.error('No response from metadata query by mint');
        return nextState;
    }
    const metadata = metadataData.keys.reduce((memo, pubkey, i) => {
        const account = metadataData.array[i];
        if (!account) {
            return memo;
        }
        const metadata = {
            pubkey,
            account,
            info: actions_1.decodeMetadata(account.data),
        };
        return [...memo, metadata];
    }, []);
    const readyMetadata = metadata.map(m => exports.initMetadata(m, whitelistedCreatorsByCreator, updateState));
    await Promise.all(readyMetadata);
    await pullEditions(connection, updateState, nextState, nextState.metadata);
    return nextState;
};
exports.loadMetadataAndEditionsBySafetyDepositBoxes = loadMetadataAndEditionsBySafetyDepositBoxes;
const loadMetadataForCreator = async (connection, creator) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const response = await web3_1.getProgramAccounts(connection, ids_1.METADATA_PROGRAM_ID, {
        filters: [
            {
                memcmp: {
                    offset: 1 + // key
                        32 + // update auth
                        32 + // mint
                        4 + // name string length
                        actions_1.MAX_NAME_LENGTH + // name
                        4 + // uri string length
                        actions_1.MAX_URI_LENGTH + // uri
                        4 + // symbol string length
                        actions_1.MAX_SYMBOL_LENGTH + // symbol
                        2 + // seller fee basis points
                        1 + // whether or not there is a creators vec
                        4,
                    bytes: creator.info.address,
                },
            },
        ],
    });
    const metadata = response.reduce((memo, { account, pubkey }) => {
        if (!account) {
            return memo;
        }
        const metadata = {
            pubkey,
            account,
            info: actions_1.decodeMetadata(account.data),
        };
        return [...memo, metadata];
    }, []);
    const readyMetadata = metadata.map(m => exports.initMetadata(m, { [creator.info.address]: creator }, updateState));
    await Promise.all(readyMetadata);
    await pullEditions(connection, updateState, state, state.metadata);
    return state;
};
exports.loadMetadataForCreator = loadMetadataForCreator;
const pullMetadataByCreators = (connection, state, updater) => {
    console.log('pulling optimized nfts');
    const whitelistedCreators = Object.values(state.whitelistedCreatorsByCreator);
    const setter = async (prop, key, value) => {
        if (prop === 'metadataByMint') {
            await exports.initMetadata(value, state.whitelistedCreatorsByCreator, updater);
        }
        else {
            updater(prop, key, value);
        }
    };
    const forEachAccount = exports.processingAccounts(setter);
    const additionalPromises = [];
    for (const creator of whitelistedCreators) {
        for (let i = 0; i < actions_1.MAX_CREATOR_LIMIT; i++) {
            const promise = web3_1.getProgramAccounts(connection, ids_1.METADATA_PROGRAM_ID, {
                filters: [
                    {
                        memcmp: {
                            offset: 1 + // key
                                32 + // update auth
                                32 + // mint
                                4 + // name string length
                                actions_1.MAX_NAME_LENGTH + // name
                                4 + // uri string length
                                actions_1.MAX_URI_LENGTH + // uri
                                4 + // symbol string length
                                actions_1.MAX_SYMBOL_LENGTH + // symbol
                                2 + // seller fee basis points
                                1 + // whether or not there is a creators vec
                                4 + // creators vec length
                                i * actions_1.MAX_CREATOR_LEN,
                            bytes: creator.info.address,
                        },
                    },
                ],
            }).then(forEachAccount(processMetaData_1.processMetaData));
            additionalPromises.push(promise);
        }
    }
    return Promise.all(additionalPromises);
};
const pullMetadataByKeys = async (connection, state, metadataKeys) => {
    const updateState = exports.makeSetter(state);
    let setOf100MetadataEditionKeys = [];
    const metadataPromises = [];
    const loadBatch = () => {
        metadataPromises.push(getMultipleAccounts_1.getMultipleAccounts(connection, setOf100MetadataEditionKeys, 'recent').then(({ keys, array }) => {
            keys.forEach((key, index) => processMetaData_1.processMetaData({ pubkey: key, account: array[index] }, updateState));
        }));
        setOf100MetadataEditionKeys = [];
    };
    for (const metadata of metadataKeys) {
        setOf100MetadataEditionKeys.push(metadata);
        if (setOf100MetadataEditionKeys.length >= 100) {
            loadBatch();
        }
    }
    if (setOf100MetadataEditionKeys.length >= 0) {
        loadBatch();
    }
    await Promise.all(metadataPromises);
    return state;
};
exports.pullMetadataByKeys = pullMetadataByKeys;
const makeSetter = (state) => (prop, key, value) => {
    if (prop === 'store') {
        state[prop] = value;
    }
    else if (prop === 'metadata') {
        state.metadata.push(value);
    }
    else if (prop === 'storeIndexer') {
        state.storeIndexer = state.storeIndexer.filter(p => p.info.page.toNumber() != value.info.page.toNumber());
        state.storeIndexer.push(value);
        state.storeIndexer = state.storeIndexer.sort((a, b) => a.info.page.sub(b.info.page).toNumber());
        // } else if (prop === 'packCardsByPackSet') {
        //   if (!state.packCardsByPackSet[key]) {
        //     state.packCardsByPackSet[key] = [];
        //   }
        //   const alreadyHasInState = state.packCardsByPackSet[key].some(
        //     ({ pubkey }) => pubkey === value.pubkey,
        //   );
        //   if (!alreadyHasInState) {
        //     state.packCardsByPackSet[key].push(value);
        //   }
    }
    else {
        state[prop][key] = value;
    }
    return state;
};
exports.makeSetter = makeSetter;
const processingAccounts = (updater) => (fn) => async (accounts) => {
    await createPipelineExecutor_1.createPipelineExecutor(accounts.values(), account => fn(account, updater), {
        sequence: 10,
        delay: 1,
        jobsCount: 3,
    });
};
exports.processingAccounts = processingAccounts;
const postProcessMetadata = async (state) => {
    const values = Object.values(state.metadataByMint);
    for (const metadata of values) {
        await exports.metadataByMintUpdater(metadata, state);
    }
};
const metadataByMintUpdater = async (metadata, state) => {
    var _a;
    const key = metadata.info.mint;
    if (isMetadataPartOfStore_1.isMetadataPartOfStore(metadata, state.whitelistedCreatorsByCreator)) {
        await metadata.info.init();
        const masterEditionKey = (_a = metadata.info) === null || _a === void 0 ? void 0 : _a.masterEdition;
        if (masterEditionKey) {
            state.metadataByMasterEdition[masterEditionKey] = metadata;
        }
        if (!state.metadata.some(({ pubkey }) => metadata.pubkey === pubkey)) {
            state.metadata.push(metadata);
        }
        state.metadataByMint[key] = metadata;
    }
    else {
        delete state.metadataByMint[key];
    }
    return state;
};
exports.metadataByMintUpdater = metadataByMintUpdater;
const initMetadata = async (metadata, whitelistedCreators, setter) => {
    var _a;
    if (isMetadataPartOfStore_1.isMetadataPartOfStore(metadata, whitelistedCreators)) {
        await metadata.info.init();
        setter('metadataByMint', metadata.info.mint, metadata);
        setter('metadata', '', metadata);
        const masterEditionKey = (_a = metadata.info) === null || _a === void 0 ? void 0 : _a.masterEdition;
        if (masterEditionKey) {
            setter('metadataByMasterEdition', masterEditionKey, metadata);
        }
    }
};
exports.initMetadata = initMetadata;
const queryMultipleAccountsIntoState = async (conn, updateState, keys, commitment) => {
    const { array } = await getMultipleAccounts_1.getMultipleAccounts(conn, keys, commitment);
    await Promise.all(array.map(async (account, i) => {
        const pubkey = keys[i];
        // account has an incorrect type ascription
        if (!account) {
            console.warn(`Didn't see account for pubkey ${pubkey}`);
            return;
        }
        const PROGRAM_IDS = __1.programIds();
        const pair = { pubkey, account };
        // account.owner ALSO has an incorrect type ascription
        const owner = account.owner instanceof web3_js_1.PublicKey
            ? account.owner.toBase58()
            : account.owner;
        switch (owner) {
            case PROGRAM_IDS.metadata:
                await processMetaData_1.processMetaData(pair, updateState);
                break;
            case PROGRAM_IDS.vault:
                await processVaultData_1.processVaultData(pair, updateState);
                break;
            case PROGRAM_IDS.auction:
                await processAuctions_1.processAuctions(pair, updateState);
                break;
            case PROGRAM_IDS.metaplex:
                await processMetaplexAccounts_1.processMetaplexAccounts(pair, updateState);
                break;
            default:
                // console.warn(
                //   `Not sure what to do with account ${pubkey} owned by ${account.owner}`,
                // );
                break;
        }
    }));
};
const loadMultipleAccounts = async (conn, keys, commitment) => {
    const tempCache = getEmptyMetaState_1.getEmptyMetaState();
    const updateTemp = exports.makeSetter(tempCache);
    await queryMultipleAccountsIntoState(conn, updateTemp, keys, commitment);
    return tempCache;
};
exports.loadMultipleAccounts = loadMultipleAccounts;
//# sourceMappingURL=loadAccounts.js.map