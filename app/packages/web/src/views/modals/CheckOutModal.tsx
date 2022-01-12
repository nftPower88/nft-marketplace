import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Spin,
  Button,
  Carousel,
  Col,
  List,
  Row,
  Skeleton,
  Space,
  Typography,
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
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArtType } from '../../types';
import { LoadingOutlined } from '@ant-design/icons';
import { AuctionBids, AuctionItem } from '../auction';
import { Link } from 'react-router-dom';
import { MetaAvatar } from '../../components/MetaAvatar';
import { ViewOn } from '../../components/ViewOn';
import { AuctionCard } from '../../components/AuctionCard';

interface Props {
  show: boolean;
  hide: (value: any) => void;
  id: string;
}

const CheckOutModal: React.FC<Props> = ({ show, hide, id }: Props) => {
  const { loading, auction } = useAuction(id);
  const connection = useConnection();
  const { patchState } = useMeta();
  const [currentIndex, setCurrentIndex] = useState(0);
  const art = useArt(auction?.thumbnail.metadata.pubkey);
  const { ref, data } = useExtendedArt(auction?.thumbnail.metadata.pubkey);
  const creators = useCreators(auction);
  const wallet = useWallet();

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
  const attributes = data?.attributes;
  const { Text } = Typography;

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

  return (
    <Drawer
      title="Checkout"
      placement="right"
      closable={true}
      onClose={hide}
      visible={show}
      key="right"
      width={350}
    >
      <Row justify="center" ref={ref} gutter={[24, 0]}>
        <Col span={24} md={{ span: 24 }} lg={24}>
          <div style={{'width':'100px','border':'1px solid','margin':'auto'}}>
            <Carousel
              className="metaplex-spacing-bottom-md"
              autoplay={false}
              afterChange={index => setCurrentIndex(index)}
            >
              {items}
            </Carousel>
          </div>
          <hr/>
          <Space direction="vertical" size="middle" align='start' >
            <Text>ABOUT THIS {nftCount === 1 ? 'NFT' : 'COLLECTION'}</Text>
            <div style={{'textAlign':'center','margin':'auto'}}>
              {hasDescription && <Skeleton paragraph={{ rows: 3 }} />}
              {description ||
                (winnerCount !== undefined && (
                  <p>No description provided.</p>
                ))}
            </div>
          </Space>
          {attributes && (
            <div>
              <Text>Attributes</Text>
              <List grid={{ column: 2 }}>
                {attributes.map((attribute, index) => (
                  <List.Item key={`${attribute.value}-${index}`}>
                    <List.Item.Meta
                      title={attribute.trait_type}
                      description={attribute.value}
                    />
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        <hr/>
        </Col>
        <Col span={24} lg={{  span: 24 }}>
          <Row justify="space-between">
            <h2>{art.title || <Skeleton paragraph={{ rows: 0 }} />}</h2>
            {wallet.publicKey?.toBase58() ===
              auction?.auctionManager.authority && (
              <Link to={`/auction/${id}/billing`}>
                <Button type="ghost">Billing</Button>
              </Link>
            )}
          </Row>
          <Row className="metaplex-spacing-bottom-sm" justify='start'>
           
              <Space direction="vertical" size='middle'>
                <Space direction="horizontal" size="large" align='center'>
                  <Text>CREATED BY</Text>
                  <MetaAvatar creators={creators} />
                </Space>
                <Space direction="horizontal" size="large">
                  <Text>Edition</Text>
                  {(auction?.items.length || 0) > 1 ? 'Multiple' : edition}
                </Space>
                <Space direction="horizontal" size="large" align='center'>
                  <Text>Winners</Text>
                  <span>
                    {winnerCount === undefined ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      winnerCount
                    )}
                  </span>
                </Space>
                <Space direction="horizontal" size="large" align='start'>
                  <Text style={{ padding: '10px' }}>NFTS</Text>
                  {nftCount === undefined ? (
                    <Skeleton paragraph={{ rows: 0 }} />
                  ) : (
                    nftCount
                  )}
                </Space>
              </Space>
                  
          </Row>
          <div style={{"marginTop":'15px'}}></div>
           <Col span={24}>
           <Row justify="center">
                <ViewOn art={art} />
              </Row></Col>
        <hr/>

          {!auction && <Skeleton paragraph={{ rows: 6 }} />}
          {auction && (
            <AuctionCard auctionView={auction} hideDefaultAction={false} />
          )}
          {!auction?.isInstantSale && <AuctionBids auctionView={auction} />}
        </Col>
      </Row>
    </Drawer>
  );
};

export default CheckOutModal;
