import React from 'react';
import { Loading } from '../util/loading';
import { UnrealAdapter } from './UnrealAdapter';

const HOST = 'node101.stream.queendom.io';
const PORT = 443;

const PixelStreamer: React.FC = () => {
  return (
    <div className="App" style={{ height: '100%' }}>
      <header className="App-header" style={{ height: '100%' }}>
        <Mirror></Mirror>
      </header>
    </div>
  );
};


interface Props { }
interface State {
  loading: boolean
}

class Mirror extends React.Component<Props, State> {
  // @ts-ignore
  options = {
    container: document.createElement('div'),
    host: HOST,
    port: PORT,
    useSSL: true,
    useMic: false,
    matchViewPort: true,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      loading: true
    };
  }

  videoReference = React.createRef<HTMLVideoElement>();
  unrealAdapter = new UnrealAdapter({
    options: {
      container: document.createElement('div'),
      host: HOST,
      port: PORT,
      useSSL: true,
      useMic: false,
      matchViewPort: true,
    },
    onChangeLoading:(e: boolean) => this.setState({ loading: e })
  });

  async componentDidMount() {
    this.unrealAdapter.load(this.videoReference);
  }

  async componentWillUnmount() {
    if (this.videoReference.current) {
      this.videoReference.current.srcObject = null;
    }
  }
  
  async componentDidUpdate() {
    // console.log('testing')
    // this.unrealAdapter.load();
    // const newPlayer = this.unrealAdapter.player;
    // if (!newPlayer) {
    //   this.unrealAdapter.load();
    // }
    // if (this.videoReference.current && newPlayer) {
    //   console.log('this code is executed');
    //   this.videoReference.current.srcObject = newPlayer.video.srcObject;
    //   newPlayer.startPlay();

    // }
    // Load video @TODO: make autoplay back, make bitrate dynamic?
    /*
      if (this.videoReference.current) {
        this.videoReference.current.src = "/video/demo.mp4";
        await this.videoReference.current.play(); //@TODO make this play a loop
      };
      */

    // Camera Debug Test
    /*
      if (this.videoReference.current) {
          let videoStream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
          this.videoReference.current.srcObject = videoStream
      };
      */
  }

  render() {
    const { loading } = this.state;
    return (
      <React.Fragment>
        {
          loading ? <Loading description="Entering the metaverse ..." />
            : <video
              ref={this.videoReference}
              id="player"
              autoPlay
              muted // do we want this?
              style={{ width: '100%' }}
            ></video>
        }
      </React.Fragment>
    );
  }
}

export default PixelStreamer;
