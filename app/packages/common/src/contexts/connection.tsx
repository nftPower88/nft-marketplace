import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTokenListContainerPromise } from '../utils';
import { TokenInfo, ENV as ChainId } from '@solana/spl-token-registry';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
  Keypair,
  clusterApiUrl,
  Commitment,
  Connection,
  RpcResponseAndContext,
  SignatureStatus,
  SimulatedTransactionResponse,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  Blockhash,
  FeeCalculator,
} from '@solana/web3.js';
import nacl from "tweetnacl";
import { chunks, sleep, useLocalStorageState } from '../utils/utils';
import { notify } from '../utils/notifications';
import { ExplorerLink } from '../components/ExplorerLink';
import { useQuerySearch } from '../hooks';
import { WalletSigner } from './wallet';
import { initCusper } from '@metaplex-foundation/cusper'
import getConfig from 'next/config';

const cusper = initCusper()
const logs = [
  'Program CwrqeMj2U8tFr1Rhkgwc84tpAsqbt9pTt2a4taoTADPr invoke [1]',
  'Program log: Custom program error: 0x07D0',
]

function showError(err?: string) {
  try {
    const error = { ...new Error('Test error'), logs }
    cusper.throwError(error)
  } catch (err) {
    console.error(err)
  }
}


let nextConfig = getConfig();
const publicRuntimeConfig = nextConfig.publicRuntimeConfig;

interface BlockhashAndFeeCalculator {
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
}

export type ENDPOINT_NAME =
  | 'mainnet-beta (Triton)'
  | 'mainnet-beta (Triton Staging)'
  | 'mainnet-beta (Solana)'
  | 'mainnet-beta (Serum)'
  | 'mainnet-beta'
  | 'testnet'
  | 'devnet'
  | 'localnet'
  | 'lending';

export type ENV = ENDPOINT_NAME;

type EndpointMap = {
  name: ENDPOINT_NAME;
  endpoint: string;
  ChainId: ChainId;
};

  export const ENDPOINTS: Array<EndpointMap> = [
  {
    name: publicRuntimeConfig.publicSolanaNetwork,
    endpoint: publicRuntimeConfig.publicSolanaRpcHost, 
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'mainnet-beta (Solana)',
    endpoint: 'https://api.mainnet-beta.solana.com',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'mainnet-beta (Serum)',
    endpoint: 'https://solana-api.projectserum.com/',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    ChainId: ChainId.Testnet,
  },
  {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    ChainId: ChainId.Devnet,
  },
];

const DEFAULT_ENDPOINT = ENDPOINTS[0];
const DEFAULT_CONNECTION_TIMEOUT = 300 * 1000;

interface ConnectionConfig {
  setEndpointMap: (val: string) => void;
  setEndpoint: (val: string) => void;
  connection: Connection;
  endpointMap: EndpointMap;
  endpoint: string;
  env: ENDPOINT_NAME;
  tokens: Map<string, TokenInfo>;
  tokenMap: Map<string, TokenInfo>;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  setEndpointMap: () => { },
  setEndpoint: () => { },
  connection: new Connection(DEFAULT_ENDPOINT.endpoint, 'recent'),
  endpointMap: DEFAULT_ENDPOINT,
  env: ENDPOINTS[0].name,
  endpoint: DEFAULT_ENDPOINT.endpoint,
  tokens: new Map(),
  tokenMap: new Map<string, TokenInfo>(),
});

export function ConnectionProvider({ children }: { children: any }) {
  const searchParams = useQuerySearch();
  const [networkStorage, setNetworkStorage] =
    // @ts-ignore
    useLocalStorageState<ENDPOINT_NAME>('network', DEFAULT_ENDPOINT.name);
  const networkParam = searchParams.get('network');

  const [savedEndpoint, setEndpointMap] = useLocalStorageState(
    'connectionEndpoint',
    ENDPOINTS[0].endpoint,
  );
  const setEndpoint = setEndpointMap

  let maybeEndpoint;
  if (networkParam) {
    let endpointParam = ENDPOINTS.find(({ name }) => name === networkParam);
    if (endpointParam) {
      maybeEndpoint = endpointParam;
    }
  }

  if (networkStorage && !maybeEndpoint?.endpoint) {
    let endpointStorage = ENDPOINTS.find(({ name }) => name === networkStorage);
    if (endpointStorage) {
      maybeEndpoint = endpointStorage;
    }
  }

  const endpointMap = maybeEndpoint|| DEFAULT_ENDPOINT;
  const endpoint = maybeEndpoint?.endpoint|| DEFAULT_ENDPOINT.endpoint;
  

  const { current: connection } = useRef(new Connection(endpointMap.endpoint));

  const [tokens, setTokens] = useState<Map<string, TokenInfo>>(new Map());
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());

  const env =
    ENDPOINTS.find(end => end.endpoint === endpointMap.endpoint)?.name || ENDPOINTS[0].name;

  useEffect(() => {
    function fetchTokens() {
      return getTokenListContainerPromise().then(container => {
        const list = container
          .excludeByTag('nft')
          .filterByChainId(endpointMap.ChainId)
          .getList();

          const knownMints = [...list].reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map<string, TokenInfo>());

        const map = new Map(list.map(item => [item.address, item]));
        setTokenMap(knownMints);
        setTokens(map);
      });
    }

    fetchTokens();
  }, []);

  useEffect(() => {
    function updateNetworkInLocalStorageIfNeeded() {
      if (networkStorage !== endpointMap.name) {
        setNetworkStorage(endpointMap.name);
      }
    }

    updateNetworkInLocalStorageIfNeeded();
  }, []);

  // solana/web3.js closes its websocket connection when the subscription list
  // is empty after opening for the first time, preventing subsequent
  // subscriptions from receiving responses.
  // This is a hack to prevent the list from ever being empty.
  useEffect(() => {
    const id = connection.onAccountChange(
      Keypair.generate().publicKey,
      () => {},
    );
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, []);

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
  }, []);

  const contextValue = React.useMemo(() => {
    return {
      setEndpointMap,
      setEndpoint,
      endpointMap,
      endpoint,
      connection,
      tokens,
      tokenMap,
      env,
    };
  }, [tokens]);

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): Connection {
  return useContext(ConnectionContext).connection;
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  return {
    setEndpointMap: context.setEndpointMap,
    setEndpoint: context.setEndpoint,
    endpointMap: context.endpointMap,
    endpoint: context.endpoint,
    env: context.env,
    tokens: context.tokens,
    tokenMap: context.tokenMap,
  };
}


export const getErrorForTransaction = async (
  connection: Connection,
  txid: string,
) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, 'max');

  const tx = await connection.getParsedConfirmedTransaction(txid);

  const errors: string[] = [];
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach(log => {
      const regex = /Error: (.*)/gm;
      let m;
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
};

export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

export async function sendTransactionsWithManualRetry(
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[][],
  signers: Keypair[][],
) {
  let stopPoint = 0;
  let tries = 0;
  let lastInstructionsLength = null;
  let toRemoveSigners: Record<number, boolean> = {};
  instructions = instructions.filter((instr, i) => {
    if (instr.length > 0) {
      return true;
    } else {
      toRemoveSigners[i] = true;
      return false;
    }
  });
  let filteredSigners = signers.filter((_, i) => !toRemoveSigners[i]);

  while (stopPoint < instructions.length && tries < 3) {
    instructions = instructions.slice(stopPoint, instructions.length);
    filteredSigners = filteredSigners.slice(stopPoint, filteredSigners.length);

    if (instructions.length === lastInstructionsLength) tries = tries + 1;
    else tries = 0;

    try {
      if (instructions.length === 1) {
        await sendTransactionWithRetry(
          connection,
          wallet,
          instructions[0],
          filteredSigners[0],
          'single',
        );
        stopPoint = 1;
      } else {
        stopPoint = await sendTransactions(
          connection,
          wallet,
          instructions,
          filteredSigners,
          SequenceType.StopOnFailure,
          'single',
        );
      }
    } catch (e) {
      console.error(e);
    }
    console.log(
      'Died on ',
      stopPoint,
      'retrying from instruction',
      instructions[stopPoint],
      'instructions length is',
      instructions.length,
    );
    lastInstructionsLength = instructions.length;
  }
}

export const sendTransactionsInChunks = async (
  connection: Connection,
  wallet: WalletSigner,
  instructionSet: TransactionInstruction[][],
  signersSet: Keypair[][],
  sequenceType: SequenceType = SequenceType.Parallel,
  commitment: Commitment = 'singleGossip',
  timeout: number = 120000,
  batchSize: number,
): Promise<number> => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  let instructionsChunk: TransactionInstruction[][][] = [instructionSet];
  let signersChunk: Keypair[][][] = [signersSet];

  instructionsChunk = chunks(instructionSet, batchSize);
  signersChunk = chunks(signersSet, batchSize);

  for (let c = 0; c < instructionsChunk.length; c++) {  
    const unsignedTxns: Transaction[] = [];

    for (let i = 0; i < instructionsChunk[c].length; i++) {
      const instructions = instructionsChunk[c][i];
      const signers = signersChunk[c][i];
      if (instructions.length === 0) {
        continue;
      }
      // const transaction = new Transaction();
      const transaction = new Transaction();
      const block = await connection.getRecentBlockhash(commitment);
      console.log(`sendTransactionsInChunks(${c}/${i}): ${block}`)
      instructions.forEach(instruction => console.log(`instruction: ${instruction}`));

      instructions.forEach(instruction => transaction.add(instruction));
      transaction.recentBlockhash = block.blockhash;
      // signers.forEach(signer => console.log(wallet.publicKey, signer, signer.publicKey));
      // signers.forEach(signer => transaction.addSignature(wallet.publicKey, signer.publicKey));
      transaction.setSigners(
        // fee payed by the wallet owner
        wallet.publicKey,
        ...signers.map(s => s.publicKey)
      );
      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }
      unsignedTxns.push(transaction);
    }

    console.log(`wallet signer: ${wallet.publicKey}`);
    const signedTxns = await wallet.signAllTransactions(unsignedTxns);

    const breakEarlyObject = { breakEarly: false, i: 0 };
    console.log(
      'Signed txns length',
      signedTxns.length,
      'vs handed in length',
      instructionSet.length,
    );
    for (let i = 0; i < signedTxns.length; i++) {
      const signedTxnPromise = sendSignedTransaction({
        connection,
        signedTransaction: signedTxns[i],
        timeout,
      });
      signedTxnPromise.catch(reason => {
        // @ts-ignore
        if (sequenceType === SequenceType.StopOnFailure) {
          breakEarlyObject.breakEarly = true;
          breakEarlyObject.i = i;
        }
      });

      try {
        await signedTxnPromise;
      } catch (e) {
        console.log('Caught failure', e);
        if (breakEarlyObject.breakEarly) {
          console.log('Died on ', breakEarlyObject.i);
          return breakEarlyObject.i; // Return the txn we failed on by index
        }
      }
    }
  }

  return instructionSet.length;
};

export const sendTransactions = async (
  connection: Connection,
  wallet: WalletSigner,
  instructionSet: TransactionInstruction[][],
  signersSet: Keypair[][],
  sequenceType: SequenceType = SequenceType.Parallel,
  commitment: Commitment = 'singleGossip',
  successCallback: (txid: string, ind: number) => void = (txid, ind) => {},
  failCallback: (reason: string, ind: number) => boolean = (txid, ind) => false,
  block?: BlockhashAndFeeCalculator,
): Promise<number> => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const unsignedTxns: Transaction[] = [];

  if (!block) {
    block = await connection.getRecentBlockhash(commitment);
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];
    const signers = signersSet[i];

    if (instructions.length === 0) {
      continue;
    }

    let transaction = new Transaction();
    instructions.forEach(instruction => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map(s => s.publicKey),
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
      // transaction.setSigners(
      //   // fee payed by the wallet owner
      //   wallet.publicKey,
      //   ...signers.map(s => s.publicKey),
      // );
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);

  const pendingTxns: Promise<{ txid: string; slot: number }>[] = [];

  let breakEarlyObject = { breakEarly: false, i: 0 };
  console.log(
    'Signed txns length',
    signedTxns.length,
    'vs handed in length',
    instructionSet.length,
  );
  for (let i = 0; i < signedTxns.length; i++) {
    console.log(`signedTransaction ${i}: ${signedTxns[i]}`);
    const signedTxnPromise = sendSignedTransaction({
      connection,
      signedTransaction: signedTxns[i],
    });

    signedTxnPromise
      .then(({ txid, slot }) => {
        successCallback(txid, i);
      })
      .catch(reason => {
        // @ts-ignore
        failCallback(signedTxns[i], i);
        if (sequenceType === SequenceType.StopOnFailure) {
          breakEarlyObject.breakEarly = true;
          breakEarlyObject.i = i;
        }
      });

    if (sequenceType !== SequenceType.Parallel) {
      try {
        await signedTxnPromise;
      } catch (e) {
        console.log('Caught failure', e);
        if (breakEarlyObject.breakEarly) {
          console.log('Died on ', breakEarlyObject.i);
          return breakEarlyObject.i; // Return the txn we failed on by index
        }
      }
    } else {
      pendingTxns.push(signedTxnPromise);
    }
  }

  if (sequenceType !== SequenceType.Parallel) {
    await Promise.all(pendingTxns);
  }

  return signedTxns.length;
};

export const sendTransactionsWithRecentBlock = async (
  connection: Connection,
  wallet: WalletSigner,
  instructionSet: TransactionInstruction[][],
  signersSet: Keypair[][],
  commitment: Commitment = 'singleGossip',
): Promise<number> => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const unsignedTxns: Transaction[] = [];

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];
    const signers = signersSet[i];

    if (instructions.length === 0) {
      continue;
    }

    const block = await connection.getRecentBlockhash(commitment);
    await sleep(1200);

    const transaction = new Transaction();
    instructions.forEach(instruction => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;

    signers.forEach(signer => console.log(wallet.publicKey, signer, signer.publicKey));
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map(s => s.publicKey),
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);

  const breakEarlyObject = { breakEarly: false, i: 0 };
  console.log(
    'Signed txns length',
    signedTxns.length,
    'vs handed in length',
    instructionSet.length,
  );
  for (let i = 0; i < signedTxns.length; i++) {
    const signedTxnPromise = sendSignedTransaction({
      connection,
      signedTransaction: signedTxns[i],
    });

    signedTxnPromise.catch(() => {
      breakEarlyObject.breakEarly = true;
      breakEarlyObject.i = i;
    });

    try {
      await signedTxnPromise;
    } catch (e) {
      console.log('Caught failure', e);
      if (breakEarlyObject.breakEarly) {
        console.log('Died on ', breakEarlyObject.i);
        return breakEarlyObject.i; // Return the txn we failed on by index
      }
    }
  }

  return signedTxns.length;
};

export const sendTransaction = async (
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  awaitConfirmation = true,
  commitment: Commitment = 'singleGossip',
  includesFeePayer: boolean = false,
  block?: BlockhashAndFeeCalculator,
) => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  let transaction = new Transaction();
  instructions.forEach(instruction => transaction.add(instruction));
  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash;

  if (includesFeePayer) {
    // transaction.setSigners(...signers.map(s => s.publicKey));
    transaction.partialSign(...signers);
  } else {
    signers.forEach(signer => console.log(wallet.publicKey, signer, signer.publicKey));
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map(s => s.publicKey)
    );
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers);
    // transaction.setSigners(
    //   // fee payed by the wallet owner
    //   wallet.publicKey,
    //   ...signers.map(s => s.publicKey),
    // );
  }
  if (!includesFeePayer) {
    // transaction.feePayer = wallet.publicKey;
    transaction = await wallet.signTransaction(transaction);
  }

  const rawTransaction = transaction.serialize();
  let options = {
    skipPreflight: true,
    commitment,
  };

  const txid = await connection.sendRawTransaction(rawTransaction, options);
  let slot = 0;

  if (awaitConfirmation) {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      DEFAULT_TIMEOUT,
      connection,
      commitment,
    );
    console.log(`confirmation -->>> : ${confirmation}`);

    if (!confirmation)
      throw new Error('Timed out awaiting confirmation on transaction');
    slot = confirmation?.slot || 0;

    if (confirmation?.err) {
      const errors = await getErrorForTransaction(connection, txid);
      notify({
        message: 'Transaction failed...',
        description: (
          <>
            {errors.map(err => (
              <div>{err}</div>
            ))}
            <ExplorerLink address={txid} type="transaction" />
          </>
        ),
        type: 'error',
      });

      throw new Error(
        `Raw transaction ${txid} failed (${JSON.stringify(status)})`,
      );
    }
  }

  return { txid, slot };
};

export const sendTransactionWithRetry = async (
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  commitment: Commitment = 'singleGossip',
  includesFeePayer: boolean = false,
  block?: BlockhashAndFeeCalculator,
  beforeSend?: () => void,
) => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  console.log(`sendTransactionWithRetry; wallet: ${wallet.publicKey}`)
  console.log(`sendTransactionWithRetry; instructions: ${instructions}`)
  console.log(`sendTransactionWithRetry; signers: ${signers.flat}`)
  console.log(`sendTransactionWithRetry; commitment: ${commitment}`)
  console.log(`sendTransactionWithRetry; includesFeePayer: ${includesFeePayer.valueOf}`)


  let transaction = new Transaction({ feePayer: wallet.publicKey});
  instructions.forEach(instruction => transaction.add(instruction));
  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash;

  
  showError()


  console.log(`signedTransaction2; feePayer: ${transaction.feePayer}`);
  console.log(`signedTransaction2; instructions: ${transaction.instructions}`);
  console.log(`signedTransaction2; nonceInfo: ${transaction.nonceInfo}`);
  console.log(`signedTransaction2; recentBlockhash: ${transaction.recentBlockhash}`);
  console.log(`signedTransaction2; signature: ${transaction.signature}`);

  if (!includesFeePayer) {
    // console.log(`store paying for transaction?: ${wallet.publicKey}`);
    // transaction.feePayer = wallet.publicKey;
    transaction = await wallet.signTransaction(transaction);

    let isVerifiedSignature = transaction.verifySignatures();
    console.log(`The signatures were verifed: ${isVerifiedSignature}`)
    
    console.log(`sendTransactionWithRetry; post-sign`)
  }

  console.log(`sendTransactionWithRetry; pre-beforeSend`)
  if (beforeSend) {
    console.log(`sendTransactionWithRetry; pre-beforeSend`)
    beforeSend();
  }
  const { txid, slot } = await sendSignedTransaction({
    connection,
    signedTransaction: transaction,
  });
  // const { txid, slot } = await sendSignedTransaction({
  //   connection,
  //   signedTransaction: transaction,
  // });
  console.log(`sendTransactionWithRetry; txid: ${txid}`)

  return { txid, slot };
};

// export const sendTransactionWithRetry = async (
//   connection: Connection,
//   wallet: WalletSigner,
//   instructions: TransactionInstruction[],
//   signers: Keypair[],
//   commitment: Commitment = 'singleGossip',
//   includesFeePayer: boolean = false,
//   block?: BlockhashAndFeeCalculator,
//   beforeSend?: () => void,
// ): Promise<{ txid: string, slot: number }> => {
//   if (!wallet.publicKey) throw new WalletNotConnectedError();

//   let transaction = new Transaction();
//   instructions.forEach(instruction => transaction.add(instruction));
//   transaction.recentBlockhash = (
//     block || (await connection.getRecentBlockhash(commitment))
//   ).blockhash;

//   if (includesFeePayer) {
//     transaction.setSigners(...signers.map(s => s.publicKey));
//   } else {
//     transaction.setSigners(
//       // fee payed by the wallet owner
//       wallet.publicKey,
//       ...signers.map(s => s.publicKey),
//     );
//   }

//   if (signers.length > 0) {
//     transaction.partialSign(...signers);
//   }
//   if (!includesFeePayer) {
//     transaction = await wallet.signTransaction(transaction);
//   }

//   if (beforeSend) {
//     beforeSend();
//   }

//   const { txid, slot } = await sendSignedTransaction({
//     connection,
//     signedTransaction: transaction,
//   });

//   return { txid, slot };
// };

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

const DEFAULT_TIMEOUT = 15000;

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction;
  connection: Connection;
  sendingMessage?: string;
  sentMessage?: string;
  successMessage?: string;
  timeout?: number;
}): Promise<{ txid: string; slot: number }> {
  console.log(`sendSignedTransaction; feePayer: ${signedTransaction.feePayer}`);
  console.log(`sendSignedTransaction; instructions: ${signedTransaction.instructions}`);
  console.log(`sendSignedTransaction; nonceInfo: ${signedTransaction.nonceInfo}`);
  console.log(`sendSignedTransaction; recentBlockhash: ${signedTransaction.recentBlockhash}`);
  console.log(`sendSignedTransaction; signature: ${signedTransaction.signature}`);

  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  let slot = 0;
  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    },
  );

  console.log('Started awaiting confirmation for', txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(500);
    }
  })();
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      'recent',
      true,
    );

    if (!confirmation)
      throw new Error('Timed out awaiting confirmation on transaction');

    if (confirmation.err) {
      console.error(confirmation.err);
      throw new Error('Transaction failed: Custom instruction error');
    }

    slot = confirmation?.slot || 0;
  } catch (err: any) {
    console.error('Timeout Error caught', err);
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction');
    }
    let simulateResult: SimulatedTransactionResponse | null = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, 'single')
      ).value;
    } catch (e) {}
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line.startsWith('Program log: ')) {
            throw new Error(
              'Transaction failed: ' + line.slice('Program log: '.length),
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err));
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true;
  }

  console.log('Latency', txid, getUnixTs() - startTime);
  return { txid, slot };
}

async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment,
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching,
  );

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString('base64');
  const config: any = { encoding: 'base64', commitment };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest('simulateTransaction', args);
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message);
  }
  return res.result;
}


async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false,
): Promise<SignatureStatus | null | void> {
  let done = false;
  let status: SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log('Rejecting for timeout...');
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            console.log('Rejected via websocket', result.err);
            reject(status);
          } else {
            console.log('Resolved via websocket', result);
            resolve(status);
          }
        },
        commitment,
      );
    } catch (e) {
      done = true;
      console.error('WS error in setup', txid, e);
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              console.log('REST null result for', txid, status);
            } else if (status.err) {
              console.log('REST error for', txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log('REST no confirmations for', txid, status);
            } else {
              console.log('REST confirmation for', txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log('REST connection error: txid', txid, e);
          }
        }
      })();
      await sleep(2000);
    }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId);
  done = true;
  console.log('Returning status', status);
  return status;
}
