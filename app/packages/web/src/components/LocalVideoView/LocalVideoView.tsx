import React, { useRef, useEffect } from "react";
import CSS from "csstype";

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

const LocalVideoView = ({ localStream }: Props) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream) {
      const localVideo: any = localVideoRef.current;
      localVideo.srcObject = localStream;

      localVideo.onloadedmetadata = () => {
        localVideo.play();
      };
    }
  }, [localStream]);

  return (
    <div style={videoContainerStyles} className="background_secondary_color">
      <video
        style={videoElementStyles}
        ref={localVideoRef}
        autoPlay
        muted
      ></video>
    </div>
  );
};

export default LocalVideoView;
