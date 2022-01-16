import React, { useEffect } from 'react';
import { UnrealAdapter } from './UnrealAdapter';
import { WebRtcPlayer } from './WebRtcPlayer';

const HOST = 'node1.stream.queendom.io';
const PORT = 443;

interface SocketMessage {
  type: 'config' | 'playerCount' | 'answer' | 'iceCandidate';
  peerConnectionOptions?: RTCConfiguration;
  candidate?: RTCIceCandidateInit;
}

export interface UnrealAdapterOptions {
  container: HTMLElement;
  host: string;
  port: number;
  useSSL?: boolean;
  useMic?: boolean;
  matchViewPort?: boolean;
}

const WS_OPEN_STATE = 1;

const ToClientMessageType = {
  QualityControlOwnership: 0,
  Response: 1,
  Command: 2,
  FreezeFrame: 3,
  UnfreezeFrame: 4,
  VideoEncoderAvgQP: 5,
  LatencyTest: 6,
  InitialSettings: 7,
};
const MessageType = {
  /**********************************************************************/

  /*
   * Control Messages. Range = 0..49.
   */
  IFrameRequest: 0,
  RequestQualityControl: 1,
  MaxFpsRequest: 2,
  AverageBitrateRequest: 3,
  StartStreaming: 4,
  StopStreaming: 5,
  LatencyTest: 6,
  RequestInitialSettings: 7,

  /**********************************************************************/

  /*
   * Input Messages. Range = 50..89.
   */

  // Generic Input Messages. Range = 50..59.
  UIInteraction: 50,
  Command: 51,

  // Keyboard Input Message. Range = 60..69.
  KeyDown: 60,
  KeyUp: 61,
  KeyPress: 62,

  // Mouse Input Messages. Range = 70..79.
  MouseEnter: 70,
  MouseLeave: 71,
  MouseDown: 72,
  MouseUp: 73,
  MouseMove: 74,
  MouseWheel: 75,

  // Touch Input Messages. Range = 80..89.
  TouchStart: 80,
  TouchEnd: 81,
  TouchMove: 82,

  // Gamepad Input Messages. Range = 90..99
  GamepadButtonPressed: 90,
  GamepadButtonReleased: 91,
  GamepadAnalog: 92,

  /**************************************************************************/
};

export enum BusinessMessageType {
  init = '0',
}

interface AdapterMessage {
  _message: any;
  _date: string;
  _code: string;
}

class UnrealAdapterHook {
  onAnswer?: (o?: any) => void;
  onConfig?: (o?: any) => void;
  onIceCandidate?: (o?: any) => void;
  onPlayerCount?: (o?: any) => void;
  onMessage?: (m?: AdapterMessage) => void;
}

interface SocketMessage {
  type: 'config' | 'playerCount' | 'answer' | 'iceCandidate';
  peerConnectionOptions?: RTCConfiguration;
  candidate?: RTCIceCandidateInit;
}

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
class Mirror extends React.Component<Props, State, UnrealAdapterHook> {
  private unrealAdapterOption: UnrealAdapterOptions;
  // @ts-ignore
  public player: WebRtcPlayer;
  // @ts-ignore
  private ws: WebSocket;
  private videoResizeTimeout: any;
  options = {
    container: document.createElement('div'),
    host: HOST,
    port: PORT,
    useSSL: true,
    useMic: false,
    matchViewPort: true,
  };

  constructor(props: any, options: UnrealAdapterOptions) {
    super(props);
    this.unrealAdapterOption = options;
  }
  hook = new UnrealAdapterHook();
  videoReference = React.createRef<HTMLVideoElement>();

  public load() {
    this.ws = new WebSocket(
      this.options.useSSL
        ? 'wss://' + this.options.host + ':' + this.options.port
        : 'ws://' + this.options.host + ':' + this.options.port,
    );

    this.ws.onmessage = (event: any) => {
      const data: SocketMessage = JSON.parse(event.data);

      console.log(`onmessage: ${data.type}`);

      switch (data.type) {
        case 'answer':
          this.player.handleReceiveAnswer(data);
          if (this.hook.onAnswer) {
            this.hook.onAnswer(data);
          }
          break;
        case 'config':
          if (data.peerConnectionOptions) {
            this.onPlayerConfig(data.peerConnectionOptions);
          }
          break;
        case 'iceCandidate':
          if (this.player && data.candidate) {
            this.player.handleCandidateFromServer(data.candidate);
          }
          if (this.hook.onIceCandidate) {
            this.hook.onIceCandidate(data.candidate);
          }
          break;
        case 'playerCount':
        default:
      }
    };
    window.addEventListener('orientationchange', () => {
      this.onOrientationChange();
    });
  }

  resizeVideo() {
    if (this.options.matchViewPort) {
      const descriptor = {
        Console:
          'setres ' +
          this.options.container.clientWidth +
          'x' +
          this.options.container.clientHeight,
      };
      this.emitDescriptor(MessageType.UIInteraction, descriptor);
    }
  }

  private onOrientationChange() {
    if (this.videoResizeTimeout) {
      clearTimeout(this.videoResizeTimeout);
      this.videoResizeTimeout = setTimeout(() => {
        this.resizeVideo();
      }, 500);
    }
  }

  private async onPlayerConfig(peerConnectionOptions: RTCConfiguration) {
    this.player = new WebRtcPlayer({
      peerConnectionOptions,
      videoContainer: this.options.container,
      useMic: this.options.useMic ? this.options.useMic : false,
    });
    this.player.onWebRtcOffer = o => {
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        const offerStr = JSON.stringify(o);
        this.ws.send(offerStr);
      }
    };
    this.player.onWebRtcCandidate = o => {
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        this.ws.send(
          JSON.stringify({
            type: 'iceCandidate',
            candidate: o,
          }),
        );
      }
    };
    this.player.onVideoInitialised = () => {
      // console.log('onVideoInitialised');
    };
    this.player.onDataChannelConnected = () => {
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        if (
          this.player.video &&
          this.player.video.srcObject &&
          this.player.onVideoInitialised
        ) {
          this.player.onVideoInitialised();
        }
      }
    };
    this.player.onDataChannelMessage = o => {
      const view = new Uint8Array(o);
      const res = new TextDecoder('utf-16').decode(o.slice(1));
      if (view[0] === ToClientMessageType.Response) {
        if (this.hook.onMessage) {
          try {
            this.hook.onMessage(JSON.parse(res));
          } catch {
            this.hook.onMessage(undefined);
          }
        }
      }
    };
    console.log(`starting WebRTC player`);
    await this.player.setupWrbRtcPlayer();
    if (this.hook.onConfig) {
      this.hook.onConfig(peerConnectionOptions);
    }
  }

  emitUIInteraction(descriptor: any, type: string) {
    Object.assign(descriptor, { _message: 'true', _type: type });
    console.log(descriptor);
    this.emitDescriptor(MessageType.UIInteraction, descriptor);
  }

  emitDescriptor(messageType: number, descriptor: any) {
    // Convert the descriptor object into a JSON string.
    const descriptorAsString = JSON.stringify(descriptor);
    // Add the UTF-16 JSON string to the array byte buffer, going two bytes at
    // a time.
    const data = new DataView(
      new ArrayBuffer(1 + 2 + 2 * descriptorAsString.length),
    );
    let byteIdx = 0;
    data.setUint8(byteIdx, messageType);
    byteIdx++;
    data.setUint16(byteIdx, descriptorAsString.length, true);
    byteIdx += 2;
    for (let i = 0; i < descriptorAsString.length; i++) {
      data.setUint16(byteIdx, descriptorAsString.charCodeAt(i), true);
      byteIdx += 2;
    }
    this.sendInputData(data.buffer);
  }

  sendInputData(data: ArrayBuffer) {
    if (this.player) {
      this.player.send(data);
    }
  }

  async componentDidMount() {
    this.load();
    let newPlayer = await this.player;
    if (!newPlayer) {
      this.load();
    }
    if (this.videoReference.current && newPlayer) {
      console.log('this code is executed');
      //this.player.startPlay();
      //  let videoStream: HTMLVideoElement = await this.player.video;
      //  this.videoReference.current.srcObject = videoStream.srcObject;

      this.videoReference.current.srcObject = newPlayer.video.srcObject;
      newPlayer.startPlay();
      //await this.videoReference.current.play()
    
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
    console.log(`--->      this.options: ${Object.keys(this.options)}`);
    console.log(`--->      this.options.container: ${this.options.container}`);
    console.log(`--->      this.options.container: ${this.options.port}`);
    console.log(`--->      this.options.host: ${this.options.host}`);
    console.log(`--->      this.options.port: ${this.options.port}`);
    console.log(`--->      this.options.useSSL: ${this.options.useSSL}`);
    console.log(`--->      this.options.useMic: ${this.options.useMic}`);
    console.log(
      `--->      this.options.matchViewPort: ${this.options.matchViewPort}`,
    );
    return (
      <video
        ref={this.videoReference}
        id="player"
        autoPlay
        muted
        style={{ width: '100vw', height: 'auto' }}
      ></video>
    );
  }
}

export default PixelStreamer;
// const pixelStreamer = function(){
//     navigator.mediaDevices
//   .getUserMedia({ video: true, audio: false })
//   .then((stream) => (video.srcObject = stream))
//   .catch((error) => {
//     console.warn("【camera】", error);
//     return navigator.mediaDevices.getDisplayMedia({ audio: false });
//   })
//   .then((stream) => (video.srcObject = stream))
//   .catch((error) => {
//     console.warn("【screen capture】", error);
//     setupCanvas();
//   })
//   .finally(() => {
//     setupSignal();
//     window.stream = video.srcObject || canvas.captureStream();
//     stream.track = stream.getVideoTracks()[0];
//     console.log("✅ Unreal Simulator is running!");
//   });

// }
