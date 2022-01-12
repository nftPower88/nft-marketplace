import React from "react";
import { connect } from "react-redux";
import {
  callStates,
  setCallRejected,
  setLocalCameraEnabled,
  setLocalMicrophoneEnabled,
} from "../../store/actions/callActions";
import { AppDispatch, RootState } from "../../store/store";
import CallingDialog from "../CallingDialog/CallingDialog";
import CallRejectedDialog from "../CallRejectedDialog/CallRejectedDialog";
import ConversationButtons from "../ConversationButtons/ConversationButtons";
import IncomingCallDialog from "../IncomingCallDialog/IncomingCallDialog";
import LocalVideoView from "../LocalVideoView/LocalVideoView";
import RemoteVideoView from "../RemoteVideoView/RemoteVideoView";

type Props = {
  state: CallState;
  hideCallRejectedDialog(callRejected: CallRejected): void;
  setCameraEnabled(enabled: boolean): void;
  setMicrophoneEnabled(enabled: boolean): void;
};

const DirectCall = (props: Props) => {
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
      {/*<LocalVideoView localStream={localStream} />*/}
      <LocalVideoView localStream={localStream} />
      <RemoteVideoView remoteStream={remoteStream} />
      {remoteStream && callState === callStates.CALL_IN_PROGRESS && (
        <RemoteVideoView remoteStream={remoteStream} />
      )}
      {callRejected.rejected && (
        <CallRejectedDialog
          reason={callRejected.reason}
          hideCallRejectedDialog={props.hideCallRejectedDialog}
        />
      )}
      {callState === callStates.CALL_REQUESTED && (
        <IncomingCallDialog callerUsername={callerUsername} />
      )}
      {callingDialogVisible && <CallingDialog />}
      {remoteStream && callState === callStates.CALL_IN_PROGRESS && (
        <ConversationButtons {...props} />
      )}
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
