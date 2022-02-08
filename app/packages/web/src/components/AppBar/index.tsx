import { ConnectButton, useStore } from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Col, Menu, Row, Space, Button, Drawer } from 'antd';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Cog, CurrentUserBadge } from '../CurrentUserBadge';
import { Notifications } from '../Notifications';
import { useMeta } from '../../contexts';
import { useTheme, Theme } from '../../contexts/themecontext';
import { MenuOutlined } from '@ant-design/icons';
import { SocialIcon } from '../Footer/social_icon';
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
  const [showMenu, setShowMenu] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  let hide = false;
  locationPath == '/signinconfirm' && (hide = true);

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
        alt: [{ path: '/artists', exact: false }],
      },
      // {
      //   key: 'learn',
      //   title: 'Learn',
      //   link: '/learn',
      //   exact: true,
      //   alt: [{ path: '/auction', exact: false }],
      // },
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
          alt: [{ path: '/artworks', exact: false }],
        },
        ...menu,
      ];
    }

    if (connected) {
      menu = [
        {
          key: 'verse',
          title: 'Verse',
          link: '/chat',
          exact: true,
          alt: [{ path: '/chat', exact: false }],
        },
        ...menu,
        // {
        //   key: 'profile',
        //   title: 'Profile',
        //   link: '/profile',
        //   exact: true,
        //   alt: [],
        // },
      ];
    } else {
      const state = menu.filter(m => m.key === 'player');
      console.log(state);
      if (state.length) menu.shift();
    }

    // if (publicKey?.toBase58() === ownerAddress) {
    //   menu = [
    //     ...menu,
    //     {
    //       key: 'admin',
    //       title: 'Admin',
    //       link: '/admin',
    //       exact: true,
    //       alt: [],
    //     },
    //   ];
    // }

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
    <div className="header-container">
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
      <Row wrap={false} align="middle" className="justify-content-between">
        <div className="d-flex">
          <Link
            to="/"
            id="metaplex-header-logo"
            onClick={() => setIsSignIn(false)}
          >
            <img
              style={{ width: '200px', paddingBottom: '5px' }}
              className="desktop-show"
              src={
                theme === Theme.Light
                  ? 'Logo/QueendomDark.png'
                  : 'Logo/QueendomLight.png'
              }
            />
            <img
              style={{ width: '100px', paddingBottom: '5px' }}
              className="mobile-show"
              src={
                theme === Theme.Light
                  ? 'Logo/QueendomDark.png'
                  : 'Logo/QueendomLight.png'
              }
            />
          </Link>
          <div className={`ms-3 mobile-show ${hide ? ' hidden' : ''}`}>
            <Button
              onClick={() => setShowMenu(true)}
              size="small"
              icon={<MenuOutlined />}
              type="text"
            ></Button>
            <Drawer
              visible={showMenu}
              placement="bottom"
              mask={true}
              maskStyle={{ opacity: '0%' }}
              onClose={() => setShowMenu(false)}
              closable={false}
            >
              <Menu
                onClick={() => setShowMenu(false)}
                mode="vertical"
                selectedKeys={activeItems}
              >
                {menuItems}
                <Menu.Item>
                  <a href="https://www.queendom.io/">About</a>
                </Menu.Item>
                <div style={{ marginTop: '50px' }}>
                  <SocialIcon />
                </div>
              </Menu>
            </Drawer>
          </div>
        </div>

        <Col
          flex="1 0 0"
          className={`left-header ${hide ? ' hidden' : ''} desktop-show ms-4`}
        >
          <Menu theme="dark" mode="horizontal" selectedKeys={activeItems}>
            {menuItems}
            <Menu.Item>
              <a href="https://www.queendom.io/">About</a>
            </Menu.Item>
          </Menu>
        </Col>

        <Col flex="0 1 auto" className="right-header">
          <Space className="metaplex-display-flex" align="center">
            {connected ? (
              <div className={`d-flex flex-row ${hide ? ' hidden' : ''}`}>
                <CurrentUserBadge showAddress={true} buttonType="text" />

                <Notifications buttonType="text" />

                <Cog buttonType="text" />

                <Button
                  className="mx-2"
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
              </div>
            ) : (
              <div className="d-flex flex-row align-items-center">
                <div className="ant-button">
                  {/* <ConnectButton type="text" allowWalletChange={false} /> */}
                  <Link
                    className="sign_in_button me-2"
                    // onClick={() => setIsSignIn(true)}
                    to="/signin"
                  >
                    Sign in
                  </Link>
                </div>
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
              </div>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};
