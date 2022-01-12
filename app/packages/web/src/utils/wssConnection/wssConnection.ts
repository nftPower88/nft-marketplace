import socketClient from "socket.io-client";
import { store } from "../../store/store";
import * as dashboardActions from "../../store/actions/dashboardActions";
import * as webRTCHandler from "../webRTC/webRTCHandler";

//const SERVER = "http://localhost:5000";
const SERVER = "http://10.10.1.161:8888";

let socket: any;

const broadcastEventTypes = {
  ACTIVE_USERS: "ACTIVE_USERS",
  GROUP_CALL_ROOMS: "GROUP_CALL_ROOMS",
};

export const connectWithWebSocket = () => {
  socket = socketClient(SERVER);
  socket.on("connection", () => {
    console.log("successfully connected with wss socket");
    console.log(socket.id);
  });

  socket.on("broadcast", (data: BroadcastData) => {
    handleBroadcastEvent(data);
  });

  // listeners related to direct call

  socket.on("pre-offer", (data: PreOfferReceiveData) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data: PreOfferAnswerData) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("webRTC-answer", (data: WebRTCAnswerData) => {
    webRTCHandler.handleAnswer(data);
  });

  socket.on("webRTC-offer", (data: WebRTCOfferData) => {
    webRTCHandler.handleOffer(data);
  });

  socket.on("webRTC-candidate", (data: WebRTCCandidateData) => {
    webRTCHandler.handleCandidate(data);
  });

  socket.on("user-hang-up", () => {
    webRTCHandler.handleUserHangUp();
  });
};

export const registerNewUser = (username: string) => {
  socket.emit("register-new-user", {
    socketId: socket.id,
    username: username,
  });
};

// emitting events to server related with direct call

export const sendPreOffer = (data: PreOfferSendData) => {
  socket.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data: PreOfferAnswerData) => {
  socket.emit("pre-offer-answer", data);
};

export const sendWebRTCOffer = (data: WebRTCOfferData) => {
  socket.emit("webRTC-offer", data);
};

export const sendWebRTCAnswer = (data: WebRTCAnswerData) => {
  socket.emit("webRTC-answer", data);
};

export const sendWebRTCCandidate = (data: WebRTCCandidateData) => {
  socket.emit("webRTC-candidate", data);
};

export const sendUserHangUp = (data: any) => {
  socket.emit("user-hang-up", data);
};

const handleBroadcastEvent = (data: BroadcastData) => {
  switch (data.event) {
    case broadcastEventTypes.ACTIVE_USERS:
      const activeUsers: User[] = data.activeUsers.filter(
        (activeUser: User) => activeUser.socketId !== socket.id
      );
      store.dispatch(dashboardActions.setActiveUsers(activeUsers));
      break;
    default:
      break;
  }
};
