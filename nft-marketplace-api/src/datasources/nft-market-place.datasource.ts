import {inject, lifeCycleObserver, LifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'NFTMarketPlace',
  connector: 'mongodb',
  url: 'mongodb://marketplace:test_password@localhost:27017/nft_backend?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
  host: 'localhost',
  port: 27017,
  user: 'marketplace',
  password: 'test_password',
  database: 'nft_backend',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class NftMarketPlaceDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'NFTMarketPlace';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.NFTMarketPlace', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
   stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
