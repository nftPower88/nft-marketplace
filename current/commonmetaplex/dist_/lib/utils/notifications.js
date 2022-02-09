"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
function notify({ type = 'info', txid = undefined, message = '', description = undefined, placement = 'bottomLeft', ...rest }) {
    if (txid) {
        //   <Link
        //     external
        //     to={'https://explorer.solana.com/tx/' + txid}
        //   >
        //     View transaction {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
        //   </Link>
        description = react_1.default.createElement(react_1.default.Fragment, null);
    }
    antd_1.notification[type]({
        ...rest,
        message: react_1.default.createElement("span", null, message),
        description: react_1.default.createElement("span", null, description),
        placement,
    });
}
exports.notify = notify;
//# sourceMappingURL=notifications.js.map