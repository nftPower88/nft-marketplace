"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const icons_1 = require("@ant-design/icons");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const antd_1 = require("antd");
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const utils_1 = require("../../utils");
const Identicon_1 = require("../Identicon");
const Settings = ({ additionalSettings, }) => {
    const { publicKey } = wallet_adapter_react_1.useWallet();
    return (react_1.default.createElement("div", { className: "metaplex-settings" },
        react_1.default.createElement(antd_1.Space, { direction: "vertical", align: "center" },
            react_1.default.createElement(Identicon_1.Identicon, { address: publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58(), size: 48 }),
            publicKey && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(antd_1.Tooltip, { title: "Address copied" },
                    react_1.default.createElement("div", { onClick: () => navigator.clipboard.writeText((publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58()) || '') },
                        react_1.default.createElement(icons_1.CopyOutlined, null),
                        "\u00A0",
                        utils_1.shortenAddress(publicKey === null || publicKey === void 0 ? void 0 : publicKey.toBase58()))),
                react_1.default.createElement(react_router_dom_1.Link, { to: `/profile` }, "View Profile")))),
        additionalSettings && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(antd_1.Divider, null),
            additionalSettings))));
};
exports.Settings = Settings;
//# sourceMappingURL=index.js.map