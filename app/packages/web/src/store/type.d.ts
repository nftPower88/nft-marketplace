type DashboardState = {
  username: string;
  activeUsers: User[];
};

type CallState = {
  localStream: any;
  remoteStream: any;
  callState: string;
  callingDialogVisible: boolean;
  callerUsername: string;
  callRejected: CallRejected;
  localCameraEnabled: boolean;
  localMicrophoneEnabled: boolean;
  screenSharingActive: boolean;
};

type CallRejected = {
  rejected: boolean;
  reason: string;
};

type User = {
  socketId: string;
  username: string;
};

type Caller = {
  username: string;
};

type BroadcastData = {
  event: string;
  activeUsers: User[];
};

type PreOfferReceiveData = {
  callerUsername: string;
  callerSocketId: string;
};

type PreOfferSendData = {
  callee: User;
  caller: Caller;
};

type PreOfferAnswerData = {
  callerSocketId: string | null;
  answer: string;
};

type WebRTCOfferData = {
  calleeSocketId: string | null;
  offer: any;
};

type WebRTCAnswerData = {
  callerSocketId: string | null;
  answer: any;
};

type WebRTCCandidateData = {
  candidate: RTCIceCandidate;
  connectedUserSocketId: string | null;
};
