// @ts-nocheck

import {
  FileImageOutlined,
  HeartOutlined,
  EllipsisOutlined,
  InfoCircleFilled,
  AppstoreOutlined,
  BlockOutlined,
  DollarOutlined,
  PartitionOutlined,
  UploadOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Col, Row, Spin, Tabs, Card, Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ArtworksView } from '..';
import { Link } from 'react-router-dom';

const { TabPane } = Tabs;

const Owned = () => {
  const owned = [1, 2, 3, 4];
  return (
    <>
      <div className="ownedBtns">
        <div>
          <Button className="ownedBtn leftOwnedBtn">
            <AppstoreOutlined />
            Category
          </Button>
          <Button className="ownedBtn leftOwnedBtn">
            <BlockOutlined />
            Collections
          </Button>
          <Button className="ownedBtn leftOwnedBtn">
            <PartitionOutlined />
            Sale type
          </Button>
          <Button className="ownedBtn leftOwnedBtn">
            <DollarOutlined />
            Price range
          </Button>
        </div>
        <Button className="ownedBtn">
          <span className="ownedBtnSortSpan">Sort</span>
          <MenuOutlined />
          Recently added
        </Button>
      </div>
      <Row>
        {owned.map((e, i) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={6}
            key={i}
            className="ownedCardContainer"
          >
            <Card
              hoverable={true}
              className="ownedCard"
              bodyStyle={{ padding: '10px' }}
            >
              <div className="cardTop">
                <div className="cardImages">
                  <img src="/img/artist1.jpeg" className="cardImage" />
                  <img src="/img/artist2.jpeg" className="cardImage mlm10" />
                  <img src="/img/artist3.jpeg" className="cardImage mlm10" />
                </div>
                <EllipsisOutlined />
              </div>
              <div className="cardContent">
                <FileImageOutlined />
              </div>
              <div className="cardFooter">
                <div className="cardFooterTitle">Untitled</div>
                <div className="cardFooterLetter">Not for sale 1/1</div>
                <div className="cardFooterBottom">
                  <span>No bids yet</span>
                  <HeartOutlined />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export const ProfileView = () => {
  const { connected, publicKey } = useWallet();
  const history = useHistory();

  !connected && history.push('/');

  const location: any = useLocation();
  const [public_key, setPublickKey] = useState('');

  useEffect(() => {
    (async () => {
      location.state &&
        location.state.publicKey &&
        setPublickKey(location.state.publicKey);
    })();
  }, [location]);

  return (
    <div className="profile-page-container">
      <div className="topBackground">
        <div className="avatarContainer">
          <img src="/img/artist1.jpeg" className="userAvatar" />
        </div>
      </div>
      <div className="infoContainer">
        <div className="address desktop-show">
          <img src="/Ethereum-Logo.svg" />
          {publicKey?.toBase58()}
        </div>

        <div className="address mobile-show">
          <img src="/Ethereum-Logo.svg" />
          {publicKey?.toBase58().slice(0, 10) +
            ' ... ' +
            publicKey?.toBase58().slice(-10)}
        </div>

        <div className="follow">
          <span className="followSpan mr20">
            <InfoCircleFilled className="infoIcon" />
            followers
          </span>
          <span className="followSpan">
            <InfoCircleFilled className="infoIcon" />
            following{' '}
          </span>
        </div>
        <div className="infoButtons">
          <Button
            className="editBtn"
            onClick={() => {
              history.push('/editProfile');
            }}
          >
            Edit profile
          </Button>
          <Button className="infoBtn">
            <UploadOutlined />
          </Button>
          <Button className="infoBtn">
            <EllipsisOutlined />
          </Button>
          <Button className="editBtn">
            <Link to="/auction/create/0">Sell NFT</Link>
          </Button>
        </div>
      </div>
      <div className="tabContainer">
        <Tabs defaultActiveKey="2" centered>
          <TabPane tab="On sale" key="1">
            On sale
          </TabPane>
          <TabPane
            tab={
              <>
                <span>Owned</span>
                <span className="ownedBadge">4</span>
              </>
            }
            key="2"
          >
            <Owned></Owned>
          </TabPane>
          <TabPane tab="Created" key="3">
            Created
          </TabPane>
          <TabPane tab="Collections" key="4">
            <ArtworksView />
          </TabPane>
          <TabPane tab="Activity" key="5">
            Activity
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
