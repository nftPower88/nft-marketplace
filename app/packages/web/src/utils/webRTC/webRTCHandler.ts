import {
  callStates,
  resetCallDataState,
  setCallerUsername,
  setCallingDialogVisible,
  setCallRejected,
  setCallState,
  setLocalStream,
  setRemoteStream,
  setScreenSharingActive,
} from "../../store/actions/callActions";
import * as wss from "../wssConnection/wssConnection";
import { store } from "../../store/store";
import { stringify } from "querystring";

const preOfferAnswers = {
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_NOT_AVAILABLE: "CALL_NOT_AVAILABLE",
};

const defaultContraints = {
  video: true,
  audio: true,
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:13902",
    },
  ],
};

let connectedUserSocketId: string | null;
let peerConnection: RTCPeerConnection;

export const getLocalStream = () => {
  navigator.mediaDevices
    .getUserMedia(defaultContraints)
    .then((stream) => {
      store.dispatch(setLocalStream(stream));
      store.dispatch(setCallState(callStates.CALL_AVAILABLE));
      createPeerConnection();
    })
    .catch((err) => {
      console.log("error occurred when trying to get local stream");
      console.log(err);
    });
};

export const getRemoteStream2 = () => {
  navigator.mediaDevices
    .getUserMedia(defaultContraints)
    .then((stream) => {
      store.dispatch(setRemoteStream(stream));
    //  store.dispatch(setCallState(callStates.CALL_AVAILABLE));
      // createPeerConnection();
    })
    .catch((err) => {
      console.log("error occurred when trying to get local stream");
      console.log(err);
    });
};
export const getRemoteStream = () => {
  console.log("creating peer connection");
  peerConnection = new RTCPeerConnection(configuration);
  console.log(`connection state: ${peerConnection.connectionState}`);

  console.log("getting peer state");
  const localStream = store.getState().call.localStream;
  console.log(`localStream: ${localStream}`);

  peerConnection.ontrack = ({ streams: [stream] }) => {
    console.log("setting remove server");
    store.dispatch(setRemoteStream(stream));
  };

  peerConnection.onconnectionstatechange = (event: any) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected with other peer");
    } else {
      console.log(`connection state: ${peerConnection.connectionState}`);
    }
  };

  peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log("getting candidates from stun server");
    if (event.candidate) {
      wss.sendWebRTCCandidate({
        candidate: event.candidate,
        connectedUserSocketId: connectedUserSocketId,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event: any) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected with other peer");
    }
  };

  //for (const track of localStream.getTracks()) {
  //  peerConnection.addTrack(track, localStream);
  //}

  peerConnection.ontrack = ({ streams: [stream] }) => {
    store.dispatch(setRemoteStream(stream));
  };

  /*

  navigator.mediaDevices
    .getUserMedia(defaultContraints)
    .then((stream) => {
      store.dispatch(setRemoteStream(stream));
      store.dispatch(setCallState(callStates.CALL_AVAILABLE));
      createPeerConnection();
    })
    .catch((err) => {
      console.log("error occurred when trying to get local stream");
      console.log(err);
    });
  */
};

export const callToOtherUser = (calleeDetails: User) => {
  connectedUserSocketId = calleeDetails.socketId;
  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
  store.dispatch(setCallingDialogVisible(true));
  wss.sendPreOffer({
    callee: calleeDetails,
    caller: {
      username: store.getState().dashboard.username,
    },
  });
};

const createPeerConnection = () => {
  console.log("creating peer connection");
  peerConnection = new RTCPeerConnection(configuration);

  console.log("getting peer state");
  const localStream = store.getState().call.localStream;

  peerConnection.ontrack = ({ streams: [stream] }) => {
    console.log("setting remove server");
    store.dispatch(setRemoteStream(stream));
  };

  for (const track of localStream.getTracks()) {
    console.log("getting remote track");
    peerConnection.addTrack(track, localStream);
  }

  peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log("getting candidates from stun server");
    if (event.candidate) {
      wss.sendWebRTCCandidate({
        candidate: event.candidate,
        connectedUserSocketId: connectedUserSocketId,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event: any) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected with other peer");
    }
  };
};

export const handlePreOffer = (data: PreOfferReceiveData) => {
  if (checkIfCallIsPossible()) {
    connectedUserSocketId = data.callerSocketId;
    store.dispatch(setCallerUsername(data.callerUsername));
    store.dispatch(setCallState(callStates.CALL_REQUESTED));
  } else {
    wss.sendPreOfferAnswer({
      callerSocketId: data.callerSocketId,
      answer: preOfferAnswers.CALL_NOT_AVAILABLE,
    });
  }
};

export const acceptIncomingCallRequest = () => {
  wss.sendPreOfferAnswer({
    callerSocketId: connectedUserSocketId,
    answer: preOfferAnswers.CALL_ACCEPTED,
  });

  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
};

export const rejectIncomingCallRequest = () => {
  wss.sendPreOfferAnswer({
    callerSocketId: connectedUserSocketId,
    answer: preOfferAnswers.CALL_REJECTED,
  });

  resetCallData();
};

export const handlePreOfferAnswer = (data: PreOfferAnswerData) => {
  store.dispatch(setCallingDialogVisible(false));

  if (data.answer === preOfferAnswers.CALL_ACCEPTED) {
    sendOffer();
  } else {
    let rejectionReason: string;
    if (data.answer === preOfferAnswers.CALL_NOT_AVAILABLE) {
      rejectionReason = "Callee is not able to answer";
    } else {
      rejectionReason = "Call rejected";
    }
    store.dispatch(
      setCallRejected({
        rejected: true,
        reason: rejectionReason,
      })
    );

    resetCallData();
  }
};

const sendOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendWebRTCOffer({
    calleeSocketId: connectedUserSocketId,
    offer: offer,
  });
};

export const handleOffer = async (data: WebRTCOfferData) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendWebRTCAnswer({
    callerSocketId: connectedUserSocketId,
    answer: answer,
  });
};

export const handleAnswer = async (data: WebRTCAnswerData) => {
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleCandidate = async (data: WebRTCCandidateData) => {
  try {
    console.log("adding ice candidates");
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured while attempting to add the received ice candidate",
      err
    );
  }
};

export const checkIfCallIsPossible = () => {
  return !(
    store.getState().call.localStream === null ||
    store.getState().call.callState !== callStates.CALL_AVAILABLE
  );
};

let screenSharingStream: MediaStream;


export const handleUserHangUp = () => {
  resetCallDataAfterHangUp();
};

export const hangUp = () => {
  wss.sendUserHangUp({
    connectedUserSocketId: connectedUserSocketId,
  });

  resetCallDataAfterHangUp();
};

const resetCallDataAfterHangUp = () => {
  if (store.getState().call.screenSharingActive) {
    screenSharingStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  store.dispatch(resetCallDataState());
  peerConnection.close();
  createPeerConnection();
  resetCallData();

  const localStream = store.getState().call.localStream;

  localStream.getVideoTracks()[0].enabled = true;
  localStream.getAudioTracks()[0].enabled = true;
};

export const resetCallData = () => {
  connectedUserSocketId = null;
  store.dispatch(setCallState(callStates.CALL_AVAILABLE));
};
