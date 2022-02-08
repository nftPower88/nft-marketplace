import {
  useConnection,
  useStore,
  useWalletModal,
  WhitelistedCreator,
} from '@oyster/commonmetaplex';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Card, Row, Col } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { saveAdmin } from '../../actions/saveAdmin';
import { SetupVariables } from '../../components/SetupVariables';
import { useMeta } from '../../contexts';
import getConfig from 'next/config';


let nextConfig = getConfig();
const publicRuntimeConfig = nextConfig.publicRuntimeConfig;

export const SetupView = () => {
  const [isInitalizingStore, setIsInitalizingStore] = useState(false);
  const connection = useConnection();
  const { store } = useMeta();
  const { setStoreForOwner } = useStore();
  const history = useHistory();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const connect = useCallback(
    () => (wallet.wallet ? wallet.connect().catch() : setVisible(true)),
    [wallet.wallet, wallet.connect, setVisible],
  );
  const [storeAddress, setStoreAddress] = useState<string | undefined>();

  useEffect(() => {
    if (!publicRuntimeConfig.publicStoreOwnerAddress) {
      const getStore = async () => {
        if (wallet.publicKey) {
          const store = await setStoreForOwner(wallet.publicKey.toBase58());
          setStoreAddress(store);
        } else {
          setStoreAddress(undefined);
        }
      };
      getStore();
    }
  }, [wallet.publicKey]);

  const initializeStore = async () => {
    if (!wallet.publicKey) {
      console.error('failed to initialize store, wallet key not loaded');
      return;
    }

    setIsInitalizingStore(true);

    try {
      await saveAdmin(connection, wallet, false, [
        new WhitelistedCreator({
          address: wallet.publicKey.toBase58(),
          activated: true,
        }),
      ]);
      console.info('3');
    } catch (error) {
      console.error(`failed to initialize store: ${error}`)
    }

    // TODO: process errors

  //  await setStoreForOwner(undefined);
    await setStoreForOwner(wallet.publicKey.toBase58());

    history.push('/admin');
    console.info(`store initialized under: ${wallet.publicKey}`);
  };

  // @TODO SetupVariables is not getting called on store init, redirecting directly to admin page
  return (
    <Row justify="center">
      <Col xs={24} md={18} lg={14}>
        <Card>
          <Row justify="center">
            <Col>
              {!wallet.connected && (
                <p>
                  <Button type="primary" onClick={connect}>
                    Connect
                  </Button>{' '}
                  to configure store.
                </p>
              )}
              {wallet.connected && !store && (
                <>
                  <p>Store is not initialized yet</p>
                  <p>There must be some ◎ SOL in the wallet before initialization.</p>
                  <p>
                    After initialization, you will be able to manage the list of
                    creators
                  </p>

                  <p>
                    <Button
                      type="primary"
                      loading={isInitalizingStore}
                      onClick={initializeStore}
                    >
                      Init Store
                    </Button>
                  </p>
                </>
              )}
              {wallet.connected && store && (
                <>
                  <p>
                    To finish initialization please copy config below into{' '}
                    <b>packages/web/.env</b> and restart yarn or redeploy
                  </p>
                  <SetupVariables
                    storeAddress={storeAddress}
                    storeOwnerAddress={wallet.publicKey?.toBase58()}
                  />
                </>
              )}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};
