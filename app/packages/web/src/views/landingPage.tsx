import React from 'react';
import {useRouter} from 'next/router';
import {ConnectButton, metadataByMintUpdater, useStore} from '@oyster/common';
import {Link} from 'react-router-dom';
import {InstructionsModal} from '../components/InstructionsModal';
import {useInfiniteScrollAuctions} from '../hooks';
import {AuctionRenderCard} from '../components/AuctionRenderCard';
import PixelStreamer from '../components/PixelStreamer';
export const LandingPageView = () => {
  const router = useRouter();
  const {storefront} = useStore();
  const {
    auctions,
    loading,
    initLoading,
    hasNextPage,
    loadMore,
  } = useInfiniteScrollAuctions();

  return (
    <>
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
      <div className={`landing-page h-100 overflow-scroll`}>
        <div
          className={`landing-page-header mt-5 mt-md-0 d-flex flex-column justify-content-between h-100`}>
          <div
            className ={`d-flex flex-column flex-md-row justify-content-between`}>
          <PixelStreamer/>
          
          </div>
          <div
            className={`d-flex flex-row justify-content-center my-3 flex-wrap text-center`}>
            <button
              onClick={() => router.push('https://discord.gg/vYBcfGSdYr')}
              className='btn btn-outline-light landing-page-btn text-uppercase m-3'>
              Discord
            </button>

            <button
              onClick={() => router.push('https://twitter.com/Queendomverse')}
              className='btn btn-outline-light landing-page-btn text-uppercase m-3'>
              Twitter
            </button>

            <button
              onClick={() =>
                router.push('https://github.com/QueendomDAO')
              }
              className='btn btn-outline-light landing-page-btn text-uppercase m-3'>
              Github
            </button>
            <button
              onClick={() => router.push('https://www.reddit.com/r/queendomverse')}
              className='btn btn-outline-light landing-page-btn text-uppercase m-3'>
              Reddit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
