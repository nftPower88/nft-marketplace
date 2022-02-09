/// <reference types="node" />
import { AccountInfo, Connection } from '@solana/web3.js';
import { StringPublicKey } from '../../utils/ids';
export declare const getAccountInfo: (connection: Connection, key: StringPublicKey) => Promise<AccountInfo<Buffer> | null>;
//# sourceMappingURL=getAccountInfo.d.ts.map