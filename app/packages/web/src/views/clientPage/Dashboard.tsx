import React, { useEffect } from "react";
import { Provider } from "react-redux"

import * as webRTCHandler from "../../utils/webRTC/webRTCHandler";

import "./Dashboard.module.css";
import ActiveUsersList from "../../components/ActiverUsersList/ActiveUsersList";
import DirectCall from "../../components/DirectCall/DirectCall";
import { store } from "../../store/store";
import PixelStreamer from "../../components/PixelStreamer";


export const DashboardView = () => {
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
          <div className="dashboard_rooms_container background_secondary_color">
            rooms
          </div>
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