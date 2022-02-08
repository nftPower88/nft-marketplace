import { Connection } from '@solana/web3.js';
import { ProcessAccountsFunc } from '.';
import { StringPublicKey } from '../../utils';
import { MetaState } from './types';
interface ProgramListener {
    programId: StringPublicKey;
    processAccount: ProcessAccountsFunc;
}
export declare const subscribeProgramChanges: (connection: Connection, patchState: (state: Partial<MetaState>) => void, ...args: ProgramListener[]) => () => void;
export {};
//# sourceMappingURL=subscribeProgramChanges.d.ts.map