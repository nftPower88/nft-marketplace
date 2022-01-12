import React from "react";

import CSS from "csstype";
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdVideoLabel,
  MdVideoCall,
  MdCamera,
} from "react-icons/md";
import ConversationButton from "./ConversationButton";
import {
  hangUp,
} from "../../utils/webRTC/webRTCHandler";

const buttonContainer: CSS.Properties = {
  display: "flex",
  position: "absolute",
  bottom: "22%",
  left: "35%",
};

const icon: CSS.Properties = {
  width: "25px",
  height: "25px",
  fill: "#e6e5e8",
};

type Props = {
  state: CallState;
  hideCallRejectedDialog(callRejected: CallRejected): void;
  setCameraEnabled(enabled: boolean): void;
  setMicrophoneEnabled(enabled: boolean): void;
};

const ConversationButtons = (props: Props) => {
  const {
    localStream,
    localCameraEnabled,
    localMicrophoneEnabled,
    screenSharingActive,
  } = props.state;
  const { setCameraEnabled, setMicrophoneEnabled } = props;

  const handleMicButtonPressed = () => {
    const micEnabled = localMicrophoneEnabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    setMicrophoneEnabled(!micEnabled);
  };

  const handleCameraButtonPressed = () => {
    const cameraEnabled = localCameraEnabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    setCameraEnabled(!cameraEnabled);
  };

  const handleHangUpButtonPressed = () => {
    hangUp();
  };

  return (
    <div style={buttonContainer}>
      <ConversationButton onClickHandler={handleMicButtonPressed}>
        {localMicrophoneEnabled ? (
          <MdMic style={icon} />
        ) : (
          <MdMicOff style={icon} />
        )}
      </ConversationButton>
      <ConversationButton onClickHandler={handleHangUpButtonPressed}>
        <MdCallEnd style={icon} />
      </ConversationButton>
      <ConversationButton onClickHandler={handleCameraButtonPressed}>
        {localCameraEnabled ? (
          <MdVideocam style={icon} />
        ) : (
          <MdVideocamOff style={icon} />
        )}
      </ConversationButton>
    </div>
  );
};

export default ConversationButtons;
