import React from 'react';
import { Storefront } from '@oyster/commonmetaplex';
import { Routes } from './routes';

interface AppProps {
  storefront: Storefront;
}

function App({ storefront }: AppProps) {
    return <Routes storefront={storefront} />;
}

export default App;
