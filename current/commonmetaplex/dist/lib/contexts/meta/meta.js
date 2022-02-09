"use strict";
// @ts-nocheck
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMeta = exports.MetaProvider = void 0;
const lodash_1 = require("lodash");
const react_1 = __importStar(require("react"));
const connection_1 = require("../connection");
const store_1 = require("../store");
const getEmptyMetaState_1 = require("./getEmptyMetaState");
const loadAccounts_1 = require("./loadAccounts");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const queryExtendedMetadata_1 = require("./queryExtendedMetadata");
// import { AuctionData, BidderMetadata, BidderPot } from '../../actions';
const _1 = require(".");
const __1 = require("../..");
const MetaContext = react_1.default.createContext({
    // @ts-ignore
    ...getEmptyMetaState_1.getEmptyMetaState(),
    patchState: () => {
        throw new Error('unreachable');
    },
    // isFetching: false,
    isLoading: false,
    // @ts-ignore
    // update: () => [AuctionData, BidderMetadata, BidderPot],
});
function MetaProvider({ children = null }) {
    const connection = connection_1.useConnection();
    const { isReady, storeAddress, ownerAddress } = store_1.useStore();
    const wallet = wallet_adapter_react_1.useWallet();
    const [state, setState] = react_1.useState(getEmptyMetaState_1.getEmptyMetaState());
    // const [isLoading, setIsLoading] = useState(false);
    const [isLoading, setIsLoading] = react_1.useState(true);
    const patchState = (...args) => {
        setState(current => {
            var _a;
            const newState = lodash_1.merge({}, current, ...args, { store: current.store });
            const currentMetdata = (_a = current.metadata) !== null && _a !== void 0 ? _a : [];
            const nextMetadata = args.reduce((memo, { metadata = [] }) => {
                return [...memo, ...metadata];
            }, []);
            newState.metadata = lodash_1.uniqWith([...currentMetdata, ...nextMetadata], (a, b) => a.pubkey === b.pubkey);
            return newState;
        });
    };
    const [page, setPage] = react_1.useState(0);
    const [lastLength, setLastLength] = react_1.useState(0);
    const { userAccounts } = __1.useUserAccounts();
    const updateRequestsInQueue = react_1.useRef(0);
    react_1.useEffect(() => {
        (async () => {
            if (!storeAddress || !ownerAddress) {
                if (isReady) {
                    setIsLoading(false);
                }
                return;
            }
            else if (!state.store) {
                setIsLoading(true);
            }
            const nextState = await loadAccounts_1.loadAccounts(connection, ownerAddress);
            setState(nextState);
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // } else {
            //   const nextState = await loadAccountsNoWallet(connection, ownerAddress);
            //   setState(nextState);        
            // }
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // }
            setIsLoading(false);
        })();
    }, [storeAddress, isReady, ownerAddress]);
    const [isLoadingMetadata, setIsLoadingMetadata] = react_1.useState(false);
    const loadedMetadataLength = react_1.useRef(0);
    const updateMints = react_1.useCallback(async (metadataByMint) => {
        try {
            const { metadata, mintToMetadata } = await queryExtendedMetadata_1.queryExtendedMetadata(connection, metadataByMint);
            setState(current => ({
                ...current,
                metadata,
                metadataByMint: mintToMetadata,
            }));
        }
        catch (er) {
            console.error(er);
        }
    }, [setState]);
    async function pullAllMetadata() {
        if (isLoading)
            return false;
        if (!storeAddress) {
            if (isReady) {
                setIsLoading(false);
            }
            return;
        }
        else if (!state.store) {
            setIsLoading(true);
        }
        setIsLoading(true);
        const nextState = await _1.pullStoreMetadata(connection, state);
        setIsLoading(false);
        setState(nextState);
        await updateMints(nextState.metadataByMint);
        return [];
    }
    // async function pullBillingPage(auctionAddress: StringPublicKey) {
    //   if (isLoading) return false;
    //   if (!storeAddress) {
    //     if (isReady) {
    //       setIsLoading(false);
    //     }
    //     return;
    //   } else if (!state.store) {
    //     setIsLoading(true);
    //   }
    //   const nextState = await pullAuctionSubaccounts(
    //     connection,
    //     auctionAddress,
    //     state,
    //   );
    //   console.log('-----> Pulling all payout tickets');
    //   await pullPayoutTickets(connection, nextState);
    //   setState(nextState);
    //   await updateMints(nextState.metadataByMint);
    //   return [];
    // }
    // async function pullAuctionPage(auctionAddress: StringPublicKey) {
    //   if (isLoading) return state;
    //   if (!storeAddress) {
    //     if (isReady) {
    //       setIsLoading(false);
    //     }
    //     return state;
    //   } else if (!state.store) {
    //     setIsLoading(true);
    //   }
    //   const nextState = await pullAuctionSubaccounts(
    //     connection,
    //     auctionAddress,
    //     state,
    //   );
    //   setState(nextState);
    //   await updateMints(nextState.metadataByMint);
    //   return nextState;
    // }
    // async function pullItemsPage(
    //   userTokenAccounts: TokenAccount[],
    // ): Promise<void> {
    //   if (isFetching) {
    //     return;
    //   }
    //   const shouldEnableNftPacks = process.env.NEXT_ENABLE_NFT_PACKS === 'true';
    //   const packsState = shouldEnableNftPacks
    //     ? await pullPacks(connection, state, wallet?.publicKey)
    //     : state;
    //   await pullUserMetadata(userTokenAccounts, packsState);
    // }
    // async function pullPackPage(
    //   userTokenAccounts: TokenAccount[],
    //   packSetKey: StringPublicKey,
    // ): Promise<void> {
    //   if (isFetching) {
    //     return;
    //   }
    //   const packState = await pullPack({
    //     connection,
    //     state,
    //     packSetKey,
    //     walletKey: wallet?.publicKey,
    //   });
    //   await pullUserMetadata(userTokenAccounts, packState);
    // }
    // async function pullUserMetadata(
    //   userTokenAccounts: TokenAccount[],
    //   tempState?: MetaState,
    // ): Promise<void> {
    //   setIsLoadingMetadata(true);
    //   loadedMetadataLength.current = userTokenAccounts.length;
    //   const nextState = await pullYourMetadata(
    //     connection,
    //     userTokenAccounts,
    //     tempState || state,
    //   );
    //   await updateMints(nextState.metadataByMint);
    //   setState(nextState);
    //   setIsLoadingMetadata(false);
    // }
    // async function pullAllSiteData() {
    //   if (isLoading) return state;
    //   if (!storeAddress || !ownerAddress) {
    //     if (isReady) {
    //       setIsLoading(false);
    //     }
    //     return state;
    //   } else if (!state.store) {
    //     setIsLoading(true);
    //   }
    //   console.log('------->Query started');
    //   const nextState = await loadAccounts(connection, ownerAddress);
    //   console.log('------->Query finished');
    //   setState(nextState);
    //   await updateMints(nextState.metadataByMint);
    //   return;
    // }
    // async function update(auctionAddress?: any, bidderAddress?: any) {
    //   if (!storeAddress) {
    //     if (isReady) {
    //       //@ts-ignore
    //       window.loadingData = false;
    //       setIsLoading(false);
    //     }
    //     return;
    //   } else if (!state.store) {
    //     //@ts-ignore
    //     window.loadingData = true;
    //     setIsLoading(true);
    //   }
    //   const shouldFetchNftPacks = process.env.NEXT_ENABLE_NFT_PACKS === 'true';
    //   let nextState = await pullPage(
    //     connection,
    //     page,
    //     state,
    //     wallet?.publicKey,
    //     shouldFetchNftPacks,
    //   );
    //   console.log('-----> Query started');
    //   if (nextState.storeIndexer.length) {
    //     if (USE_SPEED_RUN) {
    //       nextState = await limitedLoadAccounts(connection);
    //       console.log('------->Query finished');
    //       setState(nextState);
    //       //@ts-ignore
    //       window.loadingData = false;
    //       setIsLoading(false);
    //     } else {
    //       console.log('------->Pagination detected, pulling page', page);
    //       const auction = window.location.href.match(/#\/auction\/(\w+)/);
    //       const billing = window.location.href.match(
    //         /#\/auction\/(\w+)\/billing/,
    //       );
    //       if (auction && page == 0) {
    //         console.log(
    //           '---------->Loading auction page on initial load, pulling sub accounts',
    //         );
    //         nextState = await pullAuctionSubaccounts(
    //           connection,
    //           auction[1],
    //           nextState,
    //         );
    //         if (billing) {
    //           console.log('-----> Pulling all payout tickets');
    //           await pullPayoutTickets(connection, nextState);
    //         }
    //       }
    //       let currLastLength;
    //       setLastLength(last => {
    //         currLastLength = last;
    //         return last;
    //       });
    //       if (nextState.storeIndexer.length != currLastLength) {
    //         setPage(page => page + 1);
    //       }
    //       setLastLength(nextState.storeIndexer.length);
    //       //@ts-ignore
    //       window.loadingData = false;
    //       setIsLoading(false);
    //       setState(nextState);
    //     }
    //   } else {
    //     console.log('------->No pagination detected');
    //     if (!storeAddress || !ownerAddress) {
    //       if (isReady) {
    //         setIsLoading(false);
    //       }
    //       return;
    //     } else if (!state.store) {
    //       setIsLoading(true);
    //     }
    //     nextState = !USE_SPEED_RUN
    //       ? await loadAccounts(connection, ownerAddress)
    //       : await limitedLoadAccounts(connection);
    //     console.log('------->Query finished');
    //     setState(nextState);
    //     //@ts-ignore
    //     window.loadingData = false;
    //     setIsLoading(false);
    //   }
    //   console.log('------->set finished');
    //   if (auctionAddress && bidderAddress) {
    //     nextState = await pullAuctionSubaccounts(
    //       connection,
    //       auctionAddress,
    //       nextState,
    //     );
    //     setState(nextState);
    //     const auctionBidderKey = auctionAddress + '-' + bidderAddress;
    //     return [
    //       nextState.auctions[auctionAddress],
    //       nextState.bidderPotsByAuctionAndBidder[auctionBidderKey],
    //       nextState.bidderMetadataByAuctionAndBidder[auctionBidderKey],
    //     ];
    //   }
    // }
    react_1.useEffect(() => {
        //@ts-ignore
        if (window.loadingData) {
            console.log('currently another update is running, so queue for 3s...');
            updateRequestsInQueue.current += 1;
            const interval = setInterval(() => {
                //@ts-ignore
                if (window.loadingData) {
                    console.log('not running queued update right now, still loading');
                }
                else {
                    console.log('running queued update');
                    // update(undefined, undefined);
                    updateRequestsInQueue.current -= 1;
                    clearInterval(interval);
                }
            }, 3000);
        }
        else {
            console.log('no update is running, updating.');
            // update(undefined, undefined);
            updateRequestsInQueue.current = 0;
        }
    }, [
        connection,
        setState,
        updateMints,
        storeAddress,
        isReady,
        page,
    ]);
    react_1.useEffect(() => {
        (async () => {
            if (!storeAddress || !ownerAddress) {
                if (isReady) {
                    setIsLoading(false);
                }
                return;
            }
            else if (!state.store) {
                setIsLoading(true);
            }
            const nextState = await loadAccounts_1.loadAccounts(connection, ownerAddress);
            setState(nextState);
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // } else {
            //   const nextState = await loadAccountsNoWallet(connection, ownerAddress);
            //   setState(nextState);        
            // }
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // }
            setIsLoading(false);
        })();
    }, [storeAddress, isReady, ownerAddress]);
    // Fetch metadata on userAccounts change
    // useEffect(() => {
    //   const shouldFetch =
    //     !isLoading &&
    //     !isLoadingMetadata &&
    //     loadedMetadataLength.current !== userAccounts.length;
    //   if (shouldFetch) {
    //     pullUserMetadata(userAccounts);
    //   }
    // }, [
    //   isLoading,
    //   isLoadingMetadata,
    //   loadedMetadataLength.current,
    //   userAccounts.length,
    // ]);
    const isFetching = isLoading || updateRequestsInQueue.current > 0;
    return (react_1.default.createElement(MetaContext.Provider, { value: {
            ...state,
            patchState,
            // @ts-ignore
            // update,
            // pullAuctionPage,
            // pullAllMetadata,
            // pullBillingPage,
            // @ts-ignore
            // pullAllSiteData,
            // pullItemsPage,
            // pullPackPage,
            // pullUserMetadata,
            isLoading,
            // isFetching,
        } }, children));
}
exports.MetaProvider = MetaProvider;
const useMeta = () => {
    const context = react_1.useContext(MetaContext);
    return context;
};
exports.useMeta = useMeta;
//# sourceMappingURL=meta.js.map