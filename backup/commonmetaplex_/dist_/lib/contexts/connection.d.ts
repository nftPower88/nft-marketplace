import { ENV as ChainId, TokenInfo } from '@solana/spl-token-registry';
import { Blockhash, Commitment, Connection, FeeCalculator, Keypair, RpcResponseAndContext, SimulatedTransactionResponse, Transaction, TransactionInstruction } from '@solana/web3.js';
import { ReactNode } from 'react';
import { WalletSigner } from './wallet';
interface BlockhashAndFeeCalculator {
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}
export declare type ENV = 'mainnet-beta (Triton)' | 'mainnet-beta (Triton Staging)' | 'mainnet-beta (Solana)' | 'mainnet-beta (Serum)' | 'testnet' | 'devnet' | 'localnet' | 'lending';
export declare const ENDPOINTS: {
    name: ENV;
    endpoint: string;
    ChainId: ChainId;
}[];
export declare function ConnectionProvider({ children, }: {
    children: ReactNode;
}): JSX.Element;
export declare function useConnection(): Connection;
export declare function useConnectionConfig(): {
    endpoint: string;
    setEndpoint: (val: string) => void;
    env: ENV;
    tokens: TokenInfo[];
    tokenMap: Map<string, TokenInfo>;
};
export declare const getErrorForTransaction: (connection: Connection, txid: string) => Promise<string[]>;
export declare enum SequenceType {
    Sequential = 0,
    Parallel = 1,
    StopOnFailure = 2
}
export declare function sendTransactionsWithManualRetry(connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[][], signers: Keypair[][]): Promise<void>;
export declare const sendTransactions: (connection: Connection, wallet: WalletSigner, instructionSet: TransactionInstruction[][], signersSet: Keypair[][], sequenceType?: SequenceType, commitment?: Commitment, successCallback?: (txid: string, ind: number) => void, failCallback?: (reason: string, ind: number) => boolean, block?: BlockhashAndFeeCalculator | undefined) => Promise<number>;
export declare const sendTransaction: (connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[], signers: Keypair[], awaitConfirmation?: boolean, commitment?: Commitment, includesFeePayer?: boolean, block?: BlockhashAndFeeCalculator | undefined) => Promise<{
    txid: string;
    slot: number;
}>;
export declare const sendTransactionWithRetry: (connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[], signers: Keypair[], commitment?: Commitment, includesFeePayer?: boolean, block?: BlockhashAndFeeCalculator | undefined, beforeSend?: (() => void) | undefined) => Promise<{
    txid: string;
    slot: number;
}>;
export declare const getUnixTs: () => number;
export declare function sendSignedTransaction({ signedTransaction, connection, }: {
    signedTransaction: Transaction;
    connection: Connection;
    sendingMessage?: string;
    sentMessage?: string;
    successMessage?: string;
    timeout?: number;
}): Promise<{
    txid: string;
    slot: number;
}>;
export declare function simulateTransaction(connection: Connection, transaction: Transaction, commitment: Commitment): Promise<RpcResponseAndContext<SimulatedTransactionResponse>>;
export {};
//# sourceMappingURL=connection.d.ts.map