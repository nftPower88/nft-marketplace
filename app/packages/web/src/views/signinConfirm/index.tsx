import React, { useEffect } from 'react';
import { Button, Card, Row, Col, Layout } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { useHistory } from 'react-router-dom';

export const SignInConfirmView = () => {
  const { connected, publicKey } = useWallet();
  const history = useHistory();

  !connected && history.push('/signin');

  const logIn = () => {
    connected && history.push('/');
  };

  return (
    <div className="signin-confirm-container">
      <p>Welcome back</p>
      <p>@queendom!</p>
      <div className="signin-confirm-address-container">
        <p className="address">ADDRESS</p>
        <p>{publicKey?.toBase58()}</p>
        <Button className="signin-button" onClick={logIn}>
          SIGN IN
        </Button>
      </div>
      <div className="signin-policy-container">
        By clicking sign in you indicate that you have read and agree to our
        <br />
        <span>Terms of Service</span> and <span>Privacy Policy</span>
      </div>
    </div>
  );
};
