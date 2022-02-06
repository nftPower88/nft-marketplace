import { Identicon } from '@oyster/common';
import React from 'react';
import { useTheme } from '../../contexts/themecontext';

export const MessageContent = (props: any) => {
  const { theme } = useTheme();
  return (
    <div key={props.key} className='d-flex' style={{ width: `${props.width}%`, marginBottom: '0.5rem' }}>
      <div className='user-avatar'>
        <Identicon address={props.info.walletAddress} size={50} />
      </div>
      <div>
        <p className='user-info' style={theme === 'Light' ? { color: 'black' } : { color: 'white' }}>{props.info.walletAddress}</p>
        <p className='messages' style={theme === 'Light' ? { color: 'black' } : { color: 'white' }}>{props.info.text}</p>
      </div>
    </div>
  );
};