import React from "react";

import ActiveUsersListItem from "./ActiveUsersListItem";

import "./ActiveUsersList.module.css";
import { connect } from "react-redux";
import { RootState } from "../../store/store";

interface Props {
  state: DashboardState;
  callState: CallState;
}

const ActiveUsersList = (props: Props) => {
  return (
    <div className="active_user_list_container">
      {props.state.activeUsers.map((activeUser: User) => (
        <ActiveUsersListItem
          key={activeUser.socketId}
          activeUser={activeUser}
          callState={props.callState}
        />
      ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    state: state.dashboard,
    callState: state.call,
  };
};

export default connect(mapStateToProps)(ActiveUsersList);
