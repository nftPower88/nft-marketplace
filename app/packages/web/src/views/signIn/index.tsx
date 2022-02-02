import React, { useEffect } from 'react';
import { Button, Card, Row, Col, Layout } from 'antd';
import { MetaplexOverlay, MetaplexModal, ConnectButton } from '@oyster/common';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

const COINBASE =
  'https://www.coinbase.com/learn/tips-and-tutorials/how-to-set-up-a-crypto-wallet';

export const SignInView = () => {
  const { connected, publicKey } = useWallet();
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
              {!connected ? (
                <ConnectButton
                  className="bold_text connect_button"
                  type="primary"
                  allowWalletChange={false}
                />
              ) : (
                <div className="d-flex justify-content-center ms-4">
                  <Link to="/" id="metaplex-header-logo">
                    Let's Explore !
                  </Link>
                </div>
              )}
              <div className="bold_text m-3">
                <a href={COINBASE}>First time setting up a wallet?</a>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
    // </MetaplexOverlay>
  );
};
