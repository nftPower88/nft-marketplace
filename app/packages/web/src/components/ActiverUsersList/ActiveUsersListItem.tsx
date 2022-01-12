import React from "react";

import { callStates } from "../../store/actions/callActions";
import { callToOtherUser } from "../../utils/webRTC/webRTCHandler";

type Props = {
  activeUser: User;
  callState: CallState;
};

const ActiveUsersListItem = ({ activeUser, callState }: Props) => {
  const handleListItemPressed = () => {
    if (callState.callState === callStates.CALL_AVAILABLE) {
      callToOtherUser(activeUser);
    }
  };

  return (
    <div className="active_user_list_item" onClick={handleListItemPressed}>
      <span className="active_user_list_text">{activeUser.username}</span>
    </div>
  );
};

export default ActiveUsersListItem;
