"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmptyMetaState = void 0;
const getEmptyMetaState = () => ({
    metadata: [],
    metadataByMetadata: {},
    metadataByMint: {},
    metadataByAuction: {},
    masterEditions: {},
    masterEditionsByPrintingMint: {},
    masterEditionsByOneTimeAuthMint: {},
    metadataByMasterEdition: {},
    editions: {},
    auctionManagersByAuction: {},
    bidRedemptions: {},
    auctions: {},
    auctionDataExtended: {},
    vaults: {},
    payoutTickets: {},
    store: null,
    whitelistedCreatorsByCreator: {},
    bidderMetadataByAuctionAndBidder: {},
    bidderPotsByAuctionAndBidder: {},
    safetyDepositBoxesByVaultAndIndex: {},
    prizeTrackingTickets: {},
    safetyDepositConfigsByAuctionManagerAndIndex: {},
    bidRedemptionV2sByAuctionManagerAndWinningIndex: {},
    auctionCaches: {},
    storeIndexer: [],
    auctionCachesByAuctionManager: {},
});
exports.getEmptyMetaState = getEmptyMetaState;
//# sourceMappingURL=getEmptyMetaState.js.map