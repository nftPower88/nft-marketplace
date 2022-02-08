"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAuctions = void 0;
const actions_1 = require("../../actions");
const utils_1 = require("../../utils");
const accounts_1 = require("../accounts");
const AUCTION_BLACK_LIST = [
    '9zcrbzSmBPdDjAGYXkfufP2wy1kbHKac8UYLBmHpbuYy',
    'DzR58tU6ZXx2sMBVjaL2dhNF9SL9qd42eYXLbtu5qcCx',
    '5c87cDHxwiF3jeapwrYEtJjCxoddMrRKRwrFh7NAATtg',
];
const processAuctions = async ({ account, pubkey }, setter) => {
    if (!isAuctionAccount(account) || isOnBlackList(pubkey))
        return;
    try {
        const parsedAccount = accounts_1.cache.add(pubkey, account, actions_1.AuctionParser, false);
        setter('auctions', pubkey, parsedAccount);
    }
    catch (e) {
        // ignore errors
        // add type as first byte for easier deserialization
    }
    try {
        if (isExtendedAuctionAccount(account)) {
            const parsedAccount = accounts_1.cache.add(pubkey, account, actions_1.AuctionDataExtendedParser, false);
            setter('auctionDataExtended', pubkey, parsedAccount);
        }
    }
    catch {
        // ignore errors
        // add type as first byte for easier deserialization
    }
    try {
        if (isBidderMetadataAccount(account)) {
            const parsedAccount = accounts_1.cache.add(pubkey, account, actions_1.BidderMetadataParser, false);
            setter('bidderMetadataByAuctionAndBidder', parsedAccount.info.auctionPubkey +
                '-' +
                parsedAccount.info.bidderPubkey, parsedAccount);
        }
    }
    catch {
        // ignore errors
        // add type as first byte for easier deserialization
    }
    try {
        if (isBidderPotAccount(account)) {
            const parsedAccount = accounts_1.cache.add(pubkey, account, actions_1.BidderPotParser, false);
            setter('bidderPotsByAuctionAndBidder', parsedAccount.info.auctionAct + '-' + parsedAccount.info.bidderAct, parsedAccount);
        }
    }
    catch {
        // ignore errors
        // add type as first byte for easier deserialization
    }
};
exports.processAuctions = processAuctions;
const isOnBlackList = (pubkey) => AUCTION_BLACK_LIST.includes(pubkey);
const isAuctionAccount = account => utils_1.pubkeyToString(account === null || account === void 0 ? void 0 : account.owner) === utils_1.AUCTION_ID;
const isExtendedAuctionAccount = account => account.data.length === actions_1.MAX_AUCTION_DATA_EXTENDED_SIZE;
const isBidderMetadataAccount = account => account.data.length === actions_1.BIDDER_METADATA_LEN;
const isBidderPotAccount = account => account.data.length === actions_1.BIDDER_POT_LEN;
//# sourceMappingURL=processAuctions.js.map