/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Popover,
  Spin,
  Button,
  Carousel,
  Col,
  List,
  Row,
  Skeleton,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  AuctionView as Auction,
  useArt,
  useAuction,
  useBidsForAuction,
  useCreators,
  useExtendedArt,
} from '../../hooks';
import {
  AuctionViewItem,
  AUCTION_ID,
  METAPLEX_ID,
  processAuctions,
  processMetaplexAccounts,
  processVaultData,
  subscribeProgramChanges,
  useConnection,
  useMeta,
  VAULT_ID,
  Identicon,
  formatAmount,
  fromLamports,
  useMint,
  PriceFloorType,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArtType } from '../../types';
import { LoadingOutlined } from '@ant-design/icons';
import { AuctionBids, AuctionItem } from '../auction';
import { Link } from 'react-router-dom';
import { MetaAvatar } from '../../components/MetaAvatar';
import { ViewOn } from '../../components/ViewOn';
import { AuctionCard } from '../../components/AuctionCard';
import { AmountLabel } from '../../components/AmountLabel';
import getConfig from 'next/config';
import {
  CameraOutlined,
  CaretDownOutlined,
  TransactionOutlined,
  FundProjectionScreenOutlined,
  BlockOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useTheme, Theme } from '../../contexts/themecontext';

interface Props {
  show: boolean;
  hide: (value: any) => void;
  id: string;
  mobile?: boolean;
}

const CheckOutModal: React.FC<Props> = ({ show, hide, id, mobile }: Props) => {
  const { publicRuntimeConfig } = getConfig();
  const { loading, auction } = useAuction(id);
  const connection = useConnection();
  const { patchState } = useMeta();
  const [currentIndex, setCurrentIndex] = useState(0);
  const art = useArt(auction?.thumbnail.metadata.pubkey);
  const { ref, data } = useExtendedArt(auction?.thumbnail.metadata.pubkey);
  const creators = useCreators(auction);
  const wallet = useWallet();
  const { theme, setTheme } = useTheme();
  let edition = '';
  if (art.type === ArtType.NFT) {
    edition = 'Unique';
  } else if (art.type === ArtType.Master) {
    edition = 'NFT 0';
  } else if (art.type === ArtType.Print) {
    edition = `${art.edition} of ${art.supply}`;
  }
  const nftCount = auction?.items.flat().length;
  const winnerCount = auction?.items.length;

  const hasDescription = data === undefined || data.description === undefined;
  const description = data?.description;
  // @ts-ignore
  const story = data?.properties.story;
  // @ts-ignore
  const item_id = data?.properties.item_id;
  const attributes = data?.attributes;
  const { Text } = Typography;
  const [showAbout, setShowAbout] = useState(true);

  const mintInfo = useMint(auction?.auction.info.tokenMint);

  const participationFixedPrice =
    auction?.auctionManager.participationConfig?.fixedPrice || 0;
  const participationOnly = auction?.auctionManager.numWinners.toNumber() === 0;
  const priceFloor =
    auction?.auction.info.priceFloor.type === PriceFloorType.Minimum
      ? auction.auction.info.priceFloor.minPrice?.toNumber() || 0
      : 0;
  const [storyShow, setStoryShow] = useState<boolean>(false);
  const [captureShow, setCaptureShow] = useState<boolean>(true);
  const [showcaseShow, setShowcaseShow] = useState<boolean>(true);
  const [tryShow, setTryShow] = useState<boolean>(true);
  const [portShow, setPortShow] = useState<boolean>(true);
  const [tradeShow, setTradeShow] = useState<boolean>(true);
  const [detailShow, setDetailShow] = useState<boolean>(true);
  const [showAuction, setShowAuction] = useState<boolean>(true);
  const [reloadAuction, setReloadAuction] = useState<boolean>(false);

  function refreshAuction() {
    setTimeout(() => {
      setReloadAuction(false);
    }, 1);
    setReloadAuction(true);
  }

  useEffect(() => {
    return subscribeProgramChanges(
      connection,
      patchState,
      {
        programId: AUCTION_ID,
        processAccount: processAuctions,
      },
      {
        programId: METAPLEX_ID,
        processAccount: processMetaplexAccounts,
      },
      {
        programId: VAULT_ID,
        processAccount: processVaultData,
      },
    );
  }, [connection]);

  if (loading) {
    return (
      <div className="app-section--loading">
        <Spin indicator={<LoadingOutlined />} />
      </div>
    );
  }
  const items = [
    ...(auction?.items
      .flat()
      .reduce((agg, item) => {
        agg.set(item.metadata.pubkey, item);
        return agg;
      }, new Map<string, AuctionViewItem>())
      .values() || []),
    auction?.participationItem,
  ].map((item, index) => {
    if (!item || !item?.metadata || !item.metadata?.pubkey) {
      return null;
    }

    return (
      <AuctionItem
        key={item.metadata.pubkey}
        item={item}
        active={index === currentIndex}
      />
    );
  });

  function aboutPop() {
    return (
      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <Space direction="vertical">
            {hasDescription && <Skeleton paragraph={{ rows: 3 }} />}
            {description ||
              (winnerCount !== undefined && <p>No description provided.</p>)}
          </Space>
        }
      ></Popover>
    );
  }
  console.log(art);
  return (
    <Row justify="space-between" ref={ref} gutter={[24, 0]}>
      <Col span={12}>
        <h4 style={{ fontWeight: 'bold' }}>{art.title}</h4>

        <h4 style={{ fontWeight: 'bold', marginTop: '1px' }}>
          <AmountLabel
            displaySOL={true}
            amount={fromLamports(
              participationOnly ? participationFixedPrice : priceFloor,
              mintInfo,
            )}
          />
        </h4>
      </Col>
      <Col span={12}>
        <h4 style={{ fontWeight: 'bold', textAlign: 'end' }}>{item_id}</h4>

        <h4 style={{ fontWeight: 'bold', textAlign: 'end' }}>
          Supply: {art.supply}/{art.maxSupply}
        </h4>
      </Col>
      <Col span={24} md={{ span: 24 }} lg={24}>
        <Row justify="center">
          <div
            style={{ width: '180px' }}
            className="border-0 align-items-center mt-4"
          >
            <Carousel
              className="metaplex-spacing-bottom-md"
              autoplay={false}
              afterChange={index => setCurrentIndex(index)}
            >
              {items}
            </Carousel>
          </div>
        </Row>
        <Divider />
        {!auction && <Skeleton paragraph={{ rows: 6 }} />}
        <Row justify="center">
          <Col span={21}>
            <Button
              size="large"
              hidden={!showAuction}
              onClick={() => setShowAuction(false)}
              type="primary"
              className="metaplex-fullwidth rounded-3 mt-4"
              style={{ height: '40px' }}
            >
              Buy Now
            </Button>
            {/* <Button hidden={showAuction} onClick={refreshAuction} style={{borderRadius:'5px'}} type='primary' className="metaplex-fullwidth rounded-3">Forgo Purchase</Button> */}
          </Col>
        </Row>
        {auction && !reloadAuction && (
          <div hidden={showAuction}>
            <AuctionCard auctionView={auction} hideDefaultAction={false} />
          </div>
        )}
        {!auction?.isInstantSale && <AuctionBids auctionView={auction} />}

        <div hidden={!showAuction}>
          {' '}
          <Divider />
        </div>
        <Row justify="center">
          <Col span={24}>
            <Row justify="center">
              <div
                className={
                  theme === Theme.Light
                    ? 'button_blackborder'
                    : 'button_whiteborder'
                }
              >
                <Button
                  type="text"
                  onClick={() => {
                    setStoryShow(false);
                  }}
                  style={{ width: '179px' }}
                >
                  <span className={!storyShow ? 'underlined_button' : ''}>
                    Description
                  </span>
                </Button>
              </div>
              <div
                className={
                  theme === Theme.Light
                    ? 'button_blackborder'
                    : 'button_whiteborder'
                }
              >
                <Button
                  type="text"
                  onClick={() => {
                    setStoryShow(true);
                  }}
                  style={{ width: '179px' }}
                >
                  <span className={storyShow ? 'underlined_button' : ''}>
                    Story
                  </span>
                </Button>
              </div>
            </Row>
          </Col>
        </Row>
        <Divider />
        <Row justify="center">
          <Col span={21}>
            <Row justify="center">
              {storyShow ? (
                <div>
                  <h5>{story}</h5>
                </div>
              ) : (
                <div>
                  <h5>{description}</h5>
                </div>
              )}
            </Row>
          </Col>

          {/* <Button onClick={() => setShowAbout(!showAbout)}>
            ABOUT THIS {nftCount === 1 ? 'NFT' : 'COLLECTION'}
          </Button>
          <div hidden={showAbout}>
            <Col span={24} lg={{ span: 24 }}>
              <Row justify="center">
                <h2>{art.title || <Skeleton paragraph={{ rows: 0 }} />}</h2>
                {wallet.publicKey?.toBase58() ===
                  auction?.auctionManager.authority && (
                  <Link to={`/auction/${id}/billing`}>
                    <Button type="ghost">Billing</Button>
                  </Link>
                )}
              </Row>
              <Row className="metaplex-spacing-bottom-sm" justify="center">
                <Space direction="vertical" size="middle">
                  <Space direction="horizontal" size="large" align="center">
                    <Text>CREATED BY</Text>
                    <MetaAvatar creators={creators} />
                  </Space>
                  <Space direction="horizontal" size="large">
                    <Text>Edition</Text>
                    {(auction?.items.length || 0) > 1 ? 'Multiple' : edition}
                  </Space>
                  <Space direction="horizontal" size="large" align="center">
                    <Text>Winners</Text>
                    <span>
                      {winnerCount === undefined ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        winnerCount
                      )}
                    </span>
                  </Space>
                  <Space direction="horizontal" size="large" align="start">
                    <Text style={{ padding: '10px' }}>NFTS</Text>
                    {nftCount === undefined ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      nftCount
                    )}
                  </Space>
                </Space>
              </Row>
              <hr />
              <div style={{ marginTop: '15px' }}></div>

              <Row justify="center">
                <ViewOn art={art} />
              </Row>
            </Col>
            <Space direction="vertical" style={{ margin: '1rem' }}>
              {hasDescription && <Skeleton paragraph={{ rows: 3 }} />}
              {description ||
                (winnerCount !== undefined && (
                  <h4>No description provided.</h4>
                ))}
            </Space>
          </div> */}
        </Row>
        <Divider />
        {attributes && (
          <Col span={24}>
            <h3 style={{ fontWeight: 900 }}>Attributes</h3>
            <List grid={{ column: 4 }}>
              {attributes.map((attribute, index) => (
                <List.Item
                  key={`${attribute.value}-${index}`}
                  className="d-flex"
                >
                  <List.Item.Meta title={`${attribute.trait_type}`} />
                  <List.Item.Meta
                    title={attribute.value}
                    className="text-end"
                  />
                </List.Item>
              ))}
            </List>
          </Col>
        )}
        <Divider />
        <Col span={24} hidden={!mobile}>
          <h3 style={{ fontWeight: 900 }}>How to use</h3>
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setCaptureShow(!captureShow)}
          >
            <h4>
              <CameraOutlined />
            </h4>
            <h4>Capture it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={captureShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={captureShow}>
            <h5>Capture Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setShowcaseShow(!showcaseShow)}
          >
            <h4>
              <FundProjectionScreenOutlined />
            </h4>
            <h4>Showcase it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={showcaseShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={showcaseShow}>
            <h5>Showcase Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setTryShow(!tryShow)}
          >
            <h4>
              <ThunderboltOutlined />
            </h4>
            <h4>Try it on</h4>
            <div>
              <h4>
                <CaretDownOutlined className={tryShow ? '' : 'rotate_button'} />
              </h4>
            </div>
          </Row>
          <div hidden={tryShow}>
            <h5>Try it Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setPortShow(!portShow)}
          >
            <h4>
              <BlockOutlined />
            </h4>
            <h4>Port it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={portShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={portShow}>
            <h5>Port it Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setTradeShow(!tradeShow)}
          >
            <h4>
              <TransactionOutlined />
            </h4>
            <h4>Trade it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={tradeShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={tradeShow} className="p-1"></div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setDetailShow(!detailShow)}
          >
            <h4>
              <TransactionOutlined />
            </h4>
            <h4>Details</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={detailShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={detailShow} className="p-1">
            <h5>
              Blockchain :{' '}
              <span style={{ textDecoration: 'underline' }}>
                {publicRuntimeConfig.publicSolanaNetwork}
              </span>{' '}
            </h5>
            <h5>
              Creator :{' '}
              <span style={{ textDecoration: 'underline' }}>
                {art.creators![0].address}
              </span>{' '}
            </h5>
            <h5>
              Asset :{' '}
              <span style={{ textDecoration: 'underline' }}>{art.mint}</span>{' '}
            </h5>
            <div className="text-center">
              <ViewOn id={id} />
            </div>
          </div>
          <hr />
        </Col>
        <Col span={24} hidden={mobile}>
          <h3 style={{ fontWeight: 900 }}>How to use</h3>
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setCaptureShow(!captureShow)}
          >
            <h4>
              <CameraOutlined />
            </h4>
            <h4 style={{ marginRight: '250px' }}>Capture it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={captureShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={captureShow}>
            <h5>Capture Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setShowcaseShow(!showcaseShow)}
          >
            <h4>
              <FundProjectionScreenOutlined />
            </h4>
            <h4 style={{ marginRight: '240px' }}>Showcase it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={showcaseShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={showcaseShow}>
            <h5>Showcase Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setTryShow(!tryShow)}
          >
            <h4>
              <ThunderboltOutlined />
            </h4>
            <h4 style={{ marginRight: '270px' }}>Try it on</h4>
            <div>
              <h4>
                <CaretDownOutlined className={tryShow ? '' : 'rotate_button'} />
              </h4>
            </div>
          </Row>
          <div hidden={tryShow}>
            <h5>Try it Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setPortShow(!portShow)}
          >
            <h4>
              <BlockOutlined />
            </h4>
            <h4 style={{ marginRight: '282px' }}>Port it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={portShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={portShow}>
            <h5>Port it Captions</h5>
          </div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setTradeShow(!tradeShow)}
          >
            <h4>
              <TransactionOutlined />
            </h4>
            <h4 style={{ marginRight: '270px' }}>Trade it</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={tradeShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={tradeShow} className="p-1"></div>
          <hr />
          <Row
            justify="space-between"
            align="middle"
            onClick={() => setDetailShow(!detailShow)}
          >
            <h4>
              <TransactionOutlined />
            </h4>
            <h4 style={{ marginRight: '270px' }}>Details</h4>
            <div>
              <h4>
                <CaretDownOutlined
                  className={detailShow ? '' : 'rotate_button'}
                />
              </h4>
            </div>
          </Row>
          <div hidden={detailShow} className="p-1">
            <h5>
              Blockchain :{' '}
              <span style={{ textDecoration: 'underline' }}>
                {publicRuntimeConfig.publicSolanaNetwork}
              </span>{' '}
            </h5>
            <h5>
              Creator :{' '}
              <span style={{ textDecoration: 'underline' }}>
                {art.creators![0].address}
              </span>{' '}
            </h5>
            <h5>
              Asset :{' '}
              <span style={{ textDecoration: 'underline' }}>{art.mint}</span>{' '}
            </h5>
            <div className="text-center">
              <ViewOn id={id} />
            </div>
          </div>
          <hr />
        </Col>
      </Col>
    </Row>
  );
};

export default CheckOutModal;
