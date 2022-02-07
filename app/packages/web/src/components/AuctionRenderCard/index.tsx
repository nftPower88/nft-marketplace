/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardProps, Space } from 'antd';
import React from 'react';
import { AuctionView, useArt, useCreators } from '../../hooks';
import { AmountLabel } from '../AmountLabel';
import { ArtContent } from '../ArtContent';
import { AuctionCountdown } from '../AuctionNumbers';
// import {MetaAvatar} from '../MetaAvatar';
import { getHumanStatus, useAuctionStatus } from './hooks/useAuctionStatus';

export interface AuctionCard extends CardProps {
  auctionView: AuctionView | null;
}

export const AuctionRenderCard = (props: AuctionCard | null) => {
  const { auctionView }: any = props;
  if (auctionView === null) return <div />;
  const id = auctionView?.thumbnail.metadata.pubkey;
  const art = useArt(id);
  const creators = useCreators(auctionView);
  const name = art?.title || ' ';

  const { status, amount } = useAuctionStatus(auctionView);
  const humanStatus = getHumanStatus(status);
  const artSupply = art?.supply || 0;
  const artMaxSupply = art?.maxSupply || 0;
  let barWidth;
  function getWidth() {
    if (
      artSupply === 0 ||
      artMaxSupply === 0 ||
      artSupply === undefined ||
      artMaxSupply === undefined
    ) {
      return (barWidth = 0);
    } else {
      return (barWidth = (artSupply / artMaxSupply) * 100) + '%';
    }
  }
  console.log(getWidth(), 'getwidth');
  const card = (
    <Card hoverable bordered={false}>
      <Space direction="vertical" className="metaplex-fullwidth">
        {/* <Space direction='horizontal'>
          <MetaAvatar creators={[creators[0]]} />
        
        </Space> */}

        <ArtContent preview={false} pubkey={id} allowMeshRender={false} card />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space direction="vertical" style={{ width: '65%' }}>
            <h4>
              {/* {creators[0]?.name || creators[0]?.address?.substr(0, 6)} : <br /> */}
              {name}
            </h4>
            {!status.isInstantSale && status.isLive && (
              <div>
                <h5>ENDING IN</h5>
                <AuctionCountdown auctionView={auctionView} labels={false} />
              </div>
            )}
            <AmountLabel title={humanStatus} amount={amount} />
          </Space>
          <div style={{ width: '50%', alignItems: 'center', display: 'flex' }}>
            {artSupply === 0 || artMaxSupply === 0 ? (
              <div className="availability_card">
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 50,
                    color: 'GrayText',
                    top: '20px',
                    left: '28px',
                  }}
                >
                  Sold Out
                </div>
              </div>
            ) : (
              <div className="availability_card">
                <div
                  style={{
                    position: 'absolute',
                    width: getWidth(),
                    height: '100%',
                    top: 0,
                    left: 0,
                  }}
                >
                  <hr
                    style={{
                      borderTop: '35px solid',
                      borderRight: '1px solid',
                      borderLeft: '1px solid',
                      borderBottom: '35px solid',
                      margin: 'auto',
                    }}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 50,
                    color: 'GrayText',
                    top: '20px',
                    left: '40px',
                  }}
                >
                  {art.supply}/{art.maxSupply}
                </div>
              </div>
            )}
          </div>
        </div>
      </Space>
      {/* <Divider /> */}
    </Card>
  );

  return card;
};
