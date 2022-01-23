import { LoadingOutlined } from '@ant-design/icons';
import {
  useStore,
  loadMetadataForCreator,
  useConnection,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Alert, Button, Spin, Divider,Select } from 'antd';
import React, { useState, useEffect } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Link, useParams } from 'react-router-dom';
import { AuctionRenderCard } from '../../components/AuctionRenderCard';
import { MetaplexMasonry } from '../../components/MetaplexMasonry';
import {
  useAuctionManagersToCache,
  useInfiniteScrollAuctions,
  useCreatorArts,
} from '../../hooks';
import { Banner } from '../../components/Banner';
import CheckOutModal from '../modals/CheckOutModal';
import DrawerWrapper from '../modals/DrawerWrapper';

import { ArtistCard } from '../../components/ArtistCard';
import { useMeta } from '../../contexts';

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
    console.log(id, 'id');
    setItemId(id);
    setShowModal(true);
  };
  //From artistView :
  const { Option } = Select;
  const { whitelistedCreatorsByCreator, patchState } = useMeta();
  const creators = Object.values(whitelistedCreatorsByCreator);
  const [loadingArt, setLoadingArt] = useState(true);
  const connection = useConnection();
  const [globalAdress, setGlobalAdress] = useState<string>('');
  const [selectedOption,setSelectedOption] = useState<string>('')
  const handleChange:()=>void = function(value:string){
    setGlobalAdress(value)
  }
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
      <h1>Creators: </h1>
      <Select  onChange={handleChange} defaultValue='Select Artist'>
        {creators.map((m, idx) => {
          const address = m.info.address;
          return (
            //  <div onClick={()=>setGlobalAdress(address)} key={idx}>
            //     {/* <ArtistCard
            //       key={address}
            //       active={address === id}
            //       artist={{
            //         address,
            //         name: m.info.name || '',
            //         image: m.info.image || '',
            //         link: m.info.twitter || '',
            //       }}
            //     /> */}

            // </div>
            <Option
             
              key={idx}
              value={address}
            >
              {address}
            </Option>
          );
        })}
      </Select>
      <Divider />
      <MetaplexMasonry>
        {auctions.map((m, idx) => {
          const auctionId = m.auction.pubkey;
          // const creator = useCreators(m)
          const creatorAdress =
            m.thumbnail.metadata.info.data.creators![0].address;
          console.log(creatorAdress, '||', globalAdress);
          // console.log(creator, 'this is the creator')
          if (m.auction.info.state !== 2 && creatorAdress === globalAdress)
            return (
              // <Link to={`/auction/${id}`} key={idx}>
              <div
                onClick={() => {
                  renderModal(id);
                }}
                key={idx}
              >
                <AuctionRenderCard key={auctionId} auctionView={m} />
              </div>
              // </Link>
            );
        })}
      </MetaplexMasonry>
      {hasNextPage && (
        <div className="app-section--loading" ref={sentryRef}>
          <Spin indicator={<LoadingOutlined />} />
        </div>
      )}
      {showModal && (
        <DrawerWrapper
          show={showModal}
          id={itemId}
          hide={() => setShowModal(false)}
        />
      )}
    </>
  );
};
