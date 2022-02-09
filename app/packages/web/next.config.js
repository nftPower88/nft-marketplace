require('dotenv').config();
const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');
const camelCase = require('camelcase');
console.log(process.env);
const assetPrefix = process.env.ASSET_PREFIX || '';
const DEFAULT_SOLANA_NETWORK = 'devnet';
const DEFAULT_SOLANA_RPC_HOST = 'https://explorer-api.devnet.solana.com';
const DEFAULT_MATCHMAKER_ADDRESS = 'node101.stream.queendom.io';
const DEFAULT_MATCHMAKER_PORT = '443';

const plugins = [
  [
    withLess,
    {
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: {
            '@assetPrefix': assetPrefix || "''",
            '@background-color-secondary': 'rgba(255, 255, 255)',
          },
          javascriptEnabled: true,
        },
      },
    },
  ],
];


function hasLowerCase(str) {
  return str.toUpperCase() != str;
}


function checkEnvDefined(envVar = '', envName) {
  if (envVar) {
    return envVar;
  }
  console.warn(`Environment variable ${envName} is undefined`);
  return '';
}


var nextVars = {},
    sysVars = {};
    
for(var env in process.env) {
  if (hasLowerCase(env)) {
    continue;
  }
  var value = process.env[env];
  if (env.includes("NEXT_")) {
    var name = camelCase(env.replace('NEXT_',''));
    nextVars[name] = checkEnvDefined(value, env);
  } else {
    var name = camelCase(env);
    sysVars[name] = checkEnvDefined(value, env);    
  }
  // console.debug(`${env}=${value}`);
}
console.debug("Next Vars:")
console.debug(nextVars)
console.debug("System Vars:")
console.debug(sysVars)


function getBasePath(basePath = '') {
  if (nextVars['basePath']) {
     if (nextVars['basePath'].startsWith("/")) {
        basePath = nextVars['basePath'];
     } else {
        basePath = "/" + nextVars['basePath'];
     }
  }
  console.debug("getBasePath() : basePath = " + basePath);
  return basePath
}
var basePath = getBasePath()


function getSolanaNetwork(network = '') {
  if (nextVars['publicSolanaNetwork']) {
    network = nextVars['publicSolanaNetwork'];
  } else {
    network = DEFAULT_SOLANA_NETWORK;
  };
  console.debug("getSolanaNetwork() : network = " + network);
  return network
}


function getSolanaRpcHost(rpcHost = '') {
  if (nextVars['publicSolanaRpcHost']) {
    rpcHost = nextVars['publicSolanaRpcHost'];
  } else {
    rpcHost = DEFAULT_SOLANA_RPC_HOST;
  };
  console.debug("getSolanaRpcHost() : rpcHost = " + rpcHost);
  return rpcHost
}

function getMatchmakerAddress(matchmakerAddress = '') {
  if (nextVars['publicMatchmakerAddress']) {
    matchmakerAddress = nextVars['publicMatchmakerAddress'];
  } else {
    matchmakerAddress = DEFAULT_MATCHMAKER_ADDRESS;
  };
  console.debug("getMatchmakerAddress() : getMatchmakerAddress = " + matchmakerAddress);
  return matchmakerAddress
}

function getMatchmakerPort(matchmakerPort = '') {
  if (nextVars['publicMatchmakerPort']) {
    matchmakerPort = nextVars['publicMatchmakerPort'];
  } else {
    matchmakerPort = DEFAULT_MATCHMAKER_PORT;
  };
  console.debug("getMatchmakerPort() : getMatchmakerPort = " + matchmakerPort);
  return matchmakerPort
}


module.exports = withPlugins(plugins, {
  assetPrefix,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: true,
  serverRuntimeConfig: {
    nodeEnv: nextVars['nodeEnv'],
    port: nextVars['port'] || '3000',
    stripePort: nextVars['stripePort'],
    logLevel: sysVars['logLevel'] || 'info',
    gitDeployKey: sysVars['gitDeploymentKey'],
    stripeSecretKey: sysVars['stripeSecretKey'],
    stripeWebhookSecret: sysVars['stripeWebhookSecret'],
    magiclinkKey: nextVars['magiclinkKey'],
    bugsSnagApiKey: nextVars['bugsSnagApiKey'],
    enableNftPacks: nextVars['enableNftPacks'],
    splTokenMints: nextVars['splTokenMints'],
    cgSplTokenIds: nextVars['cgSplTokenIds'],
    stripePaymentDescription: sysVars['stripePaymentDescription'],
    strictSubdomain: nextVars['strictSubdomain'],
  },
  publicRuntimeConfig: {
    basePath: basePath  || '',
    subdomain: nextVars['subdomain'],
    publicSolanaNetwork: getSolanaNetwork(),
    publicSolanaRpcHost: getSolanaRpcHost(),
    publicSolanaLabel: nextVars['publicSolanaLabel'],
    publicArweaveCdn: nextVars['publicArweaveCdn'],
    publicGoogleAnalyticsId: nextVars['publicGoogleAnalyticsId'],
    publicBigStore: nextVars['publicBigStore'],
    publicClientId: nextVars['publicClientId'],
    publicStoreAddress: nextVars['publicStoreAddress'],
    publicStoreOwnerAddress: nextVars['publicStoreOwnerAddress'],
    publicStripePublishableKey: nextVars['publicStripePublishableKey'],
    publicMatchmakerAddress: getMatchmakerAddress(),
    publicMatchmakerPort: getMatchmakerPort(),
    nftStorageUploadEndpoint: nextVars['nftStorageUploadEndpoint'],
  },
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
});