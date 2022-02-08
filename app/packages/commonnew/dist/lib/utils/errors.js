"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransactionTimeoutError = exports.TransactionTimeoutError = exports.isSignTransactionError = exports.SignTransactionError = exports.isSendTransactionError = exports.SendTransactionError = void 0;
class SendTransactionError extends Error {
    constructor(message, txId, txError) {
        super(message);
        this.txError = txError;
        this.txId = txId;
    }
}
exports.SendTransactionError = SendTransactionError;
function isSendTransactionError(error) {
    return error instanceof SendTransactionError;
}
exports.isSendTransactionError = isSendTransactionError;
class SignTransactionError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.SignTransactionError = SignTransactionError;
function isSignTransactionError(error) {
    return error instanceof SignTransactionError;
}
exports.isSignTransactionError = isSignTransactionError;
class TransactionTimeoutError extends Error {
    constructor(txId) {
        super(`Transaction has timed out`);
        this.txId = txId;
    }
}
exports.TransactionTimeoutError = TransactionTimeoutError;
function isTransactionTimeoutError(error) {
    return error instanceof TransactionTimeoutError;
}
exports.isTransactionTimeoutError = isTransactionTimeoutError;
//# sourceMappingURL=errors.js.map