import { MessageSignerWalletAdapterProps, SignerWalletAdapter, SignerWalletAdapterProps, WalletAdapterProps, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import React, { ReactNode } from 'react';
export interface WalletContextState extends WalletAdapterProps {
    wallets: Wallet[];
    autoConnect: boolean;
    wallet: Wallet | null;
    adapter: SignerWalletAdapter | MessageSignerWalletAdapterProps | null;
    disconnecting: boolean;
    select(walletName: WalletName): void;
    signTransaction: SignerWalletAdapterProps['signTransaction'];
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'];
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}
export declare function useWallet(): WalletContextState;
export { SignerWalletAdapter, WalletNotConnectedError };
export declare type WalletSigner = Pick<SignerWalletAdapter, 'publicKey' | 'signTransaction' | 'signAllTransactions'>;
export interface WalletModalContextState {
    visible: boolean;
    setVisible: (open: boolean) => void;
}
export declare const WalletModalContext: React.Context<WalletModalContextState>;
export declare function useWalletModal(): WalletModalContextState;
export declare const WalletModal: () => JSX.Element;
export declare const WalletModalProvider: ({ children }: {
    children: ReactNode;
}) => JSX.Element;
export declare const WalletProvider: ({ children }: {
    children: ReactNode;
}) => JSX.Element;
//# sourceMappingURL=wallet.d.ts.map