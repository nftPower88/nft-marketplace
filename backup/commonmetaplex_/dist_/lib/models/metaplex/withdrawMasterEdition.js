"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawMasterEdition = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const _1 = require(".");
const actions_1 = require("../../actions");
const utils_1 = require("../../utils");
async function withdrawMasterEdition(vault, safetyDepositTokenStore, destination, safetyDeposit, fractionMint, mint, instructions) {
    const PROGRAM_IDS = utils_1.programIds();
    const store = PROGRAM_IDS.store;
    if (!store) {
        throw new Error('Store not initialized');
    }
    const { auctionKey, auctionManagerKey } = await _1.getAuctionKeys(vault);
    const prizeTrackingTicket = await _1.getPrizeTrackingTicket(auctionManagerKey, mint);
    const vaultAuthority = (await utils_1.findProgramAddress([
        Buffer.from(actions_1.VAULT_PREFIX),
        utils_1.toPublicKey(PROGRAM_IDS.vault).toBuffer(),
        utils_1.toPublicKey(vault).toBuffer(),
    ], utils_1.toPublicKey(PROGRAM_IDS.vault)))[0];
    const auctionExtended = (await utils_1.findProgramAddress([
        Buffer.from(actions_1.AUCTION_PREFIX),
        utils_1.toPublicKey(PROGRAM_IDS.auction).toBuffer(),
        utils_1.toPublicKey(vault).toBuffer(),
        Buffer.from(actions_1.EXTENDED),
    ], utils_1.toPublicKey(PROGRAM_IDS.auction)))[0];
    const safetyDepositConfig = await _1.getSafetyDepositConfig(auctionManagerKey, safetyDeposit);
    const value = new _1.WithdrawMasterEditionArgs();
    const data = Buffer.from(borsh_1.serialize(_1.SCHEMA, value));
    const keys = [
        {
            pubkey: utils_1.toPublicKey(auctionManagerKey),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(safetyDepositTokenStore),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(destination),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(safetyDeposit),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(vault),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(fractionMint),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(prizeTrackingTicket),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(vaultAuthority),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(auctionKey),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(auctionExtended),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: PROGRAM_IDS.token,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(PROGRAM_IDS.vault),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(store),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
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
exports.withdrawMasterEdition = withdrawMasterEdition;
//# sourceMappingURL=withdrawMasterEdition.js.map