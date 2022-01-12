import React, { useRef, useEffect } from "react";
import { LABELS } from '../../constants';
import { InstructionsLayout } from '../../components/InstructionsLayout'
import { Layout } from 'antd';
import { MetaplexMasonry } from '../../components/MetaplexMasonry';
import { UnrealAdapter, WebRtcPlayer } from 'unreal-pixelstreaming-node';
import CSS from "csstype";

//import socketAdapter from './websocket';
//let streamerServer = new WebSocket.Server({port: streamerPort, backlog: 1});
//let streamer; // WebSocket connected to Streamer
//streamerServer.on('connection', function (ws, req) {
//    console.log(`Streamer connected: ${req.connection.remoteAddress}`);

/*
function Component() {
  React.useEffect(() => import("wc-spinners/dist/atom-spinner.js")
  , [])
  return (<div>
        // etc
        <atom-spinner />
        </div>)
}
*/

/*
let unrealAdapter = new UnrealAdapter({
    container = Layout;
    host = "10.10.1.161",
    port = 80,
    useSSL = false,
    useMic = false,
    matchViewPort = false,
})
*/

const videoStyles: CSS.Properties = {
  width: "100%",
  height: "100%",
};

const videoContainerStyles: CSS.Properties = {
  width: "150px",
  height: "150px",
  borderRadius: "8px",
  position: "absolute",
  top: "5%",
  right: "23%",
};

const videoElementStyles: CSS.Properties = {
  width: "100%",
  height: "100%",
};

type Props = {
  localStream: any;
};

/*
type Props = {
  remoteStream: any;
};
*/

export const ClientPageView = ({ localStream }: Props) => {
  const unrealVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream) {
      const localVideo: any = unrealVideoRef.current;
      localVideo.srcObject = localStream;

      localVideo.onloadedmetadata = () => {
        localVideo.play();
      };
    }
  }, [localStream]);

  const unrealAdapter = new UnrealAdapter({
    container: localStream,
    host: "10.10.1.161",
    port: 80,
    useSSL: false,
    useMic: false,
    matchViewPort: false,
})


  return (
    <Layout title="WebRTC Client Page">
    <div className="page-container">
      <h1>Client:</h1>
      <div style={videoContainerStyles} className="background_secondary_color">
        <video
          style={videoElementStyles}
          ref={unrealVideoRef}
          autoPlay
          muted
        ></video>
        { unrealAdapter }
      </div>
    </div>
  </Layout>
  );
};

/*
const RemoteVideoView = (props: Props) => {
  const { remoteStream } = props;
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteStream) {
      const localVideo: any = remoteVideoRef.current;
      localVideo.srcObject = remoteStream;

      localVideo.onloadedmetadata = () => {
        localVideo.play();
      };
    }
  }, [remoteStream]);

  return (
    <div style={videoStyles} className="background_secondary_color">
      <video ref={remoteVideoRef} style={videoStyles} autoPlay></video>
    </div>
  );
};
*/