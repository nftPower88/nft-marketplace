import {Storefront} from '@oyster/common';
import React from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {Providers} from './providers';
import {
  ArtCreateView,
  ArtistView,
  ArtView,
  ArtworksView,
  AuctionCreateView,
  AuctionView,
  HomeView,
  StaticPageView,
  CheckoutPageView,
  ResultPageView,
  CartPageView,
  LearnPageView,
  DashboardView,
//  ClientPageView,
} from './views';
import { AdminView } from './views/admin';
import { BillingView } from './views/auction/billing';
import { LandingPageView } from './views/landingPage';
interface RoutesProps {
  storefront: Storefront;
}

export function Routes({storefront}: RoutesProps) {
  return (
    <>
      <style global jsx>{`
        html,
        body {
          color: #fff !important;
          font-family: 'Helvetica','Helvetica neue' !important;
        }
      `}</style>
      <HashRouter basename='/'>
        <Providers storefront={storefront}>
          <Switch>
            <Route exact path='/admin' component={() => <AdminView />} />
            <Route
              exact
              path='/artworks/new/:step_param?'
              component={() => <ArtCreateView />}
            />
            <Route exact path='/profile' component={() => <ArtworksView />} />
            <Route exact path='/artworks/:id' component={() => <ArtView />} />
            <Route path='/artists/:id' component={() => <ArtistView />} />
            <Route
              exact
              path='/auction/create/:step_param?'
              component={() => <AuctionCreateView />}
            />
            <Route
              exact
              path='/auction/:id'
              component={() => <AuctionView />}
            />
            <Route
              exact
              path='/auction/:id/billing'
              component={() => <BillingView />}
            />
            <Route path='/checkout' component={() => <CheckoutPageView />} />
            <Route path='/cart' component={() => <CartPageView />} />
            <Route path='/result/:sessionId' component={() => <ResultPageView />} />
            <Route path='/about' component={() => <StaticPageView />} />
            <Route path='/explore' component={() => <HomeView />} />
            <Route path='/learn' component={() => <LearnPageView />} />
            <Route path='/client' component={() => <DashboardView/>} />
            {/*<Route path="/dashboard" element = {<DashboardView />} />*/}
            <Route path='/' component={() => <LandingPageView />} />
          </Switch>
        </Providers>
      </HashRouter>
    </>
  );
}
