import React from "react";
import { connect } from "react-redux";
import {
  callStates,
  setCallRejected,
  setLocalCameraEnabled,
  setLocalMicrophoneEnabled,
} from "../../store/actions/callActions";
import { AppDispatch, RootState } from "../../store/store";
import CallingDialog from "../../components/CallingDialog/CallingDialog";
import CallRejectedDialog from "../../components/CallRejectedDialog/CallRejectedDialog";
import ConversationButtons from "../../components/ConversationButtons/ConversationButtons";
import IncomingCallDialog from "../../components/IncomingCallDialog/IncomingCallDialog";
import LocalVideoView from "../../components/LocalVideoView/LocalVideoView";
import RemoteVideoView from "../../components/RemoteVideoView/RemoteVideoView";
import DirectCall from "../../components/DirectCall/DirectCall";

type Props = {
  state: CallState;
  setCameraEnabled(enabled: boolean): void;
  setMicrophoneEnabled(enabled: boolean): void;
};

export const ClientPageView = (props: Props) => {
  const {
    localStream,
    remoteStream,
    callState,
    callerUsername,
    callingDialogVisible,
    callRejected,
  } = props.state;

  return (
    <>
      <LocalVideoView localStream={localStream} />
      {remoteStream && callState === callStates.CALL_IN_PROGRESS && (
        <RemoteVideoView remoteStream={remoteStream} />
      )}
      {callState === callStates.CALL_REQUESTED && (
        <IncomingCallDialog callerUsername={callerUsername} />
      )}
      {callingDialogVisible && <CallingDialog />}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    state: state.call,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    hideCallRejectedDialog: (callRejectedDetails: CallRejected) =>
      dispatch(setCallRejected(callRejectedDetails)),
    setCameraEnabled: (enabled: boolean) =>
      dispatch(setLocalCameraEnabled(enabled)),
    setMicrophoneEnabled: (enabled: boolean) =>
      dispatch(setLocalMicrophoneEnabled(enabled)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DirectCall);
