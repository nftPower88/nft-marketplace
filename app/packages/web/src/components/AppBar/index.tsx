import { ConnectButton, useStore } from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Col, Menu, Row, Space, Button } from 'antd';
import React, { ReactNode, useMemo, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Cog, CurrentUserBadge } from '../CurrentUserBadge';
import { Notifications } from '../Notifications';
import { useMeta } from '../../contexts';
import { useTheme, Theme } from '../../contexts/themecontext';
type P = {
  logo: string;
};

export const AppBar = (props: P) => {
  const { connected, publicKey } = useWallet();
  const location = useLocation();
  const locationPath = location.pathname.toLowerCase();
  const { ownerAddress } = useStore();
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState('');
  const [isSignIn, setIsSignIn] = useState(false);
  console.log(theme);
  function switchTheme() {
    if (theme === 'Dark') {
      setCurrentTheme(Theme.Light);
      setTheme(Theme.Light);
    } else {
      setCurrentTheme(Theme.Dark);
      setTheme(Theme.Dark);
    }
  }
  const { store, whitelistedCreatorsByCreator, isLoading, patchState } =
    useMeta();

  const activatedCreators = Object.values(whitelistedCreatorsByCreator).filter(
    e => {
      if (!e.info.activated) {
        return;
      }
      return e.info.address;
    },
  );

  // Array of menu item descriptions
  const menuInfo: {
    /** The React iterator key prop for this item */
    key: string;
    /** The content of this item */
    title: ReactNode;
    /**
     * The link target for this item.
     *
     * Any routes matching this link (and, if `exact` is false, any child
     * routes) will cause the menu item to appear highlighted.
     */
    link: string;
    /** Whether child routes should match against the value of `link` */
    exact: boolean;
    /**
     * Zero or more alternate routes to check against for highlighting this
     * item.
     *
     * The item will never link to these routes, but they will be queried for
     * highlighting similar to the `link` property.
     */
    alt: {
      /**
       * An alternate route path or prefix to match against.
       *
       * See the `link` property for more info.
       */
      path: string;
      /** Whether child routes should match against the value of `path` */
      exact: boolean;
    }[];
  }[] = useMemo(() => {
    let menu = [
      {
        key: 'explore',
        title: 'Explore',
        link: '/explore',
        exact: true,
        alt: [{ path: '/auction', exact: false }],
      },
      {
        key: 'artists',
        title: 'Artists',
        link: `/artists/${ownerAddress}`,
        exact: true,
        alt: [
          { path: '/artists', exact: false },
          { path: '/artworks', exact: false },
        ],
      },
      {
        key: 'learn',
        title: 'Learn',
        link: '/learn',
        exact: true,
        alt: [{ path: '/auction', exact: false }],
      },
    ];

    const isActivatedCreator = Object.values(activatedCreators).some(e => {
      console.log(`${e.info.address} - ${publicKey?.toBase58()}`);
      return e.info.address === publicKey?.toBase58();
    });

    if (isActivatedCreator || publicKey?.toBase58() === ownerAddress) {
      menu = [
        {
          key: 'create',
          title: 'Create',
          link: '/artworks/new',
          exact: true,
          alt: [],
        },
        ...menu,
      ];
    }

    if (connected) {
      menu = [
        ...menu,
        {
          key: 'profile',
          title: 'Profile',
          link: '/profile',
          exact: true,
          alt: [],
        },
      ];
    }

    if (publicKey?.toBase58() === ownerAddress) {
      menu = [
        ...menu,
        {
          key: 'admin',
          title: 'Admin',
          link: '/admin',
          exact: true,
          alt: [],
        },
      ];
    }

    return menu;
  }, [connected]);

  const menuItems = useMemo(
    () =>
      menuInfo.map(({ key, link, title }) => (
        <Menu.Item key={key}>
          <Link to={link}>{title}</Link>
        </Menu.Item>
      )),
    [menuInfo],
  );

  const activeItems = useMemo(
    () =>
      menuInfo
        .filter(({ link, alt, exact }) =>
          [{ path: link, exact }, ...alt].find(({ path, exact }) =>
            matchPath(locationPath, { path, exact }),
          ),
        )
        .map(({ key }) => key),
    [locationPath, menuInfo],
  );

  return (
    <div>
      <style global jsx>
        {`
          .ant-layout-header {
            padding: 0 25px;
            position: fixed;
            z-index: 2;
            width: 100vw;
            opacity: 100%;
            height: 64px;
          }
          .ant-btn {
            padding: 2.5px 10px;
            opacity: 100%;
          }
        `}
      </style>
      <Row wrap={false} align="middle">
        <Link
          to="/"
          id="metaplex-header-logo"
          onClick={() => setIsSignIn(false)}
        >
          <img
            style={{ width: '200px', paddingBottom: '5px' }}
            src={
              theme === Theme.Light
                ? 'Logo/QueendomDark.png'
                : 'Logo/QueendomLight.png'
            }
          />
        </Link>

        <Col flex="1 0 0" style={{ height: '60px' }} hidden={isSignIn}>
          <Menu theme="dark" mode="horizontal" selectedKeys={activeItems}>
            {menuItems}
          </Menu>
        </Col>
        <Col flex="0 1 auto" hidden={isSignIn}>
          <Space className="metaplex-display-flex" align="center">
            {connected ? (
              <div className="d-flex flex-row">
                <CurrentUserBadge showAddress={true} buttonType="text" />
                <Notifications buttonType="text" />

                <Cog buttonType="text" />
              </div>
            ) : (
              <div className='ant-button me-2'>
                {/* <ConnectButton type="text" allowWalletChange={false} /> */}
                <Link
                  className="sign_in_button"
                  onClick={() => setIsSignIn(true)}
                  to="/signin"
                >
                  Sign in
                </Link>
              </div>
            )}
            <Button
              shape="round"
              type="primary"
              style={{ float: 'right', height: '30px', width: '30px' }}
              onClick={switchTheme}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={theme === Theme.Dark ? 'black' : 'white'}
                stroke={theme === Theme.Dark ? 'black' : 'white'}
                style={{
                  height: '20px',
                  width: '20px',
                  transform: 'translate(-6px,1.5px)',
                }}
              >
                {theme === Theme.Dark ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                )}
              </svg>
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
