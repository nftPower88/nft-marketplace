"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMultipleAccounts = exports.initMetadata = exports.metadataByMintUpdater = exports.processingAccounts = exports.makeSetter = exports.loadMetadataForCreator = exports.loadMetadataAndEditionsBySafetyDepositBoxes = exports.loadAuction = exports.loadBidsForAuction = exports.loadSafeteyDepositBoxesForVaults = exports.loadArtwork = exports.querySafetyDepositBoxByVault = exports.loadMetaDataAndEditionsForCreators = exports.loadPrizeTrackingTickets = exports.loadAuctionsForAuctionManagers = exports.loadAuctionManagers = exports.loadCreators = exports.loadPayoutTickets = exports.loadVaultsAndContentForAuthority = exports.loadAccounts = exports.loadStoreIndexers = exports.loadMetadataForUsers = void 0;
const lodash_1 = require("lodash");
const ids_1 = require("../../utils/ids");
const utils_1 = require("../../utils");
const models_1 = require("../../models");
const actions_1 = require("../../actions");
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
const loadStoreIndexers = async (connection) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    await queryStoreIndexer(connection, updateState);
    return state;
};
exports.loadStoreIndexers = loadStoreIndexers;
const loadAccounts = async (connection, ownerAddress) => {
    const state = getEmptyMetaState_1.getEmptyMetaState();
    const updateState = exports.makeSetter(state);
    const storeAddress = await utils_1.getStoreID(ownerAddress);
    if (!storeAddress) {
        console.error('no store address. unable to lookup store account.');
        return state;
    }
    const queryAuctionCaches = async () => {
        const auctionCacheKeys = state.storeIndexer.reduce((memo, storeIndex) => [...memo, ...storeIndex.info.auctionCaches], []);
        const auctionCacheData = await getMultipleAccounts_1.getMultipleAccounts(connection, auctionCacheKeys);
        if (auctionCacheData) {
            await Promise.all(auctionCacheData.keys.map((pubkey, i) => {
                processMetaplexAccounts_1.processMetaplexAccounts({
                    pubkey,
                    account: auctionCacheData.array[i],
                }, updateState);
            }));
        }
    };
    const queryAuctionsFromCache = async () => {
        const auctionCaches = Object.values(state.auctionCaches);
        let accountPubKeys = [];
        for (const auctionCache of auctionCaches) {
            const { info: { auction, vault, metadata, auctionManager }, } = auctionCache;
            const auctionExtended = await actions_1.getAuctionExtended({
                auctionProgramId: ids_1.AUCTION_ID,
                resource: vault,
            });
            accountPubKeys = [
                ...accountPubKeys,
                auction,
                auctionManager,
                vault,
                auctionExtended,
                ...metadata,
            ];
        }
        await queryMultipleAccountsIntoState(connection, updateState, accountPubKeys, 'single');
        const readyMetadata = auctionCaches.reduce((memo, auctionCache) => {
            const setMetadata = auctionCache.info.metadata.map(async (metadataKey) => {
                const metadata = state.metadataByMetadata[metadataKey];
                let auctionMetadata = state.metadataByAuction[auctionCache.info.auction];
                auctionMetadata = auctionMetadata || [];
                await metadata.info.init();
                updateState('metadataByMint', metadata.info.mint, metadata);
                updateState('metadata', '', metadata);
                state.metadataByAuction[auctionCache.info.auction] = [
                    ...auctionMetadata,
                    metadata,
                ];
            });
            return [...memo, ...setMetadata];
        }, []);
        await Promise.all(readyMetadata);
    };
    const queryStorefront = async (storeAddress) => {
        const storeData = await getAccountInfo_1.getAccountInfo(connection, storeAddress);
        if (storeData) {
            processMetaplexAccounts_1.processMetaplexAccounts({
                pubkey: storeAddress,
                account: storeData,
            }, updateState);
        }
    };
    const queryAuctionsFromAuctionManagers = async (parsedAccounts) => {
        const auctionIds = parsedAccounts.map(({ info: { auction } }) => auction);
        const auctionExtendedKeys = await Promise.all(parsedAccounts.map(account => actions_1.getAuctionExtended({
            auctionProgramId: ids_1.AUCTION_ID,
            resource: account.info.vault,
        })));
        const auctionData = await getMultipleAccounts_1.getMultipleAccounts(connection, [
            ...auctionIds,
            ...auctionExtendedKeys,
        ]);
        if (auctionData) {
            await Promise.all(auctionData.keys.map((pubkey, i) => {
                processAuctions_1.processAuctions({
                    pubkey,
                    account: auctionData.array[i],
                }, updateState);
            }));
        }
    };
    const queryVaultsForAuctionManagers = async (auctionManagers) => {
        const vaultKeys = auctionManagers.map(({ info: { vault } }) => vault);
        const vaultData = await getMultipleAccounts_1.getMultipleAccounts(connection, vaultKeys);
        if (vaultData) {
            await Promise.all(vaultData.keys.map((pubkey, i) => {
                processVaultData_1.processVaultData({
                    pubkey,
                    account: vaultData.array[i],
                }, updateState);
            }));
        }
    };
    const queryAuctionsAndVaults = async () => {
        const auctionManagers = Object.values(state.auctionManagersByAuction);
        await Promise.all([
            queryAuctionsFromAuctionManagers(auctionManagers),
            queryVaultsForAuctionManagers(auctionManagers),
        ]);
    };
    await Promise.all([
        queryCreators(connection, updateState),
        queryStoreIndexer(connection, updateState)
            .then(queryAuctionCaches)
            .then(queryAuctionsFromCache),
        queryStorefront(storeAddress),
        queryAuctionManagers(connection, updateState, storeAddress).then(queryAuctionsAndVaults),
    ]);
    return state;
};
exports.loadAccounts = loadAccounts;
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
    const auctionIds = auctionManagers.map(({ info: { auction } }) => auction);
    const auctionExtendedKeys = await Promise.all(auctionManagers.map(account => actions_1.getAuctionExtended({
        auctionProgramId: ids_1.AUCTION_ID,
        resource: account.info.vault,
    })));
    const auctionData = await getMultipleAccounts_1.getMultipleAccounts(connection, [
        ...auctionIds,
        ...auctionExtendedKeys,
    ]);
    if (auctionData) {
        await Promise.all(auctionData.keys.map((pubkey, i) => {
            processAuctions_1.processAuctions({
                pubkey,
                account: auctionData.array[i],
            }, updateState);
        }));
    }
    const vaultKeys = auctionManagers.map(({ info: { vault } }) => vault);
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
    const loadMetadata = () => pullMetadataByCreators(connection, whitelistedCreatorsByCreator);
    const loadEditions = (state) => pullEditions(connection, state);
    const state = await loadMetadata().then(loadEditions);
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
const pullEditions = async (connection, state) => {
    const updateState = exports.makeSetter(state);
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
            }, updateState);
        }
    };
    for (const metadata of state.metadata) {
        let editionKey;
        if (metadata.info.editionNonce === null) {
            editionKey = await actions_1.getEdition(metadata.info.mint);
        }
        else {
            editionKey = (await web3_js_1.PublicKey.createProgramAddress([
                Buffer.from(actions_1.METADATA_PREFIX),
                ids_1.toPublicKey(ids_1.METADATA_PROGRAM_ID).toBuffer(),
                ids_1.toPublicKey(metadata.info.mint).toBuffer(),
                new Uint8Array([metadata.info.editionNonce || 0]),
            ], ids_1.toPublicKey(ids_1.METADATA_PROGRAM_ID))).toBase58();
        }
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
    return state;
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
    await pullEditions(connection, state);
    return state;
};
exports.loadArtwork = loadArtwork;
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
    await pullEditions(connection, nextState);
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
    await pullEditions(connection, state);
    return state;
};
exports.loadMetadataForCreator = loadMetadataForCreator;
const pullMetadataByCreators = async (connection, whitelistedCreatorsByCreator) => {
    console.log('pulling optimized nfts');
    const whitelistedCreators = Object.values(whitelistedCreatorsByCreator);
    const additionalPromises = [];
    for (const creator of whitelistedCreators) {
        additionalPromises.push(exports.loadMetadataForCreator(connection, creator));
    }
    const responses = await Promise.all(additionalPromises);
    return responses.reduce((memo, state) => {
        var _a, _b;
        const next = lodash_1.merge({}, memo, state);
        const currentMetadata = (_a = memo.metadata) !== null && _a !== void 0 ? _a : [];
        const metadata = (_b = state.metadata) !== null && _b !== void 0 ? _b : [];
        next.metadata = lodash_1.uniqWith([...currentMetadata, ...metadata], (a, b) => a.pubkey === b.pubkey);
        return next;
    }, getEmptyMetaState_1.getEmptyMetaState());
};
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
        state.metadataByMint[key] = metadata;
        state.metadata.push(metadata);
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
        setter('metadataByMetadata', metadata.pubkey, metadata);
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