/// <reference types="react" />
import { PublicKey } from '@solana/web3.js';
import { KnownTokenMap } from '../../utils';
export declare const TokenIcon: ({ mintAddress, size, tokenMap, }: {
    mintAddress?: string | PublicKey | undefined;
    size?: number | undefined;
    tokenMap?: KnownTokenMap | undefined;
}) => JSX.Element;
export declare const PoolIcon: (props: {
    mintA: string;
    mintB: string;
}) => JSX.Element;
//# sourceMappingURL=index.d.ts.map