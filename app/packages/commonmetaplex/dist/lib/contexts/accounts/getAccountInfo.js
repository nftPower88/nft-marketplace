"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountInfo = void 0;
const web3_js_1 = require("@solana/web3.js");
const getAccountInfo = async (connection, key) => {
    const account = await connection.getAccountInfo(new web3_js_1.PublicKey(key));
    if (!account) {
        return null;
    }
    const { data, ...rest } = account;
    return {
        ...rest,
        data,
    };
};
exports.getAccountInfo = getAccountInfo;
//# sourceMappingURL=getAccountInfo.js.map