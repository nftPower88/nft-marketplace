"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStore = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const _1 = require(".");
const utils_1 = require("../../utils");
async function setStore(isPublic, admin, payer, instructions) {
    const PROGRAM_IDS = utils_1.programIds();
    const store = PROGRAM_IDS.store;
    if (!store) {
        throw new Error('Store not initialized');
    }
    const value = new _1.SetStoreArgs({ public: isPublic });
    const data = Buffer.from(borsh_1.serialize(_1.SCHEMA, value));
    const keys = [
        {
            pubkey: utils_1.toPublicKey(store),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: utils_1.toPublicKey(admin),
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(payer),
            isSigner: true,
            isWritable: false,
        },
        { pubkey: PROGRAM_IDS.token, isSigner: false, isWritable: false },
        {
            pubkey: utils_1.toPublicKey(PROGRAM_IDS.vault),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(PROGRAM_IDS.metadata),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.toPublicKey(PROGRAM_IDS.auction),
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: PROGRAM_IDS.system,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
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
exports.setStore = setStore;
//# sourceMappingURL=setStore.js.map