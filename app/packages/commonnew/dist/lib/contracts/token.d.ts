import { SignerWalletAdapter } from '../contexts/wallet';
import { Connection, PublicKey } from '@solana/web3.js';
export declare const mintNFT: (connection: Connection, wallet: SignerWalletAdapter, owner: PublicKey) => Promise<{
    txid: string;
    mint: PublicKey;
    account: PublicKey;
}>;
//# sourceMappingURL=token.d.ts.map