// @ts-nocheck

import React from 'react';
import {useWallet} from '@solana/wallet-adapter-react';
import { Identicon } from '@oyster/common';

export const WalletAvatar = () => {
  const {wallet, publicKey} = useWallet();
  const unknownWallet = wallet as any;
  return (
    <React.Fragment>
      {
        unknownWallet.image ? (
          <img src={unknownWallet.image} />
        ) : (
          <Identicon address={publicKey?.toBase58()} size={22} />
        )
      }
    </React.Fragment>
  );
};