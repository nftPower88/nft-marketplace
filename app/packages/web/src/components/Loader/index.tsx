import { LoadingOutlined } from '@ant-design/icons';
import { useMeta, useStore } from '@oyster/common';
import { Spin } from 'antd';
import React, { FC } from 'react';

export const LoaderProvider: FC = ({ children }) => {
  const { isLoading } = useMeta();
  const { storefront } = useStore();

  return (
    <>
      <div id="metaplex-loading" className={isLoading ? 'loading' : undefined}>
        <img
          src="Logo/QueendomDark.png"
          style={{ width: '200px', marginBottom: '10px' }}
        />
        <div id="metaplex-loading-text">
          <h4 className="bold_text">Loading</h4>
        </div>
        <Spinner />
      </div>
      {!isLoading && children}
    </>
  );
};

export const Spinner = () => {
  return <Spin indicator={<LoadingOutlined />} />;
};
