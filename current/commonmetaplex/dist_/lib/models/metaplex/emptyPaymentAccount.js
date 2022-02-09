"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyPaymentAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const _1 = require(".");
const utils_1 = require("../../utils");
async function emptyPaymentAccount(acceptPayment, destination, auctionManager, metadata, masterEdition, safetyDepositBox, vault, auction, payer, recipient, winningConfigIndex, winningConfigItemIndex, creatorIndex, instructions) {
    const PROGRAM_IDS = utils_1.programIds();
    const store = PROGRAM_IDS.store;
    if (!store) {
        throw new Error('Store not initialized');
    }
    const safetyDepositConfig = await _1.getSafetyDepositConfig(auctionManager, safetyDepositBox);
    const tokenTracker = await _1.getAuctionWinnerTokenTypeTracker(auctionManager);
    const value = new _1.EmptyPaymentAccountArgs({
        winningConfigIndex,
        winningConfigItemIndex,
        creatorIndex,
    });
    const data = Buffer.from(borsh_1.serialize(_1.SCHEMA, value));
    const keys = [
        {
            pubkey: utils_1.toPublicKey(acceptPayment),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(destination),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(auctionManager),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(await _1.getPayoutTicket(auctionManager, winningConfigIndex, winningConfigItemIndex, creatorIndex, safetyDepositBox, recipient)),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(payer),
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(metadata),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(masterEdition || web3_js_1.SystemProgram.programId),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(safetyDepositBox),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(store),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(vault),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(auction),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: PROGRAM_IDS.token,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(tokenTracker),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(safetyDepositConfig),
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
exports.emptyPaymentAccount = emptyPaymentAccount;
//# sourceMappingURL=emptyPaymentAccount.js.map