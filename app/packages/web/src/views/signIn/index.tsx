import React, { useEffect } from 'react';
import { Button, Card, Row, Col, Layout } from 'antd';
import { MetaplexOverlay, MetaplexModal, ConnectButton } from '@oyster/common';
import { Link } from 'react-router-dom';


const COINBASE =
  'https://www.coinbase.com/learn/tips-and-tutorials/how-to-set-up-a-crypto-wallet';

export const SignInView = () => {
  return (
    // <MetaplexOverlay visible centered closable width="100vw">
      <Layout>
        <div style={{ height: '80vh', display: 'flex', position: 'relative' }}>
          <div className="title_container">
            <Row justify="center">
              <Col span={24}>
                <h1 className="bold_text title_text">
                  Welcome! Let's begin with your wallet.
                </h1>
                <ConnectButton
                  className="bold_text"
                  type="primary"
                  style={{ width: '100%', height: '50px' }}
                  allowWalletChange={false}
                />
                <div className="bold_text" style={{margin:'10px'}}>
                  <a href={COINBASE}>
                    First time setting up a wallet?
                  </a>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    // </MetaplexOverlay>
  );
};
