"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimPack = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const utils_1 = require("../../../utils");
const __1 = require("../../..");
const find_1 = require("../find");
async function claimPack({ index, packSetKey, wallet, voucherMint, userToken, newMint, metadataMint, edition, randomOracle, }) {
    const PROGRAM_IDS = utils_1.programIds();
    const value = new __1.ClaimPackArgs({ index });
    const provingProcess = await find_1.findProvingProcessProgramAddress(utils_1.toPublicKey(packSetKey), wallet, utils_1.toPublicKey(voucherMint));
    const packCard = await find_1.findPackCardProgramAddress(utils_1.toPublicKey(packSetKey), index);
    const newMetadata = await __1.getMetadata(newMint);
    const metadata = await __1.getMetadata(metadataMint);
    const newEdition = await __1.getEdition(newMint);
    const masterEdition = await __1.getEdition(metadataMint);
    const editionMarkPda = await __1.getEditionMarkPda(metadataMint, edition);
    const programAuthority = await find_1.getProgramAuthority();
    const data = Buffer.from(borsh_1.serialize(__1.PACKS_SCHEMA, value));
    const keys = [
        // pack_set
        {
            pubkey: utils_1.toPublicKey(packSetKey),
            isSigner: false,
            isWritable: false,
        },
        // proving_process
        {
            pubkey: utils_1.toPublicKey(provingProcess),
            isSigner: false,
            isWritable: true,
        },
        // user_wallet
        {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        },
        // program_authority
        {
            pubkey: utils_1.toPublicKey(programAuthority),
            isSigner: false,
            isWritable: false,
        },
        // pack_card
        {
            pubkey: utils_1.toPublicKey(packCard),
            isSigner: false,
            isWritable: true,
        },
        // user_token_acc
        {
            pubkey: utils_1.toPublicKey(userToken),
            isSigner: false,
            isWritable: true,
        },
        // new_metadata_acc
        {
            pubkey: utils_1.toPublicKey(newMetadata),
            isSigner: false,
            isWritable: true,
        },
        // new_edition_acc
        {
            pubkey: utils_1.toPublicKey(newEdition),
            isSigner: false,
            isWritable: true,
        },
        // master_edition_acc
        {
            pubkey: utils_1.toPublicKey(masterEdition),
            isSigner: false,
            isWritable: true,
        },
        // new_mint_account
        {
            pubkey: utils_1.toPublicKey(newMint),
            isSigner: false,
            isWritable: true,
        },
        // new_mint_authority_acc
        {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        },
        // metadata_acc
        {
            pubkey: utils_1.toPublicKey(metadata),
            isSigner: false,
            isWritable: true,
        },
        // metadata_mint_acc
        {
            pubkey: utils_1.toPublicKey(metadataMint),
            isSigner: false,
            isWritable: true,
        },
        // edition_mark
        {
            pubkey: utils_1.toPublicKey(editionMarkPda),
            isSigner: false,
            isWritable: true,
        },
        // rent
        {
            pubkey: utils_1.toPublicKey(web3_js_1.SYSVAR_RENT_PUBKEY),
            isSigner: false,
            isWritable: false,
        },
        // randomness_oracle
        {
            pubkey: utils_1.toPublicKey(randomOracle),
            isSigner: false,
            isWritable: false,
        },
        // metaplex_token_metadata
        {
            pubkey: utils_1.toPublicKey(utils_1.programIds().metadata),
            isSigner: false,
            isWritable: false,
        },
        // spl_token program
        {
            pubkey: utils_1.programIds().token,
            isSigner: false,
            isWritable: false,
        },
        // system_program
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: utils_1.toPublicKey(PROGRAM_IDS.pack_create),
        data,
    });
}
exports.claimPack = claimPack;
//# sourceMappingURL=claimPack.js.map