import { StringPublicKey } from '../../utils/ids';
import { Metadata } from '../../actions';
import { WhitelistedCreator, AuctionManagerV1, AuctionManagerV2 } from '../../models/metaplex';
import { Connection } from '@solana/web3.js';
import { AccountAndPubkey, MetaState, ProcessAccountsFunc, UpdateStateValueFunc } from './types';
import { ParsedAccount } from '../accounts/types';
export declare const loadAccountsNoWallet: (connection: Connection, ownerAddress: StringPublicKey) => Promise<MetaState>;
export declare const loadAuction: (connection: Connection, auctionManager: ParsedAccount<AuctionManagerV1 | AuctionManagerV2>) => Promise<MetaState>;
export declare const makeSetter: (state: MetaState) => UpdateStateValueFunc<MetaState>;
export declare const processingAccounts: (updater: UpdateStateValueFunc) => (fn: ProcessAccountsFunc) => (accounts: AccountAndPubkey[]) => Promise<void>;
export declare const initMetadata: (metadata: ParsedAccount<Metadata>, whitelistedCreators: Record<string, ParsedAccount<WhitelistedCreator>>, setter: UpdateStateValueFunc) => Promise<void>;
//# sourceMappingURL=loadAccountsNoWallet.d.ts.map