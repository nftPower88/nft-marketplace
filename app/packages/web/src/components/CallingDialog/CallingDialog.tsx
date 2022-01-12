import React from "react";
import { MdCallEnd } from "react-icons/md";
import { hangUp } from "../../utils/webRTC/webRTCHandler";
import CSS from "csstype";

import "./CallingDialog.module.css";

const buttonContainer: CSS.Properties = {
  marginTop: '10px',
  width: '40px',
  height: '40px',
  borderRadius: '40px',
  border: '2px solid #e6e5e8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const icon: CSS.Properties = {
  width: '20px',
  height: '20px',
  fill: '#e6e5e8'
}

const CallingDialog = () => {

  const handleHangUpButtonPressed = () => {
    hangUp();
  }

  return (
    <div className="direct_calling_dialog background_secondary_color">
      <span>Calling</span>
      <div style={buttonContainer} onClick={handleHangUpButtonPressed}>
        <MdCallEnd style={icon}/>
      </div>
    </div>
  );
};

export default CallingDialog;
