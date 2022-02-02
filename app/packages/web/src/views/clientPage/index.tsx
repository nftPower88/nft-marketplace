// import React from "react";
// import { connect } from "react-redux";
// import {
//   callStates,
//   setCallRejected,
//   setLocalCameraEnabled,
//   setLocalMicrophoneEnabled,
// } from "../../store/actions/callActions";
// import { AppDispatch, RootState } from "../../store/store";
// import CallingDialog from "../../components/CallingDialog/CallingDialog";
// import CallRejectedDialog from "../../components/CallRejectedDialog/CallRejectedDialog";
// import ConversationButtons from "../../components/ConversationButtons/ConversationButtons";
// import IncomingCallDialog from "../../components/IncomingCallDialog/IncomingCallDialog";
// import LocalVideoView from "../../components/LocalVideoView/LocalVideoView";
// import RemoteVideoView from "../../components/RemoteVideoView/RemoteVideoView";
// import DirectCall from "../../components/DirectCall/DirectCall";
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';

import * as webRTCHandler from '../../utils/webRTC/webRTCHandler';

import './Dashboard.module.css';
import ActiveUsersList from '../../components/ActiverUsersList/ActiveUsersList';
import DirectCall from '../../components/DirectCall/DirectCall';
import { store } from '../../store/store';
import PixelStreamer from '../../components/PixelStreamer';

// type Props = {
//   state: CallState;
//   setCameraEnabled(enabled: boolean): void;
//   setMicrophoneEnabled(enabled: boolean): void;
// };

// export const ClientPageView = (props: Props) => {
//   const {
//     localStream,
//     remoteStream,
//     callState,
//     callerUsername,
//     callingDialogVisible,
//     callRejected,
//   } = props.state;

//   return (
//     <>
//       <LocalVideoView localStream={localStream} />
//       {remoteStream && callState === callStates.CALL_IN_PROGRESS && (
//         <RemoteVideoView remoteStream={remoteStream} />
//       )}
//       {callState === callStates.CALL_REQUESTED && (
//         <IncomingCallDialog callerUsername={callerUsername} />
//       )}
//       {callingDialogVisible && <CallingDialog />}
//     </>
//   );
// };

// const mapStateToProps = (state: RootState) => {
//   return {
//     state: state.call,
//   };
// };

// const mapDispatchToProps = (dispatch: AppDispatch) => {
//   return {
//     hideCallRejectedDialog: (callRejectedDetails: CallRejected) =>
//       dispatch(setCallRejected(callRejectedDetails)),
//     setCameraEnabled: (enabled: boolean) =>
//       dispatch(setLocalCameraEnabled(enabled)),
//     setMicrophoneEnabled: (enabled: boolean) =>
//       dispatch(setLocalMicrophoneEnabled(enabled)),
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(DirectCall);

export const ClientPageView = () => {
  useEffect(() => {
    //  webRTCHandler.getLocalStream();
    webRTCHandler.getRemoteStream();
  }, []);

  return (
    <Provider store={store}>
      <div className="dashboard_container background_main_color">
        <div className="dashboard_left_section">
          <div className="dashboard_content_container">
            {/* <DirectCall />*/}
            <PixelStreamer />
          </div>
          <div className="dashboard_rooms_container background_secondary_color"></div>
        </div>
        <div className="dashboard_right_section background_secondary_color">
          <div className="dashboard_active_users_list">
            <ActiveUsersList />
          </div>
        </div>
      </div>
    </Provider>
  );
};
