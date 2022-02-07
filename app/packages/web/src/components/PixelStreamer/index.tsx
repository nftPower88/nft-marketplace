import React from 'react';
import { Loading } from '../util/loading';
import { UnrealAdapter } from './UnrealAdapter';
import getConfig from 'next/config';


const { publicRuntimeConfig } = getConfig();

interface Props {
  focus: boolean,
  activeFocus: any,
  strConfig: any
}
interface State {
  loading: boolean,
  videoReference: any
}

const PixelStreamer: React.FC<Props> = ({ focus, activeFocus, strConfig }) => {
  return (
    <div className="App" style={{ height: '100%' }}>
      <header className="App-header" style={{ height: '100%' }}>
        <Mirror focus={focus} activeFocus={activeFocus} strConfig={strConfig}></Mirror>
      </header>
    </div>
  );
};

class Mirror extends React.Component<Props, State> {
  // @ts-ignore
  options = {
    container: document.createElement('div'),
    host: publicRuntimeConfig.publicMatchmakerAddress,
    port: publicRuntimeConfig.publicMatchmakerPort,
    useSSL: true,
    useMic: false,
    matchViewPort: true,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      videoReference: React.createRef<HTMLVideoElement>()
    };
  }

  // videoReference = React.createRef<HTMLVideoElement>();
  unrealAdapter = new UnrealAdapter({
    options: {
      container: document.createElement('div'),
      host: publicRuntimeConfig.publicMatchmakerAddress,
      port: publicRuntimeConfig.publicMatchmakerPort,
      useSSL: true,
      useMic: false,
      matchViewPort: true,
    },
    activeFocus: this.props.activeFocus,
    focus: this.props.focus,
    onChangeLoading:(e: boolean) => {this.setState({ loading: e });  this.props.strConfig(e)}
  });

  async componentDidMount() {
    this.unrealAdapter.connectionConfig();
  }

  async componentWillUnmount() {
    if (this.state.videoReference.current) {
      this.state.videoReference.current.srcObject = null;
    }
  }
  
  async componentDidUpdate(prevProps: any, prevState:any) {
    if(prevState.videoReference.current == null && this.state.videoReference) {
      this.unrealAdapter.load(this.state.videoReference);
    }
    if(this.props.focus) {
      this.unrealAdapter.registerLockedKeyboardEvents();
    } else {
      this.unrealAdapter.registerKeyboardEvents(this.state.videoReference);
    }
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
            : <div id='player-container'>
                <video
                  ref={this.state.videoReference}
                  id="player"
                  autoPlay
                  muted
                  style={{ width: '100%', height: 'auto' }}
                ></video>
            </div>
        }
      </React.Fragment>
    );
  }
}

export default PixelStreamer;
