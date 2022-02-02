import React, { useEffect } from "react";
import { Provider } from "react-redux"

import * as webRTCHandler from "../../utils/webRTC/webRTCHandler";

import "./style.module.css";
import ActiveUsersList from "../../components/ActiverUsersList/ActiveUsersList";
import { store } from "../../store/store";
import PixelStreamer from "../../components/PixelStreamer";


export const ClientPageView = () => {
  useEffect(() => {
    webRTCHandler.getRemoteStream();
  }, []);

  return (
    <Provider store={store}>
      <div className="client_container background_main_color">
        <div className="client_left_section">
          <div className="client_content_container">
              {/* <DirectCall />*/}
              <PixelStreamer />
          </div>
          <div className="client_rooms_container background_secondary_color">
          </div>
        </div>
        <div className="client_right_section background_secondary_color">
          <div className="client_active_users_list">
            <ActiveUsersList />
          </div>
        </div>
      </div>
    </Provider>
  );
};