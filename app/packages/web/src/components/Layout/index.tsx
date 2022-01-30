import { Storefront } from '@oyster/common';
import { Layout, Divider } from 'antd';
import React, { ReactNode } from 'react';
import { AppBar } from '../AppBar';
import { Footer as FooterComp } from '../Footer';
import { EmailSubscription } from '../EmailSubscription';

const { Header, Content, Footer } = Layout;

export const AppLayout = React.memo(function AppLayout(props: {
  children?: ReactNode;
  storefront?: Storefront;
}) {
  return (
    <>
      <Layout>
        <Header>
          <AppBar logo={props.storefront?.theme?.logo || ''} />
        </Header>
        <Content id="metaplex-layout-content">{props.children}</Content>
        <Footer>
          <EmailSubscription />
        </Footer>
        <FooterComp />
      </Layout>
    </>
  );
});
