import { LoadingOutlined } from '@ant-design/icons';
import {
  MetaplexOverlay,
  MetaplexModal,
  useStore,
  loadMetadataForCreator,
  useConnection,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, Button, Spin, Divider, Select, Input, Drawer } from 'antd';
import React, { useState, useEffect } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Link, useParams } from 'react-router-dom';
import { AuctionRenderCard } from '../../components/AuctionRenderCard';
import { MetaplexMasonry } from '../../components/MetaplexMasonry';
import {
  useAuctionManagersToCache,
  useInfiniteScrollAuctions,
} from '../../hooks';
import { Banner } from '../../components/Banner';
import DrawerWrapper from '../modals/DrawerWrapper';
import { useMeta } from '../../contexts';
import CheckOutModal from '../modals/CheckOutModal';

export enum LiveAuctionViewState {
  All = '0',
  Participated = '1',
  Ended = '2',
  Resale = '3',
}

export const AuctionListView = () => {
  const { id } = useParams<{ id: string }>();
  const { auctions, loading, initLoading, hasNextPage, loadMore } =
    useInfiniteScrollAuctions();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [itemId, setItemId] = useState<string>('');

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 200px 0px',
  });

  const { ownerAddress, storefront } = useStore();
  const wallet = useWallet();
  const { auctionManagerTotal, auctionCacheTotal } =
    useAuctionManagersToCache();
  const isStoreOwner = ownerAddress === wallet.publicKey?.toBase58();
  const notAllAuctionsCached = auctionManagerTotal !== auctionCacheTotal;
  const showCacheAuctionsAlert = isStoreOwner && notAllAuctionsCached;

  const renderModal = (id: string) => {
    // console.log(id, 'id');
    setItemId(id);
    setShowModal(true);
  };
  //From artistView :
  const { Option } = Select;
  const { Search } = Input;
  const { whitelistedCreatorsByCreator, patchState } = useMeta();
  const creators = Object.values(whitelistedCreatorsByCreator);
  const [loadingArt, setLoadingArt] = useState(true);
  const connection = useConnection();
  const [globalAdress, setGlobalAdress] = useState<string>('initial');
  const handleChange = function (value: string) {
    setGlobalAdress(value);
  };

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions(),
    );

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
  }
  const { height, width } = useWindowDimensions();
  const [mobileMode, setMobileMode] = useState<boolean>(false);
  useEffect(() => {
    if (width <= 575) {
      setMobileMode(true);
    } else if (width > 575) {
      setMobileMode(false);
    }
  }, [height, width]);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      setLoadingArt(true);
      const creator = whitelistedCreatorsByCreator[id];
      if (!creator) {
        setLoadingArt(false);
        throw new Error(`Artist does not exist: ${id}`);
        //  toast.error(`Artist does not exist: ${id}`);
        // Redirect to /artists
        /*  return (
          <MetaplexModal 
          visible={showWarningModal}
          onCancel={() => setShowWarningModal(false)}
          >
            <div>
              <h1>Error</h1>
            </div>
            <Button onClick={() => setShowWarningModal(false)} type="primary">
              Got it
            </Button>
        </MetaplexModal>
        )
      */
      }
      const artistMetadataState = await loadMetadataForCreator(
        connection,
        creator,
      );

      patchState(artistMetadataState);
      setLoadingArt(false);
    })();
  }, [connection, id]);

  return initLoading ? (
    <div className="app-section--loading">
      <Spin indicator={<LoadingOutlined />} />
    </div>
  ) : (
    <>
      {showCacheAuctionsAlert && (
        <Alert
          message="Attention Store Owner"
          className="app-alert-banner metaplex-spacing-bottom-lg"
          description={
            <p>
              Make your storefront faster by enabling listing caches.{' '}
              {auctionCacheTotal}/{auctionManagerTotal} of your listing have a
              cache account. Watch this{' '}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://youtu.be/02V7F07DFbk"
              >
                video
              </a>{' '}
              for more details and a walkthrough. On November 17rd storefronts
              will start reading from the cache for listings. All new listing
              are generating a cache account.
            </p>
          }
          type="info"
          showIcon
          action={
            <Link to="/admin">
              <Button>Visit Admin</Button>
            </Link>
          }
        />
      )}
      {storefront.theme.banner && (
        <Banner
          src={storefront.theme.banner}
          headingText={storefront.meta.title}
          subHeadingText={storefront.meta.description}
        />
      )}
      <div className=" mx-1">
        <div className="d-flex">
          <h3 className="me-2 me-sm-3 d-none d-sm-block">Creators: </h3>
          <Select
            className="mb-2 select_artists"
            onChange={handleChange}
            defaultValue="All"
          >
            <Option value={'initial'}>All</Option>
            {creators.map((m, idx) => {
              const address = m.info.address;
              return (
                <Option key={idx} value={address}>
                  {address}
                </Option>
              );
            })}
          </Select>
          <Search
            style={{ width: '30rem' }}
            className="ms-2 ms-sm-4 d-none d-sm-block"
            enterButton
            onSearch={() => alert('searched!')}
          />
        </div>
        <Search
          style={{ width: '100%' }}
          className="d-block d-sm-none"
          enterButton
          onSearch={() => alert('searched!')}
        />
      </div>
      <Divider />
      <MetaplexMasonry>
        {auctions.map((m, idx) => {
          const auctionId = m.auction.pubkey;

          // const creator = useCreators(m)
          const creatorAdress =
            m.thumbnail.metadata.info.data.creators![0].address;
          // console.log(creatorAdress, '||', globalAdress);
          // console.log(creator, 'this is the creator')
          if (m.auction.info.state !== 2 && creatorAdress === globalAdress)
            return (
              // <Link to={`/auction/${id}`} key={idx}>
              <div
                onClick={() => {
                  renderModal(auctionId);
                }}
                key={idx}
              >
                <AuctionRenderCard key={auctionId} auctionView={m} />
              </div>
              // </Link>
            );
          else if (globalAdress === 'initial' && m.auction.info.state !== 2)
            return (
              <div
                onClick={() => {
                  renderModal(auctionId);
                }}
                key={idx}
              >
                <AuctionRenderCard key={auctionId} auctionView={m} />
              </div>
            );
        })}
      </MetaplexMasonry>
      {hasNextPage && (
        <div className="app-section--loading" ref={sentryRef}>
          <Spin indicator={<LoadingOutlined />} />
        </div>
      )}
      {/* {showModal && (
        <DrawerWrapper
          id={itemId}
          hide={() => setShowModal(false)}
          placement="bottom"
          show={showModal && mobileMode}
          mobileMode={mobileMode}
        />
        
      )} */}
      <MetaplexModal
        maskClosable={true}
        closable={false}
        onCancel={() => setShowModal(false)}
        visible={showModal && mobileMode}
      >
        <div className="p-2">
          <CheckOutModal
            mobile={mobileMode}
            show={showModal}
            id={itemId}
            hide={() => setShowModal(false)}
          />
        </div>
      </MetaplexModal>

      {showModal && (
        <DrawerWrapper
          id={itemId}
          hide={() => setShowModal(false)}
          placement="right"
          show={showModal && !mobileMode}
          mobileMode={mobileMode}
        />
      )}
    </>
  );
};
