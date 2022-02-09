"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuction = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const _1 = require(".");
const utils_1 = require("../../utils");
async function startAuction(vault, auctionManagerAuthority, instructions) {
    const PROGRAM_IDS = utils_1.programIds();
    const store = PROGRAM_IDS.store;
    if (!store) {
        throw new Error('Store not initialized');
    }
    const { auctionKey, auctionManagerKey } = await _1.getAuctionKeys(vault);
    const value = new _1.StartAuctionArgs();
    const data = Buffer.from(borsh_1.serialize(_1.SCHEMA, value));
    const keys = [
        {
            pubkey: utils_1.toPublicKey(auctionManagerKey),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(auctionKey),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(auctionManagerAuthority),
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: store,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(PROGRAM_IDS.auction),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    instructions.push(new web3_js_1.TransactionInstruction({
        keys,
        programId: utils_1.toPublicKey(PROGRAM_IDS.metaplex),
        data,
    }));
}
exports.startAuction = startAuction;
//# sourceMappingURL=startAuction.js.map