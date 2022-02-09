import React, { FC } from 'react';
import { StringPublicKey } from '../utils';
export interface StorefrontMeta {
    title: string;
    description: string;
    favicon: string;
}
export interface StorefrontTheme {
    logo?: string;
    banner?: string;
    stylesheet: string;
    color: {
        primary: string;
        background: string;
    };
    font: {
        title: string;
        text: string;
    };
}
export interface Storefront {
    pubkey: string;
    subdomain: string;
    meta: StorefrontMeta;
    theme: StorefrontTheme;
}
export interface StorefrontConfig {
    storefront: Storefront | void;
}
export interface ArweaveTag {
    name: string;
    value: string;
}
export interface ArweaveTransaction {
    id: string;
    tags: ArweaveTag[];
}
declare type ArweaveNode = ArweaveTransaction;
export interface ArweaveEdge {
    node: ArweaveNode;
}
export interface ArweaveConnection {
    edges: ArweaveEdge[];
}
export interface ArweaveQueries {
    transactions: ArweaveConnection;
}
export interface ArweaveQueryResponse {
    data: ArweaveQueries;
}
interface StoreConfig {
    storeAddress?: StringPublicKey;
    isConfigured: boolean;
    isReady: boolean;
    setStoreForOwner: (ownerAddress?: string) => Promise<string | undefined>;
    ownerAddress?: StringPublicKey;
    storefront: Storefront;
}
export declare const StoreContext: React.Context<StoreConfig>;
export declare const StoreProvider: FC<{
    storefront: Storefront;
    storeAddress?: string;
}>;
export declare const useStore: () => StoreConfig;
export {};
//# sourceMappingURL=store.d.ts.map