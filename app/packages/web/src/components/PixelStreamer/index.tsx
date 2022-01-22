import React from 'react';
import { UnrealAdapter } from './UnrealAdapter';

const HOST = 'node1.stream.queendom.io';
const PORT = 443;

const PixelStreamer: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Mirror></Mirror>
      </header>
    </div>
  );
};


interface Props {}
interface State {}

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
  }
  
  videoReference = React.createRef<HTMLVideoElement>();
  unrealAdapter = new UnrealAdapter(
    {
      container: document.createElement('div'),
      host: HOST,
      port: PORT,
      useSSL: true,
      useMic: false,
      matchViewPort: true,
    }
  );

  async componentDidUpdate() {
    console.log('testing')
    this.unrealAdapter.load();
    const newPlayer = this.unrealAdapter.player;
    if (!newPlayer) {
      this.unrealAdapter.load();
    }
    if (this.videoReference.current && newPlayer) {
      console.log('this code is executed');
      this.videoReference.current.srcObject = newPlayer.video.srcObject;
      newPlayer.startPlay();
    
    }
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
    return (
      <video
        ref={this.videoReference}
        id="player"
        autoPlay
        muted
        style={{ width: '100%', height: 'auto' }}
      ></video>
    );
  }
}

export default PixelStreamer;
