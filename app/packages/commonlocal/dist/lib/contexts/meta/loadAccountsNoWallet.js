"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMetadata = exports.processingAccounts = exports.makeSetter = exports.loadAuction = exports.loadAccountsNoWallet = void 0;
// import { uniqWith, merge } from 'lodash';
const ids_1 = require("../../utils/ids");
const utils_1 = require("../../utils");
// import { MAX_WHITELISTED_CREATOR_SIZE, TokenAccount } from '../../models';
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
const queryStoreIndexer = async (connection, updateState) => {
    let i = 0;
    let pageKey = await (0, metaplex_1.getStoreIndexer)(i);
    let account = await (0, getAccountInfo_1.getAccountInfo)(connection, pageKey);
    while (account) {
        pageKey = await (0, metaplex_1.getStoreIndexer)(i);
        account = await (0, getAccountInfo_1.getAccountInfo)(connection, pageKey);
        if (!account) {
            break;
        }
        (0, processMetaplexAccounts_1.processMetaplexAccounts)({
            pubkey: pageKey,
            account,
        }, updateState);
        i++;
    }
};
const loadAccountsNoWallet = async (connection, ownerAddress) => {
    const state = (0, getEmptyMetaState_1.getEmptyMetaState)();
    const updateState = (0, exports.makeSetter)(state);
    const storeAddress = await (0, utils_1.getStoreID)(ownerAddress);
    if (!storeAddress) {
        console.error('no store address. unable to lookup store account.');
        return state;
    }
    const queryAuctionCaches = async () => {
        const auctionCacheKeys = state.storeIndexer.reduce((memo, storeIndex) => [...memo, ...storeIndex.info.auctionCaches], []);
        const auctionCacheData = await (0, getMultipleAccounts_1.getMultipleAccounts)(connection, auctionCacheKeys);
        if (auctionCacheData) {
            await Promise.all(auctionCacheData.keys.map((pubkey, i) => {
                (0, processMetaplexAccounts_1.processMetaplexAccounts)({
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
            const auctionExtended = await (0, actions_1.getAuctionExtended)({
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
        const storeData = await (0, getAccountInfo_1.getAccountInfo)(connection, storeAddress);
        if (storeData) {
            (0, processMetaplexAccounts_1.processMetaplexAccounts)({
                pubkey: storeAddress,
                account: storeData,
            }, updateState);
        }
    };
    const queryAuctionsFromAuctionManagers = async (parsedAccounts) => {
        const auctionIds = parsedAccounts.map(({ info: { auction } }) => auction);
        const auctionExtendedKeys = await Promise.all(parsedAccounts.map(account => (0, actions_1.getAuctionExtended)({
            auctionProgramId: ids_1.AUCTION_ID,
            resource: account.info.vault,
        })));
        const auctionData = await (0, getMultipleAccounts_1.getMultipleAccounts)(connection, [
            ...auctionIds,
            ...auctionExtendedKeys,
        ]);
        if (auctionData) {
            await Promise.all(auctionData.keys.map((pubkey, i) => {
                (0, processAuctions_1.processAuctions)({
                    pubkey,
                    account: auctionData.array[i],
                }, updateState);
            }));
        }
    };
    const queryVaultsForAuctionManagers = async (auctionManagers) => {
        const vaultKeys = auctionManagers.map(({ info: { vault } }) => vault);
        const vaultData = await (0, getMultipleAccounts_1.getMultipleAccounts)(connection, vaultKeys);
        if (vaultData) {
            await Promise.all(vaultData.keys.map((pubkey, i) => {
                (0, processVaultData_1.processVaultData)({
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
exports.loadAccountsNoWallet = loadAccountsNoWallet;
// export const loadVaultsAndContentForAuthority = async (
//   connection: Connection,
//   walletPubkey: StringPublicKey,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const forEachAccount = processingAccounts(updateState);
//   const responses = await getProgramAccounts(connection, VAULT_ID, {
//     filters: [
//       {
//         memcmp: {
//           offset:
//             1 + // key
//             32 + //token program
//             32, // fraction mint
//           bytes: walletPubkey,
//         },
//       },
//     ],
//   });
//   await forEachAccount(processVaultData)(responses);
//   return state;
// };
// export const loadPayoutTickets = async (
//   connection: Connection,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const forEachAccount = processingAccounts(updateState);
//   const responses = await getProgramAccounts(connection, METAPLEX_ID, {
//     filters: [
//       {
//         dataSize: MAX_PAYOUT_TICKET_SIZE,
//       },
//     ],
//   });
//   await forEachAccount(processMetaplexAccounts)(responses);
//   return state;
// };
const queryCreators = async (connection, updateState) => {
    const forEachAccount = (0, exports.processingAccounts)(updateState);
    const response = await (0, web3_1.getProgramAccounts)(connection, ids_1.METAPLEX_ID, {
        filters: [
            {
                dataSize: models_1.MAX_WHITELISTED_CREATOR_SIZE,
            },
        ],
    });
    await forEachAccount(processMetaplexAccounts_1.processMetaplexAccounts)(response);
};
// export const loadCreators = async (
//   connection: Connection,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   await queryCreators(connection, updateState);
//   return state;
// };
const queryAuctionManagers = async (connection, updateState, storeAddress) => {
    const forEachAccount = (0, exports.processingAccounts)(updateState);
    const response = await (0, web3_1.getProgramAccounts)(connection, ids_1.METAPLEX_ID, {
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
// export const loadAuctionManagers = async (
//   connection: Connection,
//   storeAddress: StringPublicKey,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   await queryAuctionManagers(connection, updateState, storeAddress);
//   return state;
// };
// export const loadAuctionsForAuctionManagers = async (
//   connection: Connection,
//   auctionManagers: ParsedAccount<AuctionManagerV1 | AuctionManagerV2>[],
// ): Promise<MetaState> => {
//   const state = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const auctionIds = auctionManagers.map(({ info: { auction } }) => auction);
//   const auctionExtendedKeys = await Promise.all(
//     auctionManagers.map(account =>
//       getAuctionExtended({
//         auctionProgramId: AUCTION_ID,
//         resource: account.info.vault,
//       }),
//     ),
//   );
//   const auctionData = await getMultipleAccounts(connection, [
//     ...auctionIds,
//     ...auctionExtendedKeys,
//   ]);
//   if (auctionData) {
//     await Promise.all(
//       auctionData.keys.map((pubkey, i) => {
//         processAuctions(
//           {
//             pubkey,
//             account: auctionData.array[i],
//           },
//           updateState,
//         );
//       }),
//     );
//   }
//   const vaultKeys = auctionManagers.map(({ info: { vault } }) => vault);
//   const vaultData = await getMultipleAccounts(connection, vaultKeys);
//   if (vaultData) {
//     await Promise.all(
//       vaultData.keys.map((pubkey, i) => {
//         processVaultData(
//           {
//             pubkey,
//             account: vaultData.array[i],
//           },
//           updateState,
//         );
//       }),
//     );
//   }
//   return state;
// };
// export const loadPrizeTrackingTickets = async (
//   connection: Connection,
//   auctionManager: ParsedAccount<AuctionManagerV1 | AuctionManagerV2>,
//   metadata: ParsedAccount<Metadata>[],
// ): Promise<MetaState> => {
//   const state = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const prizeTrackingKeys = await Promise.all(
//     metadata.map(m =>
//       getPrizeTrackingTicket(auctionManager.pubkey, m.info.mint),
//     ),
//   );
//   const prizeTrackingTicketsResponse = await getMultipleAccounts(
//     connection,
//     prizeTrackingKeys,
//     'single',
//   );
//   if (!prizeTrackingTicketsResponse) {
//     console.error(
//       `no prize tracking ticket response for auction manager ${auctionManager.pubkey}`,
//     );
//     return state;
//   }
//   await Promise.all(
//     prizeTrackingTicketsResponse.keys.map((pubkey, i) => {
//       const account = prizeTrackingTicketsResponse.array[i];
//       if (!account) {
//         return;
//       }
//       return processMetaplexAccounts(
//         {
//           pubkey,
//           account,
//         },
//         updateState,
//       );
//     }),
//   );
//   return state;
// };
// export const loadMetaDataAndEditionsForCreators = async (
//   connection: Connection,
//   whitelistedCreatorsByCreator: Record<
//     string,
//     ParsedAccount<WhitelistedCreator>
//   >,
// ): Promise<MetaState> => {
//   const loadMetadata = () =>
//     pullMetadataByCreators(connection, whitelistedCreatorsByCreator);
//   const loadEditions = (state: MetaState) => pullEditions(connection, state);
//   const state = await loadMetadata().then(loadEditions);
//   return state;
// };
// export const querySafetyDepositBoxByVault = async (
//   connection: Connection,
//   vaultPublicKey: StringPublicKey,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const forEachAccount = processingAccounts(updateState);
//   const response = await getProgramAccounts(connection, VAULT_ID, {
//     filters: [
//       {
//         memcmp: {
//           offset: 1,
//           bytes: vaultPublicKey,
//         },
//       },
//     ],
//   });
//   await forEachAccount(processVaultData)(response);
//   return state;
// };
// const pullEditions = async (
//   connection: Connection,
//   state: MetaState,
// ): Promise<MetaState> => {
//   const updateState = makeSetter(state);
//   console.log('Pulling editions for optimized metadata');
//   type MultipleAccounts = UnPromise<ReturnType<typeof getMultipleAccounts>>;
//   let setOf100MetadataEditionKeys: string[] = [];
//   const editionPromises: Promise<void>[] = [];
//   const loadBatch = () => {
//     editionPromises.push(
//       getMultipleAccounts(
//         connection,
//         setOf100MetadataEditionKeys,
//         'recent',
//       ).then(processEditions),
//     );
//     setOf100MetadataEditionKeys = [];
//   };
//   const processEditions = (returnedAccounts: MultipleAccounts) => {
//     for (let j = 0; j < returnedAccounts.array.length; j++) {
//       processMetaData(
//         {
//           pubkey: returnedAccounts.keys[j],
//           account: returnedAccounts.array[j],
//         },
//         updateState,
//       );
//     }
//   };
//   for (const metadata of state.metadata) {
//     let editionKey: StringPublicKey;
//     if (metadata.info.editionNonce === null) {
//       editionKey = await getEdition(metadata.info.mint);
//     } else {
//       editionKey = (
//         await PublicKey.createProgramAddress(
//           [
//             Buffer.from(METADATA_PREFIX),
//             toPublicKey(METADATA_PROGRAM_ID).toBuffer(),
//             toPublicKey(metadata.info.mint).toBuffer(),
//             new Uint8Array([metadata.info.editionNonce || 0]),
//           ],
//           toPublicKey(METADATA_PROGRAM_ID),
//         )
//       ).toBase58();
//     }
//     setOf100MetadataEditionKeys.push(editionKey);
//     if (setOf100MetadataEditionKeys.length >= 100) {
//       loadBatch();
//     }
//   }
//   if (setOf100MetadataEditionKeys.length >= 0) {
//     loadBatch();
//   }
//   await Promise.all(editionPromises);
//   console.log(
//     'Edition size',
//     Object.keys(state.editions).length,
//     Object.keys(state.masterEditions).length,
//   );
//   return state;
// };
// export const loadArtwork = async (
//   connection: Connection,
//   whitelistedCreatorsByCreator: Record<
//     string,
//     ParsedAccount<WhitelistedCreator>
//   >,
//   key: StringPublicKey,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const metaResponse = await getMultipleAccounts(connection, [key], 'single');
//   if (!metaResponse) {
//     console.error('No meta response');
//     return state;
//   }
//   const [metadataAccount] = metaResponse.keys.map((pubkey, i) => {
//     const account = metaResponse.array[i];
//     if (!account) {
//       return;
//     }
//     return {
//       pubkey,
//       account,
//       info: decodeMetadata(account.data),
//     } as ParsedAccount<Metadata>;
//   });
//   if (!metadataAccount) {
//     return state;
//   }
//   await initMetadata(
//     metadataAccount,
//     whitelistedCreatorsByCreator,
//     updateState,
//   );
//   await pullEditions(connection, state);
//   return state;
// };
// export const loadSafeteyDepositBoxesForVaults = async (
//   connection: Connection,
//   vaults: StringPublicKey[],
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const forEachAccount = processingAccounts(updateState);
//   const response = await Promise.all(
//     vaults.map(vault =>
//       pullSafetyDepositBoxAccountsForVault(connection, vault),
//     ),
//   );
//   await forEachAccount(processVaultData)(response.flat());
//   return state;
// };
const pullSafetyDepositBoxAccountsForVault = async (connection, vault) => {
    return (0, web3_1.getProgramAccounts)(connection, ids_1.VAULT_ID, {
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
// export const loadBidsForAuction = async (
//   connection: Connection,
//   auctionPubkey: StringPublicKey,
// ) => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const forEachAccount = processingAccounts(updateState);
//   const response = await getProgramAccounts(connection, AUCTION_ID, {
//     filters: [
//       {
//         memcmp: {
//           offset: 32,
//           bytes: auctionPubkey,
//         },
//       },
//     ],
//   });
//   await forEachAccount(processAuctions)(response);
//   return state;
// };
const loadAuction = async (connection, auctionManager) => {
    const state = (0, getEmptyMetaState_1.getEmptyMetaState)();
    const updateState = (0, exports.makeSetter)(state);
    const forEachAccount = (0, exports.processingAccounts)(updateState);
    const rpcQueries = [
        // safety deposit box config
        (0, web3_1.getProgramAccounts)(connection, ids_1.METAPLEX_ID, {
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
        (0, web3_1.getProgramAccounts)(connection, ids_1.METAPLEX_ID, {
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
        (0, web3_1.getProgramAccounts)(connection, ids_1.AUCTION_ID, {
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
        (0, web3_1.getProgramAccounts)(connection, ids_1.AUCTION_ID, {
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
    const bidderRedemptionIds = await Promise.all(Object.values(state.bidderMetadataByAuctionAndBidder).map(bm => (0, metaplex_1.getBidRedemption)(auctionManager.info.auction, bm.pubkey)));
    const bidRedemptionData = await (0, getMultipleAccounts_1.getMultipleAccounts)(connection, bidderRedemptionIds, 'single');
    if (bidRedemptionData) {
        await Promise.all(bidRedemptionData.keys.map((pubkey, i) => {
            const account = bidRedemptionData.array[i];
            if (!account) {
                return;
            }
            return (0, processMetaplexAccounts_1.processMetaplexAccounts)({
                pubkey,
                account,
            }, updateState);
        }));
    }
    return state;
};
exports.loadAuction = loadAuction;
// export const loadMetadataAndEditionsBySafetyDepositBoxes = async (
//   connection: Connection,
//   safetyDepositBoxesByVaultAndIndex: Record<
//     string,
//     ParsedAccount<SafetyDepositBox>
//   >,
//   whitelistedCreatorsByCreator: Record<
//     string,
//     ParsedAccount<WhitelistedCreator>
//   >,
// ): Promise<MetaState> => {
//   const nextState: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(nextState);
//   const metadataKeys = await Promise.all(
//     Object.values(safetyDepositBoxesByVaultAndIndex).map(
//       ({ info: { tokenMint } }) => getMetadata(tokenMint),
//     ),
//   );
//   const metadataData = await getMultipleAccounts(
//     connection,
//     metadataKeys,
//     'single',
//   );
//   if (!metadataData) {
//     console.error('No response from metadata query by mint');
//     return nextState;
//   }
//   const metadata = metadataData.keys.reduce((memo, pubkey, i) => {
//     const account = metadataData.array[i];
//     if (!account) {
//       return memo;
//     }
//     const metadata = {
//       pubkey,
//       account,
//       info: decodeMetadata(account.data),
//     };
//     return [...memo, metadata];
//   }, [] as ParsedAccount<Metadata>[]);
//   const readyMetadata = metadata.map(m =>
//     initMetadata(m, whitelistedCreatorsByCreator, updateState),
//   );
//   await Promise.all(readyMetadata);
//   await pullEditions(connection, nextState);
//   return nextState;
// };
// export const loadMetadataForCreator = async (
//   connection: Connection,
//   creator: ParsedAccount<WhitelistedCreator>,
// ): Promise<MetaState> => {
//   const state: MetaState = getEmptyMetaState();
//   const updateState = makeSetter(state);
//   const response = await getProgramAccounts(connection, METADATA_PROGRAM_ID, {
//     filters: [
//       {
//         memcmp: {
//           offset:
//             1 + // key
//             32 + // update auth
//             32 + // mint
//             4 + // name string length
//             MAX_NAME_LENGTH + // name
//             4 + // uri string length
//             MAX_URI_LENGTH + // uri
//             4 + // symbol string length
//             MAX_SYMBOL_LENGTH + // symbol
//             2 + // seller fee basis points
//             1 + // whether or not there is a creators vec
//             4, // creators vec length
//           bytes: creator.info.address,
//         },
//       },
//     ],
//   });
//   const metadata = response.reduce((memo, { account, pubkey }) => {
//     if (!account) {
//       return memo;
//     }
//     const metadata = {
//       pubkey,
//       account,
//       info: decodeMetadata(account.data),
//     };
//     return [...memo, metadata];
//   }, [] as ParsedAccount<Metadata>[]);
//   const readyMetadata = metadata.map(m =>
//     initMetadata(m, { [creator.info.address]: creator }, updateState),
//   );
//   await Promise.all(readyMetadata);
//   await pullEditions(connection, state);
//   return state;
// };
// const pullMetadataByCreators = async (
//   connection: Connection,
//   whitelistedCreatorsByCreator: Record<
//     string,
//     ParsedAccount<WhitelistedCreator>
//   >,
// ): Promise<MetaState> => {
//   console.log('pulling optimized nfts');
//   const whitelistedCreators = Object.values(whitelistedCreatorsByCreator);
//   const additionalPromises: Promise<MetaState>[] = [];
//   for (const creator of whitelistedCreators) {
//     additionalPromises.push(loadMetadataForCreator(connection, creator));
//   }
//   const responses = await Promise.all(additionalPromises);
//   return responses.reduce((memo, state) => {
//     const next = merge({}, memo, state);
//     const currentMetadata = memo.metadata ?? [];
//     const metadata = state.metadata ?? [];
//     next.metadata = uniqWith(
//       [...currentMetadata, ...metadata],
//       (a, b) => a.pubkey === b.pubkey,
//     );
//     return next;
//   }, getEmptyMetaState());
// };
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
    await (0, createPipelineExecutor_1.createPipelineExecutor)(accounts.values(), account => fn(account, updater), {
        sequence: 10,
        delay: 1,
        jobsCount: 3,
    });
};
exports.processingAccounts = processingAccounts;
// const postProcessMetadata = async (state: MetaState) => {
//   const values = Object.values(state.metadataByMint);
//   for (const metadata of values) {
//     await metadataByMintUpdater(metadata, state);
//   }
// };
// export const metadataByMintUpdater = async (
//   metadata: ParsedAccount<Metadata>,
//   state: MetaState,
// ) => {
//   const key = metadata.info.mint;
//   if (isMetadataPartOfStore(metadata, state.whitelistedCreatorsByCreator)) {
//     await metadata.info.init();
//     const masterEditionKey = metadata.info?.masterEdition;
//     if (masterEditionKey) {
//       state.metadataByMasterEdition[masterEditionKey] = metadata;
//     }
//     state.metadataByMint[key] = metadata;
//     state.metadata.push(metadata);
//   } else {
//     delete state.metadataByMint[key];
//   }
//   return state;
// };
const initMetadata = async (metadata, whitelistedCreators, setter) => {
    var _a;
    if ((0, isMetadataPartOfStore_1.isMetadataPartOfStore)(metadata, whitelistedCreators)) {
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
    const { array } = await (0, getMultipleAccounts_1.getMultipleAccounts)(conn, keys, commitment);
    await Promise.all(array.map(async (account, i) => {
        const pubkey = keys[i];
        // account has an incorrect type ascription
        if (!account) {
            console.warn(`Didn't see account for pubkey ${pubkey}`);
            return;
        }
        const PROGRAM_IDS = (0, __1.programIds)();
        const pair = { pubkey, account };
        // account.owner ALSO has an incorrect type ascription
        const owner = account.owner instanceof web3_js_1.PublicKey
            ? account.owner.toBase58()
            : account.owner;
        switch (owner) {
            case PROGRAM_IDS.metadata:
                await (0, processMetaData_1.processMetaData)(pair, updateState);
                break;
            case PROGRAM_IDS.vault:
                await (0, processVaultData_1.processVaultData)(pair, updateState);
                break;
            case PROGRAM_IDS.auction:
                await (0, processAuctions_1.processAuctions)(pair, updateState);
                break;
            case PROGRAM_IDS.metaplex:
                await (0, processMetaplexAccounts_1.processMetaplexAccounts)(pair, updateState);
                break;
            default:
                // console.warn(
                //   `Not sure what to do with account ${pubkey} owned by ${account.owner}`,
                // );
                break;
        }
    }));
};
// export const loadMultipleAccounts = async (
//   conn: Connection,
//   keys: StringPublicKey[],
//   commitment: string,
// ): Promise<MetaState> => {
//   const tempCache: MetaState = getEmptyMetaState();
//   const updateTemp = makeSetter(tempCache);
//   await queryMultipleAccountsIntoState(conn, updateTemp, keys, commitment);
//   return tempCache;
// };
//# sourceMappingURL=loadAccountsNoWallet.js.map