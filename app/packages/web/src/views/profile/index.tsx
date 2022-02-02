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
  MenuOutlined
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Col, Row, Spin, Tabs, Card, Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { useHistory } from 'react-router-dom';

const { TabPane } = Tabs;

const Owned = () => {
  const owned = [1, 2, 3, 4]
  return (
    <>
      <div className={styles.ownedBtns}>
        <div>
          <Button className={styles.ownedBtn}>
            <AppstoreOutlined />
            Category
          </Button>
          <Button className={styles.ownedBtn}>
            <BlockOutlined />
            Collections
          </Button>
          <Button className={styles.ownedBtn}>
            <PartitionOutlined />
            Sale type
          </Button>
          <Button className={styles.ownedBtn}>
            <DollarOutlined />
            Price range
          </Button>
        </div>
        <Button className={styles.ownedBtn}>
          <span className={styles.ownedBtnSortSpan}>Sort</span>
          <MenuOutlined />
          Recently added
        </Button>
      </div>
      <Row>
        {
          owned.map((e, i) => 
            <Col xs={24} sm={12} md={8} lg={6} key={i} className={styles.ownedCardContainer} >
              <Card hoverable={true} className={styles.ownedCard} bodyStyle={{padding: '10px'}}>
                <div className={styles.cardTop}>
                  <div className={styles.cardImages}>
                    <img src="/img/artist1.jpeg" className={styles.cardImage} />
                    <img src="/img/artist2.jpeg" className={`${styles.cardImage} ${styles.mlm10}`} />
                    <img src="/img/artist3.jpeg" className={`${styles.cardImage} ${styles.mlm10}`} />
                  </div>
                  <EllipsisOutlined />
                </div>
                <div className={styles.cardContent}>
                  <FileImageOutlined />
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardFooterTitle}>Untitled</div>
                  <div className={styles.cardFooterLetter}>Not for sale 1/1</div>
                  <div className={styles.cardFooterBottom}>
                    <span>No bids yet</span>
                    <HeartOutlined />
                  </div>
                </div>
              </Card>
            </Col>)
        }
      </Row>
    </>
  )
}

export const ProfileView = () => {
  const { connected, publicKey } = useWallet();
  const history = useHistory();

  useEffect(() => {
    console.log('profile', connected)
  })

  return (
    <div className={styles.profileContainer}>
      <div className={styles.topBackground}>
        <div className={styles.avatarContainer}>
          <img src="/img/artist1.jpeg" className={styles.userAvatar} />
        </div>
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.address}>
          <img src='/Ethereum-Logo.svg'/>
          {publicKey?.toBase58().slice(0, 4) + ' ... ' + publicKey?.toBase58().slice(-4)}
        </div>
        <div className={styles.follow}>
          <span className={`${styles.followSpan}, ${styles.mr20}`}><InfoCircleFilled className={styles.infoIcon}/>followers</span>
          <span className={styles.followSpan}><InfoCircleFilled className={styles.infoIcon}/>followering</span>
        </div>
        <div className={styles.infoButtons}>
          <Button className={styles.editBtn} onClick={() => {history.push('/editProfile')}}>Edit profile</Button>
          <Button className={styles.infoBtn}><UploadOutlined /></Button>
          <Button className={styles.infoBtn}><EllipsisOutlined /></Button>
        </div>
      </div>
      <div className={styles.tabContainer}>
        <Tabs defaultActiveKey="2" centered>
          <TabPane tab="On sale" key="1">
            On sale
          </TabPane>
          <TabPane tab={
                    <>
                      <span>Owned</span>
                      <span className={styles.ownedBadge}>4</span>
                    </>
                  } key="2">
           <Owned></Owned>             
          </TabPane>
          <TabPane tab="Created" key="3">
          Created
          </TabPane>
          <TabPane tab="Collections" key="4">
          Collections
          </TabPane>
          <TabPane tab="Activity" key="5">
          Activity
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
