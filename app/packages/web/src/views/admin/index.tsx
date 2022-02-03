import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Layout,
  Row,
  Col,
  Table,
  Switch,
  Spin,
  Modal,
  Button,
  Input,
  Divider,
  Progress,
  Space,
} from 'antd';
import { useMeta } from '../../contexts';
import {
  Store,
  WhitelistedCreator,
  MasterEditionV1,
  notify,
  ParsedAccount,
  shortenAddress,
  StringPublicKey,
  useConnection,
  useStore,
  useUserAccounts,
  useWalletModal,
  WalletSigner,
  loadCreators,
  loadAuctionManagers,
  loadAuctionsForAuctionManagers,
  loadVaultsAndContentForAuthority,
  METAPLEX_ID,
  processMetaplexAccounts,
  subscribeProgramChanges,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { saveAdmin } from '../../actions/saveAdmin';
import {
  convertMasterEditions,
  filterMetadata,
} from '../../actions/convertMasterEditions';
import { Link } from 'react-router-dom';
import { SetupVariables } from '../../components/SetupVariables';
import { cacheAllAuctions } from '../../actions';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuctionManagersToCache, useNotifications } from '../../hooks';
import Bugsnag from '@bugsnag/browser';
import getConfig from 'next/config';

import { ENDPOINTS, useConnectionConfig } from '@oyster/common';

const { publicRuntimeConfig } = getConfig();

const { Content } = Layout;
export const AdminView = () => {
  const { store, whitelistedCreatorsByCreator, isLoading, patchState } =
    useMeta();
  const connection = useConnection();
  const wallet = useWallet();
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const { setVisible } = useWalletModal();
  const { connected, publicKey } = useWallet();
  const { ownerAddress } = useStore();
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  if (!wallet.publicKey) {
    console.log('wallet not connected');
    return (
      <Modal title="Add New Artist Address" visible={adminModalOpen}>
        <Col xs={24} md={12}>
          <h3>Convert Master Editions</h3>
          <p>You have</p>
        </Col>
      </Modal>
    );
  }

  const connect = useCallback(
    () => (wallet.wallet ? wallet.connect().catch() : setVisible(true)),
    [wallet.wallet, wallet.connect, setVisible],
  );
  const { storeAddress, setStoreForOwner, isConfigured } = useStore();

  useEffect(() => {
    if (
      !store &&
      !storeAddress &&
      wallet.publicKey &&
      !publicRuntimeConfig.publicStoreOwnerAddress
    ) {
      setStoreForOwner(wallet.publicKey.toBase58());
    }
  }, [store, storeAddress, wallet.publicKey]);

  useEffect(() => {
    return subscribeProgramChanges(connection, patchState, {
      programId: METAPLEX_ID,
      processAccount: processMetaplexAccounts,
    });
  }, [connection]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    (async () => {
      const [creatorsState, auctionManagerState] = await Promise.all([
        loadCreators(connection),
        loadAuctionManagers(connection, storeAddress as string),
      ]);
      const auctionsState = await loadAuctionsForAuctionManagers(
        connection,
        Object.values(auctionManagerState.auctionManagersByAuction),
      );
      try {
        const vaultState = await loadVaultsAndContentForAuthority(
          connection,
          wallet.publicKey?.toBase58() as string,
        );
        patchState(
          creatorsState,
          auctionManagerState,
          auctionsState,
          vaultState,
        );
        setLoadingAdmin(false);
      } catch (error) {
        console.error(`failed loading error: ${error}`);
      }
    })();
  }, [loadingAdmin, isLoading, storeAddress]);

  if (loadingAdmin) {
    return (
      <div className="app-section--loading">
        <Spin indicator={<LoadingOutlined />} />
      </div>
    );
  }

  return (
    <>
      {!wallet.connected ? (
        <p>
          <Button type="primary" onClick={connect}>
            Connect
          </Button>{' '}
          to admin store.
        </p>
      ) : !storeAddress || isLoading ? (
        <Spin indicator={<LoadingOutlined />} />
      ) : store && wallet && ownerAddress === publicKey?.toBase58() ? (
        <>
          <InnerAdminView
            store={store}
            whitelistedCreatorsByCreator={whitelistedCreatorsByCreator}
            connection={connection}
            wallet={wallet}
            connected={wallet.connected}
          />
          {!isConfigured && (
            <>
              <Divider />
              <Divider />
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
        </>
      ) : ownerAddress === publicKey?.toBase58() ? (
        <>
          <p>Store is not initialized</p>
          <Link to="/explore">Go to initialize</Link>
        </>
      ) : (
        <>
          <h2>You are unauthorized</h2>
          <Link to="/">Go to Home</Link>
        </>
      )}
    </>
  );
};

function ArtistModal({
  setUpdatedCreators,
  uniqueCreatorsWithUpdates,
}: {
  setUpdatedCreators: React.Dispatch<
    React.SetStateAction<Record<string, WhitelistedCreator>>
  >;
  uniqueCreatorsWithUpdates: Record<string, WhitelistedCreator>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAddress, setModalAddress] = useState<string>('');
  return (
    <>
      <Modal
        title="Add New Artist Address"
        visible={modalOpen}
        onOk={() => {
          const addressToAdd = modalAddress;
          setModalAddress('');
          setModalOpen(false);

          if (uniqueCreatorsWithUpdates[addressToAdd]) {
            notify({
              message: 'Artist already added!',
              type: 'error',
            });
            return;
          }

          let address: StringPublicKey;
          try {
            address = addressToAdd;
            setUpdatedCreators(u => ({
              ...u,
              [modalAddress]: new WhitelistedCreator({
                address,
                activated: true,
              }),
            }));
          } catch {
            notify({
              message: 'Only valid Solana addresses are supported',
              type: 'error',
            });
          }
        }}
        onCancel={() => {
          setModalAddress('');
          setModalOpen(false);
        }}
      >
        <Input
          value={modalAddress}
          onChange={e => setModalAddress(e.target.value)}
        />
      </Modal>
      <Button onClick={() => setModalOpen(true)}>Add Creator</Button>
    </>
  );
}

enum ListingNotificationStatus {
  Ready,
  Submitting,
  Complete,
  Error,
}

function InnerAdminView({
  store,
  whitelistedCreatorsByCreator,
  connection,
  wallet,
  connected,
}: {
  store: ParsedAccount<Store>;
  whitelistedCreatorsByCreator: Record<
    string,
    ParsedAccount<WhitelistedCreator>
  >;
  connection: Connection;
  wallet: WalletSigner;
  connected: boolean;
}) {
  const { publicKey } = useWallet();
  // console.log(publicKey?.toBase58());
  const [newStore, setNewStore] = useState(
    store && store.info && new Store(store.info),
  );
  const [updatedCreators, setUpdatedCreators] = useState<
    Record<string, WhitelistedCreator>
  >({});
  const [filteredMetadata, setFilteredMetadata] = useState<{
    available: ParsedAccount<MasterEditionV1>[];
    unavailable: ParsedAccount<MasterEditionV1>[];
  }>();
  const [cachingAuctions, setCachingAuctions] = useState<boolean>();
  const [convertingMasterEditions, setConvertMasterEditions] =
    useState<boolean>();
  const { auctionCaches, storeIndexer, metadata, masterEditions } = useMeta();
  const { auctionManagersToCache, auctionManagerTotal, auctionCacheTotal } =
    useAuctionManagersToCache();
  const notifications = useNotifications(wallet);

  const { accountByMint } = useUserAccounts();
  useMemo(() => {
    const fn = async () => {
      setFilteredMetadata(
        await filterMetadata(
          connection,
          metadata,
          masterEditions,
          accountByMint,
        ),
      );
    };
    fn();
  }, [connected]);

  const uniqueCreators = Object.values(whitelistedCreatorsByCreator).reduce(
    (acc: Record<string, WhitelistedCreator>, e) => {
      acc[e.info.address] = e.info;
      return acc;
    },
    {},
  );

  const uniqueCreatorsWithUpdates = { ...uniqueCreators, ...updatedCreators };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (val: StringPublicKey) => <span>{val}</span>,
      key: 'address',
    },
    {
      title: 'Activated',
      dataIndex: 'activated',
      key: 'activated',
      render: (
        value: boolean,
        record: {
          address: StringPublicKey;
          activated: boolean;
          name: string;
          key: string;
        },
      ) => (
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          checked={value}
          onChange={val =>
            setUpdatedCreators(u => ({
              ...u,
              [record.key]: new WhitelistedCreator({
                activated: val,
                address: record.address,
              }),
            }))
          }
        />
      ),
    },
  ];

  interface DataType {
    key: React.Key;
    attribute: string;
    value: string;
  }

  const { endpoint } = useConnectionConfig();
  const endpointName = ENDPOINTS.find(e => e.endpoint === endpoint)?.name;
  const endpointUrl = ENDPOINTS.find(e => e.endpoint === endpoint)?.endpoint;
  const endpointId = ENDPOINTS.find(e => e.endpoint === endpoint)?.ChainId;

  const { storefront, storeAddress } = useStore();
  const storeConfigData: DataType[] = [
    {
      key: '1',
      attribute: 'Store Title',
      value: storefront.meta.title!,
    },
    {
      key: '2',
      attribute: 'Store Description',
      value: storefront.meta.description!,
    },
    {
      key: '3',
      attribute: 'Store Subdomain',
      value: storefront.subdomain!,
    },
    {
      key: '4',
      attribute: 'Store Address',
      value: storeAddress!,
    },
    {
      key: '5',
      attribute: 'Store Public Key',
      value: storefront.pubkey!,
    },
    {
      key: '6',
      attribute: 'Store Endpoint Name',
      value: endpointName!,
    },
    {
      key: '7',
      attribute: 'Store Endpoint URL',
      value: endpointUrl!,
    },
    {
      key: '8',
      attribute: 'Store Endpoint Chains',
      value: endpointId?.toString()!,
    },
  ];

  const configColumns = [
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
    },
  ];

  function unCamel(text: string) {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }

  return (
    <Content>
      <Col>
        <h2>Metaplex</h2>
        <Row>
          {!store.info.public && (
            <Col xs={24} md={24}>
              <p>Storefront Values</p>
              <Table columns={configColumns} dataSource={storeConfigData} />
              <p>Public Environment Variables</p>
              <Table
                columns={configColumns}
                dataSource={Object.keys(publicRuntimeConfig).map(key => ({
                  key,
                  attribute: unCamel(key),
                  value: publicRuntimeConfig[key],
                }))}
              />
            </Col>
          )}
        </Row>
        <Row>
          <h2>Whitelisted Creators</h2>
          <Col span={22}>
            <ArtistModal
              setUpdatedCreators={setUpdatedCreators}
              uniqueCreatorsWithUpdates={uniqueCreatorsWithUpdates}
            />
            <Button
              onClick={async () => {
                notify({
                  message: 'Saving...',
                  type: 'info',
                });
                await saveAdmin(
                  connection,
                  wallet,
                  newStore.public,
                  Object.values(updatedCreators),
                );
                notify({
                  message: 'Saved',
                  type: 'success',
                });
              }}
              type="primary"
            >
              Submit
            </Button>
          </Col>
          <Col>
            <Row justify="end">
              <Col>
                <Switch
                  checkedChildren="Public"
                  unCheckedChildren="Whitelist Only"
                  checked={newStore.public}
                  onChange={val => {
                    setNewStore(() => {
                      const newS = new Store(store.info);
                      newS.public = val;
                      return newS;
                    });
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={Object.keys(uniqueCreatorsWithUpdates).map(key => ({
                key,
                address: uniqueCreatorsWithUpdates[key].address,
                activated: uniqueCreatorsWithUpdates[key].activated,
                name:
                  uniqueCreatorsWithUpdates[key].name ||
                  shortenAddress(uniqueCreatorsWithUpdates[key].address),
                image: uniqueCreatorsWithUpdates[key].image,
              }))}
            />
          </Col>
        </Row>
      </Col>
      <h2>Listing Notifications</h2>
      <Table
        columns={[
          {
            key: 'accountPubkey',
            title: 'Listing',
            dataIndex: 'accountPubkey',
          },
          {
            key: 'description',
            title: 'Notification',
            dataIndex: 'description',
          },
          {
            key: 'action',
            title: 'Action',
            render: ({ action, callToAction }) => {
              const [status, setStatus] = useState<ListingNotificationStatus>(
                ListingNotificationStatus.Ready,
              );

              const onSubmit = async () => {
                try {
                  setStatus(ListingNotificationStatus.Submitting);
                  await action();
                  setStatus(ListingNotificationStatus.Complete);
                } catch (e: any) {
                  Bugsnag.notify(e);
                  setStatus(ListingNotificationStatus.Error);
                }
              };
              const isComplete = status === ListingNotificationStatus.Complete;

              const label = isComplete ? 'Done' : callToAction;
              return (
                <Button
                  loading={status === ListingNotificationStatus.Submitting}
                  disabled={isComplete}
                  onClick={onSubmit}
                >
                  {label}
                </Button>
              );
            },
          },
        ]}
        dataSource={notifications}
      />
      <Row></Row>
      <h2>Adminstrator Actions</h2>
      <Row>
        {!store.info.public && (
          <Col xs={24} md={12}>
            <h3>Convert Master Editions</h3>
            <p>
              You have {filteredMetadata?.available.length} MasterEditionV1s
              that can be converted right now and{' '}
              {filteredMetadata?.unavailable.length} still in unfinished
              auctions that cannot be converted yet.
            </p>
            <Button
              size="large"
              loading={convertingMasterEditions}
              onClick={async () => {
                setConvertMasterEditions(true);

                await convertMasterEditions(
                  connection,
                  wallet,
                  filteredMetadata?.available || [],
                  accountByMint,
                );

                setConvertMasterEditions(false);
              }}
            >
              Convert Eligible Master Editions
            </Button>
          </Col>
        )}
      </Row>
    </Content>
  );
}
