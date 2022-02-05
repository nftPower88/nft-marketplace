import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  children: ReactNode;
  title?: string;
};

export const Layout = ({ children, title = 'Page Title' }: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@thorwebdev" />
      <meta name="twitter:title" content="TypeScript Next.js Stripe Example" />
      <meta
        name="twitter:description"
        content="Full-stack TypeScript example using Next.js, react-stripe-js, and stripe-node."
      />
      <meta
        name="twitter:image"
        content="https://nextjs-typescript-react-stripe-js.now.sh/social_card.png"
      />
    </Head>
    <div >
      {/* <header>
  
         
          <img
            src="https://images.unsplash.com/photo-1563805042-7684c019e1cb"
            className="myimg ant-card"
          />
        
      </header> */}
      {children}
    </div>
    {/* <div className="banner">
      <span>
        This is a{' '}
        <a
          href="https://www.queendom.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Queendom
        </a>
        {' checkout page test, view code on '}
        <a
          href="https://github.com/QueendomDAO/nft-marketplace"
          target="_blank"
          rel="noopener noreferrer"
        >
          QueendomDAO
        </a>
        .
      </span>
    </div> */}
  </>
);
