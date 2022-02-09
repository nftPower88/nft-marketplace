/// <reference types="react" />
import { TokenInfo, ENV as ChainId } from '@solana/spl-token-registry';
import { Keypair, Commitment, Connection, Transaction, TransactionInstruction, Blockhash, FeeCalculator } from '@solana/web3.js';
import { WalletSigner } from './wallet';
interface BlockhashAndFeeCalculator {
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}
export declare type ENDPOINT_NAME = 'mainnet-beta (Triton)' | 'mainnet-beta (Triton Staging)' | 'mainnet-beta (Solana)' | 'mainnet-beta (Serum)' | 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet' | 'lending';
export declare type ENV = ENDPOINT_NAME;
declare type EndpointMap = {
    name: ENDPOINT_NAME;
    endpoint: string;
    ChainId: ChainId;
};
export declare const ENDPOINTS: Array<EndpointMap>;
export declare function ConnectionProvider({ children }: {
    children: any;
}): JSX.Element;
export declare function useConnection(): Connection;
export declare function useConnectionConfig(): {
    setEndpointMap: (val: string) => void;
    setEndpoint: (val: string) => void;
    endpointMap: EndpointMap;
    endpoint: string;
    env: ENDPOINT_NAME;
    tokens: Map<string, TokenInfo>;
    tokenMap: Map<string, TokenInfo>;
};
export declare const getErrorForTransaction: (connection: Connection, txid: string) => Promise<string[]>;
export declare enum SequenceType {
    Sequential = 0,
    Parallel = 1,
    StopOnFailure = 2
}
export declare function sendTransactionsWithManualRetry(connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[][], signers: Keypair[][]): Promise<void>;
export declare const sendTransactionsInChunks: (connection: Connection, wallet: WalletSigner, instructionSet: TransactionInstruction[][], signersSet: Keypair[][], sequenceType: SequenceType | undefined, commitment: Commitment | undefined, timeout: number | undefined, batchSize: number) => Promise<number>;
export declare const sendTransactions: (connection: Connection, wallet: WalletSigner, instructionSet: TransactionInstruction[][], signersSet: Keypair[][], sequenceType?: SequenceType, commitment?: Commitment, successCallback?: (txid: string, ind: number) => void, failCallback?: (reason: string, ind: number) => boolean, block?: BlockhashAndFeeCalculator | undefined) => Promise<number>;
export declare const sendTransactionsWithRecentBlock: (connection: Connection, wallet: WalletSigner, instructionSet: TransactionInstruction[][], signersSet: Keypair[][], commitment?: Commitment) => Promise<number>;
export declare const sendTransaction: (connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[], signers: Keypair[], awaitConfirmation?: boolean, commitment?: Commitment, includesFeePayer?: boolean, block?: BlockhashAndFeeCalculator | undefined) => Promise<{
    txid: string;
    slot: number;
}>;
export declare const sendTransactionWithRetry: (connection: Connection, wallet: WalletSigner, instructions: TransactionInstruction[], signers: Keypair[], commitment?: Commitment, includesFeePayer?: boolean, block?: BlockhashAndFeeCalculator | undefined, beforeSend?: (() => void) | undefined) => Promise<{
    txid: string;
    slot: number;
}>;
export declare const getUnixTs: () => number;
export declare function sendSignedTransaction({ signedTransaction, connection, timeout, }: {
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
export {};
//# sourceMappingURL=connection.d.ts.map