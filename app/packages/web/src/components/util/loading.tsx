import React from 'react';
import { Spinner } from '../Loader';

export const Loading = (props: any) => {
  return (
    <div className='loading'>
      <div className='loading-bar'>
        <p style={{ color: 'black' }}>{props.description}</p>
        <Spinner />
      </div>
    </div>
  );
};