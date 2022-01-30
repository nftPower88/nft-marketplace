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
exports.WalletProvider = exports.WalletModalProvider = exports.WalletModal = exports.useWalletModal = exports.WalletModalContext = void 0;
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const wallet_adapter_wallets_1 = require("@solana/wallet-adapter-wallets");
const antd_1 = require("antd");
const react_1 = __importStar(require("react"));
const components_1 = require("../components");
const utils_1 = require("../utils");
const { Panel } = antd_1.Collapse;
exports.WalletModalContext = react_1.createContext({
    visible: false,
    setVisible: () => { },
});
function useWalletModal() {
    return react_1.useContext(exports.WalletModalContext);
}
exports.useWalletModal = useWalletModal;
const WalletModal = () => {
    const { wallets, select } = wallet_adapter_react_1.useWallet();
    const { visible, setVisible } = useWalletModal();
    const close = react_1.useCallback(() => {
        setVisible(false);
    }, [setVisible]);
    const phatomWallet = react_1.useMemo(() => wallet_adapter_wallets_1.getPhantomWallet(), []);
    return (
    // <MetaplexModal title="Pick a wallet to connect to Queendom" centered visible={visible} onCancel={close} bodyStyle={{borderRadius:'5px',boxShadow:'2px 5px 10px'}}>
    react_1.default.createElement(components_1.MetaplexModal, { centered: true, visible: visible, onCancel: close, closable: false },
        react_1.default.createElement("h4", { className: 'mb-3' }, "Pick a wallet to conneect to Queendom"),
        react_1.default.createElement(antd_1.Button, { type: 'link', className: "metaplex-button-jumbo d-flex", size: "large", onClick: () => {
                console.log(phatomWallet.name);
                select(phatomWallet.name);
                close();
            } },
            react_1.default.createElement("img", { src: phatomWallet === null || phatomWallet === void 0 ? void 0 : phatomWallet.icon }),
            react_1.default.createElement("h4", { style: { paddingLeft: '2px' }, className: 'ms-4 pt-1' }, "Connect to Phantom")),
        react_1.default.createElement(antd_1.Collapse, { ghost: true, expandIcon: panelProps => panelProps.isActive ? (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "gray", xmlns: "http://www.w3.org/2000/svg" },
                react_1.default.createElement("path", { d: "M15 7.5L10 12.5L5 7.5", stroke: "gray", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }))) : (react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "gray", xmlns: "http://www.w3.org/2000/svg" },
                react_1.default.createElement("path", { d: "M7.5 5L12.5 10L7.5 15", stroke: "gray", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }))) },
            react_1.default.createElement(Panel, { header: react_1.default.createElement("strong", { className: 'ms-4' }, "Other Wallet"), key: "1" },
                react_1.default.createElement(antd_1.Space, { wrap: true }, wallets.map((wallet, idx) => {
                    if (wallet.name === 'Phantom')
                        return null;
                    return (react_1.default.createElement(antd_1.Button, { key: idx, onClick: () => {
                            select(wallet.name);
                            close();
                        } },
                        "Connect to ",
                        wallet.name));
                }))))));
};
exports.WalletModal = WalletModal;
const WalletModalProvider = ({ children, }) => {
    const { publicKey } = wallet_adapter_react_1.useWallet();
    const [connected, setConnected] = react_1.useState(!!publicKey);
    const [visible, setVisible] = react_1.useState(false);
    react_1.useEffect(() => {
        if (publicKey) {
            const base58 = publicKey.toBase58();
            const keyToDisplay = base58.length > 20
                ? `${base58.substring(0, 7)}.....${base58.substring(base58.length - 7, base58.length)}`
                : base58;
            utils_1.notify({
                message: 'Wallet update',
                description: 'Connected to wallet ' + keyToDisplay,
            });
        }
    }, [publicKey]);
    react_1.useEffect(() => {
        if (!publicKey && connected) {
            utils_1.notify({
                message: 'Wallet update',
                description: 'Disconnected from wallet',
            });
        }
        setConnected(!!publicKey);
    }, [publicKey, connected, setConnected]);
    return (react_1.default.createElement(exports.WalletModalContext.Provider, { value: {
            visible,
            setVisible,
        } },
        children,
        react_1.default.createElement(exports.WalletModal, null)));
};
exports.WalletModalProvider = WalletModalProvider;
const WalletProvider = ({ children }) => {
    const wallets = react_1.useMemo(() => [
        wallet_adapter_wallets_1.getPhantomWallet(),
        wallet_adapter_wallets_1.getSolflareWallet(),
        wallet_adapter_wallets_1.getLedgerWallet(),
        wallet_adapter_wallets_1.getSolongWallet(),
        wallet_adapter_wallets_1.getMathWallet(),
        wallet_adapter_wallets_1.getSolletWallet(),
    ], []);
    const onError = react_1.useCallback((error) => {
        console.error(error);
        utils_1.notify({
            message: 'Wallet error',
            description: error.message,
        });
    }, []);
    return (react_1.default.createElement(wallet_adapter_react_1.WalletProvider, { wallets: wallets, onError: onError, autoConnect: true },
        react_1.default.createElement(exports.WalletModalProvider, null, children)));
};
exports.WalletProvider = WalletProvider;
//# sourceMappingURL=wallet.js.map