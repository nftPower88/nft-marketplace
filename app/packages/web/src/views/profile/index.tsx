import { Layout } from 'antd';
import { useTheme, Theme } from '../../contexts/themecontext';
import {
  ENDPOINTS,
  formatNumber,
  formatUSD,
  Identicon,
  MetaplexModal,
  Settings,
  shortenAddress,
  useConnectionConfig,
  useNativeAccount,
  useWalletModal,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Menu, Popover, Select, Space, Divider } from 'antd';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { useUserArts } from '../../hooks';

import {
  UploadOutlined,
  EllipsisOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  BlockOutlined,
  FunnelPlotOutlined,
} from '@ant-design/icons';

import image from 'next/image';
export const ProfileView = () => {
  const arts = useUserArts();
  console.log(arts);
  const { Header, Footer, Content } = Layout;
  const { theme, setTheme } = useTheme();

  const { wallet, publicKey, disconnect } = useWallet();
  const { account } = useNativeAccount();

  if (!wallet || !publicKey) {
    return null;
  }

  const name = shortenAddress(`${publicKey}`);

  return (
    <Layout className="position-relative">
      <div
        className="cover_image_container"
        style={{
          backgroundColor: theme === Theme.Dark ? '#211f1fff' : '#e7e7e7ff',
        }}
      >
        <img src="" alt="" />
      </div>
      <div className="avatar_image_container">
        <img
          className="avatar_image"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
          alt=""
        />
      </div>
      <div
        className="profile_name"
        style={{
          backgroundColor: theme === Theme.Dark ? '#211f1fff' : '#e7e7e7ff',
        }}
      >
        <Identicon address={publicKey?.toBase58()} size={22} />
        <h1 className="ms-2 mt-2">{name}</h1>
      </div>
      <div className="follow_count">
        <h5 className="me-3">
          <span className="fw-bold">0</span> followers
        </h5>
        <h5>
          <span className="fw-bold">0</span> following
        </h5>
      </div>
      <div className="profile_buttons m-auto py-2 px-3 ">
        <Button type="default" shape="round">
          Edit Profile
        </Button>
        <Button shape="circle" icon={<UploadOutlined />}></Button>
        <Button shape="circle" icon={<EllipsisOutlined />}></Button>
      </div>
      <div className="m-auto mt-2" style={{ height: '50px' }}>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item>On sale</Menu.Item>
          <Menu.Item>Owned</Menu.Item>
          <Menu.Item>Created</Menu.Item>
          <Menu.Item>Collections</Menu.Item>
          <Menu.Item>Activity</Menu.Item>
        </Menu>
      </div>
      <Divider />
      <div className="d-flex justify-content-between">
        <div
          className="d-flex justify-content-between"
          style={{ minWidth: '32rem' }}
        >
          <Button icon={<AppstoreOutlined />} shape="round">
            Category
          </Button>
          <Button icon={<BlockOutlined />} shape="round">
            Collections
          </Button>
          <Button icon={<ThunderboltOutlined />} shape="round">
            Sale type
          </Button>
          <Button icon={<DollarOutlined />} shape="round">
            Price range
          </Button>
        </div>
        <div className="position-relative">
          <h6 className="sort_icon">Sort</h6>
          <Button icon={<FunnelPlotOutlined />} shape="round">
            Recently Added
          </Button>
        </div>
      </div>
    </Layout>
  );
};
