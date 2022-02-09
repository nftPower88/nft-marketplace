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
exports.useMeta = exports.MetaProvider = void 0;
const lodash_1 = require("lodash");
const react_1 = __importStar(require("react"));
const connection_1 = require("../connection");
const store_1 = require("../store");
const getEmptyMetaState_1 = require("./getEmptyMetaState");
const loadAccounts_1 = require("./loadAccounts");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const MetaContext = react_1.default.createContext({
    ...getEmptyMetaState_1.getEmptyMetaState(),
    isLoading: false,
    patchState: () => {
        throw new Error('unreachable');
    },
});
function MetaProvider({ children = null }) {
    const connection = connection_1.useConnection();
    const { isReady, storeAddress, ownerAddress } = store_1.useStore();
    const { publicKey } = wallet_adapter_react_1.useWallet();
    const [state, setState] = react_1.useState(getEmptyMetaState_1.getEmptyMetaState());
    const [isLoading, setIsLoading] = react_1.useState(true);
    const patchState = (...args) => {
        setState(current => {
            var _a;
            const newState = lodash_1.merge({}, current, ...args, { store: current.store });
            const currentMetdata = (_a = current.metadata) !== null && _a !== void 0 ? _a : [];
            const nextMetadata = args.reduce((memo, { metadata = [] }) => {
                return [...memo, ...metadata];
            }, []);
            newState.metadata = lodash_1.uniqWith([...currentMetdata, ...nextMetadata], (a, b) => a.pubkey === b.pubkey);
            return newState;
        });
    };
    react_1.useEffect(() => {
        (async () => {
            if (!storeAddress || !ownerAddress) {
                if (isReady) {
                    setIsLoading(false);
                }
                return;
            }
            else if (!state.store) {
                setIsLoading(true);
            }
            const nextState = await loadAccounts_1.loadAccounts(connection, ownerAddress);
            setState(nextState);
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // } else {
            //   const nextState = await loadAccountsNoWallet(connection, ownerAddress);
            //   setState(nextState);        
            // }
            // if (publicKey) {
            //   const nextState = await loadAccounts(connection, ownerAddress);
            //   setState(nextState);
            // }
            setIsLoading(false);
        })();
    }, [storeAddress, isReady, ownerAddress]);
    return (react_1.default.createElement(MetaContext.Provider, { value: {
            ...state,
            patchState,
            isLoading,
        } }, children));
}
exports.MetaProvider = MetaProvider;
const useMeta = () => {
    const context = react_1.useContext(MetaContext);
    return context;
};
exports.useMeta = useMeta;
//# sourceMappingURL=meta.js.map