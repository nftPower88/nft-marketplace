"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserBadge = void 0;
const react_1 = __importStar(require("react"));
const web3_js_1 = require("@solana/web3.js");
const contexts_1 = require("../../contexts");
const utils_1 = require("../../utils");
require("./styles.css");
const antd_1 = require("antd");
const Settings_1 = require("../Settings");
const CurrentUserBadge = (props) => {
    const { wallet, publicKey } = contexts_1.useWallet();
    const { account } = contexts_1.useNativeAccount();
    const address = react_1.useMemo(() => {
        if (publicKey) {
            const base58 = publicKey.toBase58();
            return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
        }
    }, [publicKey]);
    if (!wallet || !address) {
        return null;
    }
    const iconStyle = props.showAddress
        ? {
            marginLeft: '0.5rem',
            display: 'flex',
            width: props.iconSize || 20,
            borderRadius: 50,
        }
        : {
            display: 'flex',
            width: props.iconSize || 20,
            paddingLeft: 0,
            borderRadius: 50,
        };
    const baseWalletKey = {
        height: props.iconSize,
        cursor: 'pointer',
        userSelect: 'none',
    };
    const walletKeyStyle = props.showAddress
        ? baseWalletKey
        : { ...baseWalletKey, paddingLeft: 0 };
    return (react_1.default.createElement("div", { className: "wallet-wrapper" },
        props.showBalance && (react_1.default.createElement("span", null,
            utils_1.formatNumber.format(((account === null || account === void 0 ? void 0 : account.lamports) || 0) / web3_js_1.LAMPORTS_PER_SOL),
            " SOL")),
        react_1.default.createElement(antd_1.Popover, { placement: "topRight", title: "Settings", content: react_1.default.createElement(Settings_1.Settings, null), trigger: "click" },
            react_1.default.createElement("div", { className: "wallet-key", style: walletKeyStyle },
                react_1.default.createElement("span", { style: { marginRight: '0.5rem' } }, address),
                react_1.default.createElement("img", { src: wallet.icon, style: iconStyle })))));
};
exports.CurrentUserBadge = CurrentUserBadge;
//# sourceMappingURL=index.js.map