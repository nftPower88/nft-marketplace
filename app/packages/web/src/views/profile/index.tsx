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
  const { Option } = Select;
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
      <div className="m-auto mt-2 d-sm-block d-none" style={{ height: '50px' }}>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item>On sale</Menu.Item>
          <Menu.Item>Owned</Menu.Item>
          <Menu.Item>Created</Menu.Item>
          <Menu.Item>Collections</Menu.Item>
          <Menu.Item>Activity</Menu.Item>
        </Menu>
      </div>
      <div className="m-auto mt-2 d-sm-none d-block">
        <Select defaultValue={0} className="profile_menu_select">
          <Option value={0}>{<h3>On Sale</h3>}</Option>
          <Option value={1}>{<h3>Owned</h3>}</Option>
          <Option value={2}>{<h3>Created</h3>}</Option>
          <Option value={3}>{<h3>Collections</h3>}</Option>
          <Option value={4}>{<h3>Activity</h3>}</Option>
        </Select>
      </div>
      <div className="align-items-center d-sm-none d-flex flex-column">
        <Select defaultValue={0} className="my-3">
          <Option value={0} className="d-flex align-items-center">
            {
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <AppstoreOutlined />
                </div>{' '}
                <h4>Category</h4>
              </div>
            }
          </Option>
          <Option value={1} className="d-flex align-items-center">
            {
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <AppstoreOutlined />
                </div>{' '}
                <h4>Collections</h4>
              </div>
            }
          </Option>
          <Option value={2} className="d-flex align-items-center">
            {
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <AppstoreOutlined />
                </div>{' '}
                <h4>Sale Type</h4>
              </div>
            }
          </Option>
          <Option value={3} className="d-flex align-items-center">
            {
              <div className="d-flex align-items-center">
                <div className="me-2">
                  <AppstoreOutlined />
                </div>{' '}
                <h4>Price Range</h4>
              </div>
            }
          </Option>
        </Select>
        <div className="position-relative">
          <h6 className="sort_icon">Sort</h6>
          <Button icon={<FunnelPlotOutlined />} shape="round">
            Recently Added
          </Button>
        </div>
      </div>
      <Divider />
      <div className=" justify-content-between d-sm-flex d-none">
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
