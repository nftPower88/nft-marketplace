import React, { useRef, useEffect } from "react";
import CSS from "csstype";

const videoStyles: CSS.Properties = {
  width: "100%",
  height: "100%",
};

type Props = {
  remoteStream: any;
};

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

export default RemoteVideoView;
