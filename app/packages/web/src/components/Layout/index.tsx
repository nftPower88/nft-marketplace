import { Storefront } from '@oyster/commonlocal';
import { Layout, Divider } from 'antd';
import React, { ReactNode } from 'react';
import { AppBar } from '../AppBar';
import { Footer as FooterComp } from '../Footer';
import { EmailSubscription } from '../EmailSubscription';
import CookieConsent, {
  Cookies,
  getCookieConsentValue,
  resetCookieConsentValue,
} from 'react-cookie-consent';
import { useTheme, Theme } from '../../contexts/themecontext';

const { Header, Content, Footer } = Layout;

export const AppLayout = React.memo(function AppLayout(props: {
  children?: ReactNode;
  storefront?: Storefront;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <Layout>
        <Header>
          <AppBar logo={props.storefront?.theme?.logo || ''} />
        </Header>
        <Content id="metaplex-layout-content">{props.children}</Content>
        <CookieConsent
          buttonStyle={{
            position: 'absolute',
            top: '-12px',
            right: '-10px',
            backgroundColor: 'unset',
            color: theme === Theme.Dark ? '#211f1fff' : '#e7e7e7ff',
            fontSize: '1rem',
          }}
          buttonText="✕"
          style={{
            borderRadius: '20px',
            width: '215px',
            height: '40px',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: theme === Theme.Light ? '#211f1fff' : '#e7e7e7ff',
            position: 'fixed',
            transform: 'translate(40px,-20px)',
          }}
        >
          <p
            className="fw-bold"
            style={{
              fontSize: '0.9rem',
              color: theme === Theme.Dark ? '#211f1fff' : '#e7e7e7ff',
              transform: 'translate(0px,-6px)',
            }}
          >
            We use 🍪{' '}
            <a
              href="http://fitnik.tech/public/docs/terms.pdf"
              style={{ color: '#0d6efd' }}
            >
              Learn more
            </a>
          </p>
        </CookieConsent>
      </Layout>
    </>
  );
});
