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
exports.WalletProvider = exports.WalletModalProvider = exports.WalletModal = exports.useWalletModal = exports.WalletModalContext = exports.WalletNotConnectedError = exports.useWallet = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
Object.defineProperty(exports, "WalletNotConnectedError", { enumerable: true, get: function () { return wallet_adapter_base_1.WalletNotConnectedError; } });
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const wallet_adapter_wallets_1 = require("@solana/wallet-adapter-wallets");
const antd_1 = require("antd");
const react_1 = __importStar(require("react"));
const utils_1 = require("../utils");
const connection_1 = require("./connection");
function useWallet() {
    return wallet_adapter_react_1.useWallet();
}
exports.useWallet = useWallet;
exports.WalletModalContext = react_1.createContext({});
function useWalletModal() {
    return react_1.useContext(exports.WalletModalContext);
}
exports.useWalletModal = useWalletModal;
const WalletModal = () => {
    const { wallets, wallet: selected, select } = useWallet();
    const { visible, setVisible } = useWalletModal();
    const close = react_1.useCallback(() => setVisible(false), [setVisible]);
    return (react_1.default.createElement(antd_1.Modal, { title: "Select Wallet", okText: "Connect", visible: visible, footer: null, onCancel: close, width: 400 }, wallets.map(wallet => {
        return (react_1.default.createElement(antd_1.Button, { key: wallet.name, size: "large", type: wallet === selected ? 'primary' : 'ghost', onClick: () => {
                select(wallet.name);
                close();
            }, icon: react_1.default.createElement("img", { alt: `${wallet.name}`, width: 20, height: 20, src: wallet.icon, style: { marginRight: 8 } }), style: {
                display: 'block',
                width: '100%',
                textAlign: 'left',
                marginBottom: 8,
            } }, wallet.name));
    })));
};
exports.WalletModal = WalletModal;
const WalletModalProvider = ({ children }) => {
    const { publicKey } = useWallet();
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
    const { env } = connection_1.useConnectionConfig();
    const network = react_1.useMemo(() => {
        switch (env) {
            case 'mainnet-beta':
                return wallet_adapter_base_1.WalletAdapterNetwork.Mainnet;
            case 'testnet':
                return wallet_adapter_base_1.WalletAdapterNetwork.Testnet;
            case 'devnet':
            case 'localnet':
            default:
                return wallet_adapter_base_1.WalletAdapterNetwork.Devnet;
        }
    }, [env]);
    const wallets = react_1.useMemo(() => [
        wallet_adapter_wallets_1.getPhantomWallet(),
        wallet_adapter_wallets_1.getSlopeWallet(),
        wallet_adapter_wallets_1.getSolflareWallet(),
        wallet_adapter_wallets_1.getTorusWallet({
            options: { clientId: 'Get a client ID @ https://developer.tor.us' },
        }),
        wallet_adapter_wallets_1.getLedgerWallet(),
        wallet_adapter_wallets_1.getSolletWallet({ network }),
        wallet_adapter_wallets_1.getSolletExtensionWallet({ network }),
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