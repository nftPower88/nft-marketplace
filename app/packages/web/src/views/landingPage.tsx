/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useRouter } from 'next/router';
import { ConnectButton, metadataByMintUpdater, useStore } from '@oyster/commonlocal';
import { Link } from 'react-router-dom';
import { InstructionsModal } from '../components/InstructionsModal';
import { useInfiniteScrollAuctions } from '../hooks';
import { AuctionRenderCard } from '../components/AuctionRenderCard';
import PixelStreamer from '../components/PixelStreamer';
import Hero from '../components/Hero';
import ReactPlayer from 'react-player';
import { Footer as FooterComp } from '../components/Footer';
import { EmailSubscription } from '../components/EmailSubscription';
import { Layout, Divider } from 'antd';
export const LandingPageView = () => {
  const { Footer } = Layout;
  const router = useRouter();
  const { storefront } = useStore();
  const { auctions, loading, initLoading, hasNextPage, loadMore } =
    useInfiniteScrollAuctions();
  return (
    <>
      <Layout>
        <style global jsx>
          {`
            html,
            body,
            #__next,
            #__next > div,
            .ant-layout {
              height: 100%;
            }
            .ant-layout-header {
              z-index: 2;
            }
            .landing-page {
              display: flex;
              flex-flow: column nowrap;
              justify-content: center;
              align-items: center;
            }
            .landing-page-header {
              min-height: 500px;
            }

            .btn-outline-light {
              color: #f8f9fa;
              border-color: #f8f9fa;
            }
            .landing-page-btn {
              min-width: 7.8125rem;
              height: 2.375rem;
              background-color: #f8f9fa;
              border-color: #f8f9fa;
              border-radius: 0.25rem;
              color: #000 !important;
              display: inline-block;
              font-weight: 400;
              line-height: 1.5;
              text-align: center;
              text-decoration: none;
              vertical-align: middle;
              cursor: pointer;
              -moz-user-select: none;
              user-select: none;
            }
            .landing-page-btn-explore {
              min-width: 7.8125rem;
              height: 2.375rem;
              background-color: rgb(32, 129, 226);
              border-color: rgb(32, 129, 226);
              border-radius: 0.25rem;
              display: inline-block;
              font-weight: 400;
              line-height: 1.5;
              text-align: center;
              text-decoration: none;
              vertical-align: middle;
              cursor: pointer;
              -moz-user-select: none;
              user-select: none;
            }
            .landing-page-btn-create {
              min-width: 7.8125rem;
              height: 2.375rem;
              background-color: rgb(53, 56, 64);
              border: 1px solid rgb(21, 27, 34);
              border-radius: 0.25rem;
              display: inline-block;
              font-weight: 400;
              line-height: 1.5;
              text-align: center;
              text-decoration: none;
              vertical-align: middle;
              cursor: pointer;
              -moz-user-select: none;
              user-select: none;
            }
          `}
        </style>
        <div
          className={`landing-page overflow-hidden`}
          style={{ height: '75vh' }}
        >
          <Hero />
          <div
            className={` mt-5 mt-md-0 d-flex flex-column justify-content-between`}
          >
            <div
              className={`d-flex flex-row flex-md-row justify-content-between`}
            >
              <ReactPlayer
                loop
                playing
                muted={true}
                url="video/demo.mp4"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
        {/*  <div
          className={`d-flex flex-row justify-content-center my-3 flex-wrap text-center`}
        >
          <button
            onClick={() => router.push('https://discord.gg/vYBcfGSdYr')}
            className="btn btn-outline-light landing-page-btn text-uppercase m-3"
          >
            Discord
          </button>

          <button
            onClick={() => router.push('https://twitter.com/Queendomverse')}
            className="btn btn-outline-light landing-page-btn text-uppercase m-3"
          >
            Twitter
          </button>

          <button
            onClick={() => router.push('https://github.com/QueendomDAO')}
            className="btn btn-outline-light landing-page-btn text-uppercase m-3"
          >
            Github
          </button>
          <button
            onClick={() =>
              router.push('https://www.reddit.com/r/queendomverse')
            }
            className="btn btn-outline-light landing-page-btn text-uppercase m-3"
          >
            Reddit
          </button>
        </div> */}
        <Footer>
          <EmailSubscription />
        </Footer>
        <FooterComp />
      </Layout>
      {/* {!getCookieConsentValue() && (
        <CookieConsent>
          This website uses cookies to enhance the user experience.
        </CookieConsent>
      )} */}
    </>
  );
};
