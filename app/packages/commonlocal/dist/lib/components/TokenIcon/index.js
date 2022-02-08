"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolIcon = exports.TokenIcon = void 0;
const react_1 = __importDefault(require("react"));
const utils_1 = require("../../utils");
const connection_1 = require("../../contexts/connection");
const Identicon_1 = require("../Identicon");
const TokenIcon = ({ mintAddress, size = 20, tokenMap, }) => {
    let icon = '';
    if (tokenMap) {
        icon = utils_1.getTokenIcon(tokenMap, mintAddress);
    }
    else {
        const { tokenMap } = connection_1.useConnectionConfig();
        icon = utils_1.getTokenIcon(tokenMap, mintAddress);
    }
    if (icon) {
        return (react_1.default.createElement("img", { alt: "Token icon", key: icon, width: size.toString(), height: size.toString(), src: icon }));
    }
    return react_1.default.createElement(Identicon_1.Identicon, { address: mintAddress });
};
exports.TokenIcon = TokenIcon;
const PoolIcon = (props) => {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(exports.TokenIcon, { mintAddress: props.mintA }),
        react_1.default.createElement(exports.TokenIcon, { mintAddress: props.mintB })));
};
exports.PoolIcon = PoolIcon;
//# sourceMappingURL=index.js.map