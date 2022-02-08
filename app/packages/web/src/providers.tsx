import {
  AccountsProvider,
  ConnectionProvider,
  StoreProvider,
  WalletProvider,
  MetaProvider,
} from '@oyster/commonlocal';
import React, { FC } from 'react';
import { ConfettiProvider } from './components/Confetti';
import { AppLayout } from './components/Layout';
import { LoaderProvider } from './components/Loader';
import { CoingeckoProvider } from './contexts/coingecko';
import { Storefront } from '@oyster/commonlocal';
import { AnalyticsProvider } from './components/Analytics';
import getConfig from 'next/config';


let nextConfig = getConfig();
const publicRuntimeConfig = nextConfig.publicRuntimeConfig;

interface ProvidersProps {
  storefront: Storefront;
  children: React.ReactNode;
}

console.log(`publicRuntimeConfig.publicStoreAddress: ${publicRuntimeConfig.publicStoreAddress}`)
export const Providers: FC<ProvidersProps> = ({ children, storefront }) => {
  return (
    <ConnectionProvider>
      <StoreProvider
        storefront={storefront}
        storeAddress={publicRuntimeConfig.publicStoreAddress}
      >
        <WalletProvider>
          <AccountsProvider>
            <CoingeckoProvider>
              <MetaProvider>
                <LoaderProvider>
                  <ConfettiProvider>
                    <AnalyticsProvider>
                        <AppLayout storefront={storefront}>{children}</AppLayout>
                    </AnalyticsProvider>
                  </ConfettiProvider>
                </LoaderProvider>
              </MetaProvider>
            </CoingeckoProvider>
          </AccountsProvider>
        </WalletProvider>
      </StoreProvider>
    </ConnectionProvider>
  );
};
