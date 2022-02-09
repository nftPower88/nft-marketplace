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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identicon = void 0;
const react_1 = __importStar(require("react"));
const jazzicon_1 = __importDefault(require("@metamask/jazzicon"));
const web3_js_1 = require("@solana/web3.js");
const Identicon = ({ size, address, alt, }) => {
    const pubkey = typeof address === 'string' ? new web3_js_1.PublicKey(address) : address;
    const ref = react_1.useRef(null);
    const el = react_1.useMemo(() => {
        if (!pubkey)
            return undefined;
        const el = jazzicon_1.default(72, Array.from(new Uint32Array(pubkey.toBytes())));
        // There's no need for jazzicon to dictate the element size, this allows
        // auto-scaling the element and its contents
        const svg = el.querySelector('svg');
        if (svg) {
            svg.setAttribute('viewBox', '0 0 72 72');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            ['x', 'y', 'width', 'height'].forEach(a => svg.removeAttribute(a));
        }
        return el;
    }, [pubkey]);
    react_1.useEffect(() => {
        // TODO: the current TSC toolchain does not have a correct definition for replaceChildren
        // @ts-ignore
        if (el && ref.current)
            ref.current.replaceChildren(el);
    }, [el, ref.current]);
    return (react_1.default.createElement("div", { title: alt, ref: ref, style: size ? { width: size, height: size } : {}, className: "metaplex-jazzicon" }));
};
exports.Identicon = Identicon;
//# sourceMappingURL=index.js.map