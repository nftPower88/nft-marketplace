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
exports.PoolIcon = exports.TokenIcon = void 0;
const react_1 = __importStar(require("react"));
const utils_1 = require("../../utils");
const connection_1 = require("../../contexts/connection");
const Identicon_1 = require("../Identicon");
const TokenIcon = (props) => {
    var _a, _b;
    const [showIcon, setShowIcon] = react_1.useState(true);
    let icon = '';
    if (props.tokenMap) {
        icon = utils_1.getTokenIcon(props.tokenMap, props.mintAddress);
    }
    else {
        const { tokenMap } = connection_1.useConnectionConfig();
        icon = utils_1.getTokenIcon(tokenMap, props.mintAddress);
    }
    const size = props.size || 20;
    if (showIcon && icon) {
        return (react_1.default.createElement("img", { alt: "Token icon", className: props.className, key: icon, width: ((_a = props.style) === null || _a === void 0 ? void 0 : _a.width) || size.toString(), height: ((_b = props.style) === null || _b === void 0 ? void 0 : _b.height) || size.toString(), src: icon, style: {
                marginRight: '0.5rem',
                marginTop: '0.11rem',
                borderRadius: '10rem',
                backgroundColor: 'white',
                backgroundClip: 'padding-box',
                ...props.style,
            }, onError: () => setShowIcon(false) }));
    }
    return (react_1.default.createElement(Identicon_1.Identicon, { address: props.mintAddress, style: {
            marginRight: '0.5rem',
            width: size,
            height: size,
            marginTop: 2,
            ...props.style,
        } }));
};
exports.TokenIcon = TokenIcon;
const PoolIcon = (props) => {
    return (react_1.default.createElement("div", { className: props.className, style: { display: 'flex' } },
        react_1.default.createElement(exports.TokenIcon, { mintAddress: props.mintA, style: { marginRight: '-0.5rem', ...props.style } }),
        react_1.default.createElement(exports.TokenIcon, { mintAddress: props.mintB })));
};
exports.PoolIcon = PoolIcon;
//# sourceMappingURL=index.js.map